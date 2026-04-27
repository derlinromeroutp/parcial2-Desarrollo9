import { Context } from 'hono';
import Stripe from 'stripe';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { finalizePaidOrder } from '../services/order.service';

export const stripeWebhookController = async (c: Context) => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey) {
    console.error('[Stripe Webhook] STRIPE_SECRET_KEY not configured');
    return c.json({ error: 'Stripe not configured' }, 500);
  }

  const stripe = new Stripe(stripeSecretKey);
  const rawBody = await c.req.text();
  const sig = c.req.header('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!webhookSecret || !sig) {
      console.warn('[Stripe Webhook] No webhook secret or signature — skipping verification (dev only)');
      event = JSON.parse(rawBody) as Stripe.Event;
    } else {
      event = await stripe.webhooks.constructEventAsync(rawBody, sig, webhookSecret);
    }
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return c.json({ error: `Webhook Error: ${err.message}` }, 400);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;
        const clerkUserId = paymentIntent.metadata?.clerkUserId;

        if (!orderId || !clerkUserId) {
          console.warn('[Stripe Webhook] payment_intent.succeeded missing metadata — skipping', paymentIntent.id);
          break;
        }

        const order = await Order.findById(orderId);
        if (!order) {
          console.warn('[Stripe Webhook] Order not found:', orderId);
          break;
        }

        if (order.status === 'paid') {
          console.log('[Stripe Webhook] Order already paid, skipping:', orderId);
          break;
        }

        try {
          await finalizePaidOrder(clerkUserId, orderId, paymentIntent.id, true);
        } catch (txError: any) {
          const isTxUnsupported =
            txError?.code === 20 ||
            txError?.codeName === 'IllegalOperation' ||
            String(txError?.message || '').includes('Transaction numbers are only allowed');

          if (!isTxUnsupported) throw txError;

          console.warn('[Stripe Webhook] MongoDB transactions unsupported, retrying without transaction.');
          await finalizePaidOrder(clerkUserId, orderId, paymentIntent.id, false);
        }

        console.log('[Stripe Webhook] Order marked as paid:', orderId);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (!orderId) break;

        await Order.findByIdAndUpdate(orderId, { status: 'failed' });
        console.log('[Stripe Webhook] Order marked as failed:', orderId);
        break;
      }

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type);
    }

    return c.json({ received: true }, 200);
  } catch (error: any) {
    console.error('[Stripe Webhook] Error processing event:', error.message);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
};

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

    // Allow without signature in development when the secret is not set.
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
            email,
            role,
          },
          { upsert: true, new: true },
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
