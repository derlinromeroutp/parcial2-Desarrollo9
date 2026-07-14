import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createSupportTicket } from '../controllers/support.controller';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware';
import { createSupportTicketSchema } from '../validators/support.validator';

const supportRoutes = new Hono();

supportRoutes.post(
  '/',
  clerkAuthMiddleware,
  zValidator('json', createSupportTicketSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  createSupportTicket,
);

export default supportRoutes;
