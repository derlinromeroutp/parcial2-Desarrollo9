import { Context } from 'hono';
import { User } from '../models/User';

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
