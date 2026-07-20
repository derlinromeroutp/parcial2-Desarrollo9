import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createCoupon, getAllCoupons, deactivateCoupon, validateCoupon } from '../controllers/coupon.controller';
import { clerkAuthMiddleware, adminAuthMiddleware } from '../middlewares/auth.middleware';
import { createCouponSchema, validateCouponSchema } from '../validators/coupon.validator';

const couponRoutes = new Hono();

couponRoutes.post('/', adminAuthMiddleware, zValidator('json', createCouponSchema, (result, c) => {
  if (!result.success) return c.json({ success: false, errors: result.error.errors }, 400);
}), createCoupon);

couponRoutes.get('/', adminAuthMiddleware, getAllCoupons);

couponRoutes.patch('/:id/deactivate', adminAuthMiddleware, deactivateCoupon);

couponRoutes.post('/validate', clerkAuthMiddleware, zValidator('json', validateCouponSchema, (result, c) => {
  if (!result.success) return c.json({ success: false, errors: result.error.errors }, 400);
}), validateCoupon);

export default couponRoutes;
