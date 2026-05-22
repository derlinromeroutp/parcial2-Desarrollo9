import { Context } from 'hono';
import Stripe from 'stripe';
import { Order } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { finalizePaidOrder } from '../services/order.service';
import { isE2EPaymentIntent, isE2ETestMode } from '../lib/e2e';

const getStripeClient = () => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured in backend environment');
  }

  return new Stripe(stripeSecretKey);
};

export const getMyOrders = async (c: Context) => {
  try {
    const userId = c.get('userId');

    if (!userId) {
      return c.json({ error: 'Unauthorized: User ID not found' }, 401);
    }

    const ordersData = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
    const orderIds = ordersData.map(o => o._id);

    const relatedItems = await OrderItem.find({ order_id: { $in: orderIds } })
      .populate('product_id')
      .lean();

    const orders = ordersData.map(order => {
      const items = relatedItems
        .filter(item => String(item.order_id) === String(order._id))
        .map(item => ({
          ...item,
          product: item.product_id,
        }));
      return { ...order, items };
    });

    return c.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
};

export const getOrderBySession = async (c: Context) => {
  try {
    const sessionId = c.req.param('sessionId');
    const userId = c.get('userId');

    if (!userId) {
      return c.json({ error: 'Unauthorized: User ID not found' }, 401);
    }

    const order = await Order.findOne({ stripe_session_id: sessionId, userId }).lean();

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const relatedItems = await OrderItem.find({ order_id: order._id })
      .populate('product_id')
      .lean();

    const items = relatedItems.map(item => ({
      ...item,
      product: item.product_id,
    }));

    return c.json({ ...order, items });
  } catch (error) {
    console.error('Error fetching order by session:', error);
    return c.json({ error: 'Failed to fetch order' }, 500);
  }
};

export const getAllOrders = async (c: Context) => {
  try {
    const ordersData = await Order.find()
      .sort({ createdAt: -1 })
      .populate('userDoc', 'email')
      .lean();

    const orderIds = ordersData.map(o => o._id);
    const relatedItems = await OrderItem.find({ order_id: { $in: orderIds } })
      .populate('product_id')
      .lean();

    const orders = ordersData.map(order => {
      const items = relatedItems
        .filter(item => String(item.order_id) === String(order._id))
        .map(item => ({
          ...item,
          product: item.product_id,
        }));
      return { ...order, items };
    });

    return c.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
};

export const confirmOrderPayment = async (c: Context) => {
  try {
    const userId = c.get('userId');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const paymentIntentId = body.paymentIntentId as string | undefined;

    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return c.json({ error: 'paymentIntentId is required' }, 400);
    }

    if (isE2ETestMode && isE2EPaymentIntent(paymentIntentId)) {
      const order = await Order.findOne({ payment_intent_id: paymentIntentId, userId });

      if (!order) {
        return c.json({ error: 'Order not found' }, 404);
      }

      if (order.status === 'paid') {
        const relatedItems = await OrderItem.find({ order_id: order._id }).populate('product_id').lean();
        const items = relatedItems.map((item) => ({
          ...item,
          product: item.product_id,
        }));
        return c.json({ ...order.toObject(), items }, 200);
      }

      const confirmation = await finalizePaidOrder(
        userId,
        String(order._id),
        paymentIntentId,
        false,
      );

      const paidOrder = await Order.findById(confirmation.lockedOrder._id).lean();
      const relatedItems = await OrderItem.find({ order_id: confirmation.lockedOrder._id }).populate('product_id').lean();
      const items = relatedItems.map((item) => ({
        ...item,
        product: item.product_id,
      }));

      return c.json({ ...paidOrder, items, stockWarnings: confirmation.stockWarnings }, 200);
    }

    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return c.json(
        {
          error: 'Payment has not succeeded',
          status: paymentIntent.status,
        },
        400,
      );
    }

    const order = await Order.findOne({ payment_intent_id: paymentIntent.id, userId });

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (paymentIntent.metadata?.clerkUserId && paymentIntent.metadata.clerkUserId !== userId) {
      return c.json({ error: 'PaymentIntent does not belong to this user' }, 403);
    }

    if (paymentIntent.metadata?.orderId && paymentIntent.metadata.orderId !== String(order._id)) {
      return c.json({ error: 'PaymentIntent does not match this order' }, 409);
    }

    const expectedAmount = Math.round(order.total_amount * 100);
    if (paymentIntent.amount !== expectedAmount || paymentIntent.currency !== 'usd') {
      return c.json({ error: 'Payment amount does not match order total' }, 409);
    }

    if (order.status === 'paid') {
      const relatedItems = await OrderItem.find({ order_id: order._id }).populate('product_id').lean();
      const items = relatedItems.map((item) => ({
        ...item,
        product: item.product_id,
      }));
      return c.json({ ...order.toObject(), items }, 200);
    }

    if (order.status !== 'pending') {
      return c.json({ error: `Order cannot be paid from status: ${order.status}` }, 409);
    }

    try {
      let confirmation;
      try {
        confirmation = await finalizePaidOrder(
          userId,
          String(order._id),
          paymentIntent.id,
          true,
        );
      } catch (transactionError: any) {
        const isTxUnsupported =
          transactionError?.code === 20 ||
          transactionError?.codeName === 'IllegalOperation' ||
          String(transactionError?.message || '').includes('Transaction numbers are only allowed');

        if (!isTxUnsupported) {
          throw transactionError;
        }

        console.warn('[Payments] MongoDB transaction unsupported, retrying payment confirmation without transaction.');
        confirmation = await finalizePaidOrder(
          userId,
          String(order._id),
          paymentIntent.id,
          false,
        );
      }

      const paidOrder = await Order.findById(confirmation.lockedOrder._id).lean();
      const relatedItems = await OrderItem.find({ order_id: confirmation.lockedOrder._id }).populate('product_id').lean();
      const items = relatedItems.map((item) => ({
        ...item,
        product: item.product_id,
      }));

      return c.json({ ...paidOrder, items, stockWarnings: confirmation.stockWarnings }, 200);
    } catch (confirmationError) {
      throw confirmationError;
    }
  } catch (error: any) {
    console.error('Error confirming payment:', error);

    if (error?.message?.includes('STRIPE_SECRET_KEY')) {
      return c.json({ error: 'Stripe is not configured on server. Missing STRIPE_SECRET_KEY.' }, 500);
    }

    if (error?.type?.startsWith('Stripe')) {
      return c.json({ error: `Stripe payment verification error: ${error.message}` }, 502);
    }

    return c.json({ error: 'Failed to confirm payment' }, 500);
  }
};
