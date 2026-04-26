import { Hono } from 'hono';
import { createPaymentIntentController } from '../controllers/checkout.controller';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware';

const checkoutRoutes = new Hono();

// Embedded Stripe Payment Element flow — returns { clientSecret, orderId, amount }.
// Reuses an existing pending Order + PaymentIntent for the same cart on retry.
checkoutRoutes.post(
  '/',
  clerkAuthMiddleware,
  createPaymentIntentController,
);

export default checkoutRoutes;
