import { type Context } from 'hono';
import { SupportTicket } from '../models/SupportTicket';

export const createSupportTicket = async (c: Context) => {
  try {
    const userId = c.get('userId');

    if (!userId) {
      return c.json({ error: 'Unauthorized: User ID not found in context' }, 401);
    }

    const { category, description, contactChannel } = await c.req.json();

    const ticket = await SupportTicket.create({
      userId,
      category,
      description,
      contactChannel,
      status: 'open',
    });

    return c.json(
      {
        ticketId: String(ticket._id),
        status: ticket.status,
      },
      201,
    );
  } catch (error: any) {
    console.error('[Support Ticket Error]:', error);
    return c.json({ error: error.message }, 400);
  }
};
