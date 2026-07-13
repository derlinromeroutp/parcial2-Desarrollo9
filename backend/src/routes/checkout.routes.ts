import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createPaymentIntentController } from '../controllers/checkout.controller';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware';
import { checkoutSchema } from '../validators/checkout.validator';

const checkoutRoutes = new Hono();

checkoutRoutes.post(
  '/',
  clerkAuthMiddleware,
  zValidator('json', checkoutSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  createPaymentIntentController,
);

export default checkoutRoutes;
