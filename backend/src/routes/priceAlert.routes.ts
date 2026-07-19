import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createPriceAlert, getMyPriceAlerts, deactivatePriceAlert } from '../controllers/priceAlert.controller';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware';
import { createPriceAlertSchema } from '../validators/priceAlert.validator';

const priceAlertRoutes = new Hono();

priceAlertRoutes.get('/mine', clerkAuthMiddleware, getMyPriceAlerts);

priceAlertRoutes.post(
  '/',
  clerkAuthMiddleware,
  zValidator('json', createPriceAlertSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  createPriceAlert,
);

priceAlertRoutes.put('/:id/deactivate', clerkAuthMiddleware, deactivatePriceAlert);

export default priceAlertRoutes;
