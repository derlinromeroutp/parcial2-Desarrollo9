import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getSalesReportController } from '../controllers/report.controller';
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

export default reportRouter;
