import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getSalesReportController, getWarrantyReportController } from '../controllers/report.controller';
import { adminAuthMiddleware } from '../middlewares/auth.middleware';
import { salesReportQuerySchema } from '../validators/order.validator';

const reportRouter = new Hono();

reportRouter.get(
  '/sales',
  adminAuthMiddleware,
  zValidator('query', salesReportQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  getSalesReportController,
);

reportRouter.get(
  '/warranties',
  adminAuthMiddleware,
  zValidator('query', salesReportQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  getWarrantyReportController,
);

export default reportRouter;
