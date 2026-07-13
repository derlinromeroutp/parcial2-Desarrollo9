import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getMyOrders, getOrderBySession, getAllOrders, confirmOrderPayment, updateShippingInfo } from '../controllers/order.controller';
import { clerkAuthMiddleware, adminAuthMiddleware } from '../middlewares/auth.middleware';
import { updateShippingSchema } from '../validators/order.validator';
import { confirmPaymentSchema } from '../validators/technician.validator';

const orderRouter = new Hono();

orderRouter.get('/mine', clerkAuthMiddleware, getMyOrders);
orderRouter.get('/by-session/:sessionId', clerkAuthMiddleware, getOrderBySession);
orderRouter.post('/confirm-payment', clerkAuthMiddleware, zValidator('json', confirmPaymentSchema, (result, c) => {
  if (!result.success) return c.json({ success: false, errors: result.error.errors }, 400);
}), confirmOrderPayment);
orderRouter.get('/', adminAuthMiddleware, getAllOrders);

orderRouter.put(
  '/:id/shipping',
  adminAuthMiddleware,
  zValidator('json', updateShippingSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  updateShippingInfo
);

export default orderRouter;
