import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createSupportTicket, getMySupportTickets, getAllSupportTickets, updateSupportTicketStatus } from '../controllers/support.controller';
import { clerkAuthMiddleware, adminAuthMiddleware } from '../middlewares/auth.middleware';
import { createSupportTicketSchema, updateSupportTicketStatusSchema } from '../validators/support.validator';

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

supportRoutes.get('/mine', clerkAuthMiddleware, getMySupportTickets);

supportRoutes.get('/', adminAuthMiddleware, getAllSupportTickets);

supportRoutes.patch(
  '/:id/status',
  adminAuthMiddleware,
  zValidator('json', updateSupportTicketStatusSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  updateSupportTicketStatus,
);

export default supportRoutes;
