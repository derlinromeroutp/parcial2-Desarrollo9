import { Context } from 'hono';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { Product } from '../models/Product';
import { User } from '../models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
});

export const stripeWebhookController = async (c: Context) => {
  const signature = c.req.header('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error('Missing stripe signature or webhook secret');
    return c.json({ error: 'Missing stripe webhook setup' }, 400);
  }

  let event: Stripe.Event;

  try {
    // Hono raw body is required by Stripe to construct the event and validate the signature
    const textBody = await c.req.text();
    event = stripe.webhooks.constructEvent(textBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return c.json({ error: `Webhook Error: ${err.message}` }, 400);
  }

  // Embedded Payment Element flow — drive order state from PaymentIntent events.
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;

    // Iniciar transacción atómica en MongoDB
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Locate by payment_intent_id, with metadata.orderId as fallback.
      let order = await Order.findOne({ payment_intent_id: pi.id }).session(session);
      if (!order && pi.metadata?.orderId) {
        order = await Order.findById(pi.metadata.orderId).session(session);
      }

      if (!order) {
        throw new Error(`Order for PaymentIntent ${pi.id} not found`);
      }

      // Idempotency: if already paid, ack and exit.
      if (order.status !== 'pending') {
        await session.abortTransaction();
        session.endSession();
        return c.json({ received: true }, 200);
      }

      order.status = 'paid';
      // Backfill in case the order was created before payment_intent_id was stamped.
      if (!order.payment_intent_id) order.payment_intent_id = pi.id;
      await order.save({ session });

      const orderItems = await OrderItem.find({ order_id: order._id }).session(session);

      for (const item of orderItems) {
        const result = await Product.updateOne(
          { _id: item.product_id, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session },
        );

        if (result.modifiedCount === 0) {
          throw new Error(`Insufficient stock for product id ${item.product_id}`);
        }
      }

      await session.commitTransaction();
      session.endSession();

      console.log(`Order ${order._id} paid (PI ${pi.id}) and stock updated successfully`);
      return c.json({ received: true }, 200);
    } catch (dbError: any) {
      await session.abortTransaction();
      session.endSession();
      console.error('Transaction aborted due to error:', dbError.message);
      return c.json({ error: 'Database transaction failed' }, 400);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent;
    try {
      const order = await Order.findOne({ payment_intent_id: pi.id });
      if (order && order.status === 'pending') {
        // Keep pending so the customer can retry with a new payment method on the same order.
        // Log only — do not mutate to 'failed' to preserve retry-on-same-order semantics.
        console.log(`PaymentIntent ${pi.id} failed for order ${order._id}; keeping pending for retry.`);
      }
    } catch (err: any) {
      console.error('Error processing payment_intent.payment_failed:', err.message);
    }
    return c.json({ received: true }, 200);
  }

  // Devolver un 200 OK vacío para eventos no manejados y evitar re-intentos de Stripe
  return c.json({ received: true }, 200);
};

// Clerk Webhook Controller
interface ClerkEvent {
  type: string;
  data: {
    object: {
      id: string;
      email_addresses: Array<{ email_address: string }>;
      public_metadata?: { role?: string };
    };
  };
}

export const clerkWebhookController = async (c: Context) => {
  const signature = c.req.header('clerk-signature');
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  let event: ClerkEvent;

  try {
    const textBody = await c.req.text();
    
    // Allow without signature in development (when secret is not set)
    if (!webhookSecret) {
      console.log('[Clerk Webhook] No webhook secret configured, skipping signature verification');
    } else if (!signature) {
      console.error('Missing clerk signature');
      return c.json({ error: 'Missing clerk signature' }, 400);
    }
    
    event = JSON.parse(textBody);
  } catch (err: any) {
    console.error('Clerk webhook parse error:', err.message);
    return c.json({ error: `Webhook Error: ${err.message}` }, 400);
  }

  const { type, data } = event;
  const userData = data.object;

  try {
    switch (type) {
      case 'user.created':
      case 'user.updated': {
        const clerkId = userData.id;
        const email = userData.email_addresses?.[0]?.email_address;
        const role = userData.public_metadata?.role || 'user';

        if (!clerkId || !email) {
          console.error('Missing clerkId or email in webhook data');
          return c.json({ error: 'Invalid webhook data' }, 400);
        }

        await User.findOneAndUpdate(
          { clerk_id: clerkId },
          {
            clerk_id: clerkId,
            email: email,
            role: role
          },
          { upsert: true, new: true }
        );

        console.log(`User ${clerkId} (${email}) synchronized with role: ${role}`);
        break;
      }

      case 'user.deleted': {
        const clerkId = userData.id;

        if (clerkId) {
          await User.deleteOne({ clerk_id: clerkId });
          console.log(`User ${clerkId} deleted`);
        }
        break;
      }

      default:
        console.log(`Unhandled Clerk event type: ${type}`);
    }

    return c.json({ received: true }, 200);
  } catch (dbError: any) {
    console.error('Clerk webhook database error:', dbError.message);
    return c.json({ error: 'Database operation failed' }, 500);
  }
};
