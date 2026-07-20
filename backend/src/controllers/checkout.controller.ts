import { Context } from 'hono';
import Stripe from 'stripe';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { Address } from '../models/Address';
import { Coupon } from '../models/Coupon';
import { Types } from 'mongoose';
import { isE2ETestMode } from '../lib/e2e';
import { resolveCouponDiscount } from '../lib/coupons';

const getStripeClient = () => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured in backend environment');
  }

  return new Stripe(stripeSecretKey);
};

/**
 * Creates (or reuses) a PaymentIntent for the embedded Stripe Payment Element flow.
 *
 * Behavior:
 *  - Validates the cart from the client (only productIds + quantities are trusted).
 *  - Recomputes the total server-side from MongoDB prices (the client never controls amount).
 *  - Reuses the most recent pending Order for this user with the same item signature when present,
 *    updating its PaymentIntent amount instead of creating a new pending order on retry.
 *  - Returns { clientSecret, orderId, amount } for the frontend Elements provider.
 */
export const createPaymentIntentController = async (c: Context) => {
  try {
    const userId = c.get('userId');

    if (!userId) {
      return c.json({ error: 'User authenticated but ID missing in context' }, 401);
    }

    const body = await c.req.json();
    const cartItems = body.items as { productId: string; quantity: number }[];

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return c.json({ error: 'Cart cannot be empty' }, 400);
    }

    for (const item of cartItems) {
      if (!item.productId || typeof item.productId !== 'string') {
        return c.json({ error: 'Invalid productId: expected string' }, 400);
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
        return c.json({ error: 'Invalid quantity: must be a positive number' }, 400);
      }
    }

    const invalidId = cartItems.find((item) => !Types.ObjectId.isValid(item.productId));
    if (invalidId) {
      return c.json({ error: `Invalid productId format: ${invalidId.productId}` }, 400);
    }

    // Direccion de entrega guardada (HU-32): opcional; si se envia, debe
    // pertenecer al usuario autenticado. Se guarda como snapshot en la
    // orden, no como referencia viva a la Address.
    const addressId = body.addressId as string | undefined;
    let shippingAddress: Record<string, string> | undefined;

    if (addressId !== undefined) {
      if (typeof addressId !== 'string' || !Types.ObjectId.isValid(addressId)) {
        return c.json({ error: 'Invalid addressId format' }, 400);
      }

      const address = await Address.findOne({ _id: addressId, userId });
      if (!address) {
        return c.json({ error: 'Direccion de entrega no encontrada' }, 400);
      }

      shippingAddress = {
        recipientName: address.recipientName,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
      };
    }

    const productIds = cartItems.map((item) => new Types.ObjectId(item.productId));
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    if (dbProducts.length !== cartItems.length) {
      return c.json({ error: 'One or more products not found in database' }, 400);
    }

    // Server-side amount recomputation — never trust client prices.
    let totalAmount = 0;
    const validItems: { product: any; quantity: number }[] = [];

    for (const item of cartItems) {
      const dbProduct = dbProducts.find((p) => p._id.toString() === item.productId);
      if (!dbProduct) {
        return c.json({ error: `Product mismatch: ${item.productId}` }, 400);
      }
      if (dbProduct.stock < item.quantity) {
        return c.json({ error: `Insufficient stock for product: ${dbProduct.name}` }, 400);
      }
      totalAmount += dbProduct.price * item.quantity;
      validItems.push({ product: dbProduct, quantity: item.quantity });
    }

    // Cupon de descuento (HU-39): se resuelve sobre el subtotal recien
    // calculado, antes de bifurcar en E2E/real, para que ambos caminos y el
    // total guardado en la orden reflejen el mismo descuento. Un cupon
    // invalido/expirado no bloquea el checkout: simplemente no se aplica y
    // se informa un aviso, para no dejar el pago sin PaymentIntent.
    const couponCodeInput = typeof body.couponCode === 'string' && body.couponCode.trim()
      ? body.couponCode.trim().toUpperCase()
      : undefined;
    let discountAmount = 0;
    let appliedCouponCode: string | undefined;
    let couponWarning: string | undefined;

    if (couponCodeInput) {
      const coupon = await Coupon.findOne({ code: couponCodeInput });
      const resolution = resolveCouponDiscount(coupon as any, totalAmount);
      if (resolution.valid) {
        discountAmount = resolution.discountAmount;
        appliedCouponCode = couponCodeInput;
      } else {
        couponWarning = resolution.reason;
      }
    }

    totalAmount = Math.max(0, totalAmount - discountAmount);

    const amountInCents = Math.round(totalAmount * 100);

    // Ensure local user exists (mirrors prior behavior).
    let localUser = await import('../models/User').then((m) => m.User.findOne({ clerk_id: userId }));
    if (!localUser) {
      let realEmail = `${userId}@clerk-auth.local`;
      try {
        const { createClerkClient } = await import('@clerk/backend');
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const clerkUser = await clerk.users.getUser(userId);
        if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
          realEmail = clerkUser.emailAddresses[0].emailAddress;
        }
      } catch (err) {
        console.error('Error fetching real email from Clerk during checkout:', err);
      }

      localUser = await import('../models/User').then((m) =>
        m.User.create({
          clerk_id: userId,
          email: realEmail,
          role: 'user',
        }),
      );
    }

    // Build a stable signature of the cart so we can reuse a pending order on retry.
    const cartSignature = [...cartItems]
      .sort((a, b) => a.productId.localeCompare(b.productId))
      .map((i) => `${i.productId}:${i.quantity}`)
      .join('|');

    // Look for an existing pending order for this user with a matching signature.
    const candidatePendingOrders = await Order.find({ userId, status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(10);

    let reusableOrder: any = null;
    for (const candidate of candidatePendingOrders) {
      const candidateItems = await OrderItem.find({ order_id: candidate._id });
      const sig = [...candidateItems]
        .map((i) => ({ productId: String(i.product_id), quantity: i.quantity }))
        .sort((a, b) => a.productId.localeCompare(b.productId))
        .map((i) => `${i.productId}:${i.quantity}`)
        .join('|');
      if (sig === cartSignature) {
        reusableOrder = candidate;
        break;
      }
    }

    let order = reusableOrder;
    let paymentIntent: Stripe.PaymentIntent | null = null;
    let e2ePaymentIntentId: string | null = null;

    if (isE2ETestMode && String(userId).startsWith('e2e-')) {
      e2ePaymentIntentId = order?.payment_intent_id || `e2e_pi_${Date.now()}`;

      if (!order) {
        order = await Order.create({
          userId,
          total_amount: totalAmount,
          status: 'pending',
          payment_intent_id: e2ePaymentIntentId,
          shippingAddress,
          coupon_code: appliedCouponCode,
          discount_amount: discountAmount,
          items: validItems.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        });

        for (const validItem of validItems) {
          await OrderItem.create({
            order_id: order._id,
            product_id: validItem.product._id,
            price: validItem.product.price,
            quantity: validItem.quantity,
          });
        }
      } else {
        order.total_amount = totalAmount;
        order.payment_intent_id = e2ePaymentIntentId;
        order.coupon_code = appliedCouponCode;
        order.discount_amount = discountAmount;
        if (shippingAddress) order.shippingAddress = shippingAddress;
        await order.save();
      }

      return c.json(
        {
          clientSecret: `e2e_secret_${e2ePaymentIntentId}`,
          paymentIntentId: e2ePaymentIntentId,
          orderId: String(order._id),
          amount: totalAmount,
          discountAmount,
          couponCode: appliedCouponCode,
          couponWarning,
        },
        200,
      );
    }

    const stripe = getStripeClient();

    if (order && order.payment_intent_id) {
      // Try to reuse the existing PaymentIntent.
      try {
        const existing = await stripe.paymentIntents.retrieve(order.payment_intent_id);
        const reusableStatuses = new Set([
          'requires_payment_method',
          'requires_confirmation',
          'requires_action',
        ]);
        const isCardOnlyIntent =
          Array.isArray(existing.payment_method_types) &&
          existing.payment_method_types.length === 1 &&
          existing.payment_method_types[0] === 'card';

        if (reusableStatuses.has(existing.status) && isCardOnlyIntent) {
          // If amount drifted (e.g., product price changed), update it.
          if (existing.amount !== amountInCents) {
            paymentIntent = await stripe.paymentIntents.update(existing.id, {
              amount: amountInCents,
              currency: 'usd',
            });
          } else {
            paymentIntent = existing;
          }
        }
      } catch (err) {
        console.warn('[Checkout] Failed to reuse existing PaymentIntent, creating a new one.', err);
      }
    }

    if (!paymentIntent) {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
          clerkUserId: userId,
          // orderId is filled in below once the order exists.
        },
      });
    }

    if (!order) {
      order = await Order.create({
        userId,
        total_amount: totalAmount,
        status: 'pending',
        payment_intent_id: paymentIntent.id,
        shippingAddress,
        coupon_code: appliedCouponCode,
        discount_amount: discountAmount,
        items: validItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });

      for (const validItem of validItems) {
        await OrderItem.create({
          order_id: order._id,
          product_id: validItem.product._id,
          price: validItem.product.price,
          quantity: validItem.quantity,
        });
      }
    } else {
      // Reusing an existing pending order — keep amount + PI in sync.
      order.total_amount = totalAmount;
      order.payment_intent_id = paymentIntent.id;
      order.coupon_code = appliedCouponCode;
      order.discount_amount = discountAmount;
      if (shippingAddress) order.shippingAddress = shippingAddress;
      await order.save();
    }

    // Stamp the orderId into the PaymentIntent metadata so the webhook can find the order.
    try {
      await stripe.paymentIntents.update(paymentIntent.id, {
        metadata: {
          clerkUserId: userId,
          orderId: String(order._id),
        },
      });
    } catch (err) {
      console.warn('[Checkout] Failed to stamp orderId on PaymentIntent metadata:', err);
    }

    return c.json(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderId: String(order._id),
        amount: totalAmount,
        discountAmount,
        couponCode: appliedCouponCode,
        couponWarning,
      },
      200,
    );
  } catch (error: any) {
    console.error('[Checkout] Error:', error?.message || error, error?.stack || '');

    if (error?.message?.includes('STRIPE_SECRET_KEY')) {
      return c.json({ error: 'Stripe is not configured on server. Missing STRIPE_SECRET_KEY.' }, 500);
    }

    if (error?.type?.startsWith('Stripe')) {
      return c.json({ error: `Stripe checkout error: ${error.message}` }, 502);
    }

    return c.json({ error: 'Internal server error processing checkout' }, 500);
  }
};

// Backwards-compatible alias so existing route imports keep working if any.
export const checkoutSessionController = createPaymentIntentController;
