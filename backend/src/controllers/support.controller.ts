import { type Context } from 'hono';
import { SupportTicket } from '../models/SupportTicket';
import { User } from '../models/User';
import { sendSupportTicketCreatedEmail, sendSupportTicketStatusChangedEmail } from '../services/email.service';

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

    const reporter = await User.findOne({ clerk_id: userId });
    if (reporter?.email) {
      await sendSupportTicketCreatedEmail(reporter.email, ticket);
    }

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

export const getMySupportTickets = async (c: Context) => {
  try {
    const userId = c.get('userId');

    if (!userId) {
      return c.json({ error: 'Unauthorized: User ID not found in context' }, 401);
    }

    const tickets = await SupportTicket.find({ userId }).sort({ createdAt: -1 });
    return c.json(tickets);
  } catch (error: any) {
    console.error('[Support Ticket Error]:', error);
    return c.json({ error: 'Failed to fetch support tickets' }, 500);
  }
};

export const getAllSupportTickets = async (c: Context) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    return c.json(tickets);
  } catch (error: any) {
    console.error('[Support Ticket Error]:', error);
    return c.json({ error: 'Failed to fetch support tickets' }, 500);
  }
};

export const updateSupportTicketStatus = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const { status } = c.req.valid('json' as any) as { status: 'open' | 'in_review' | 'closed' };

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    const statusChanged = ticket.status !== status;
    ticket.status = status;
    await ticket.save();

    if (statusChanged) {
      const owner = await User.findOne({ clerk_id: ticket.userId });
      if (owner?.email) {
        await sendSupportTicketStatusChangedEmail(owner.email, ticket);
      }
    }

    return c.json(ticket);
  } catch (error: any) {
    console.error('[Support Ticket Error]:', error);
    return c.json({ error: 'Failed to update support ticket' }, 400);
  }
};
