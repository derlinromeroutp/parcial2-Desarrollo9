import { afterEach, describe, expect, mock, test } from 'bun:test';
import {
  createSupportTicket,
  getMySupportTickets,
  getAllSupportTickets,
  updateSupportTicketStatus,
} from './support.controller';
import { SupportTicket } from '../models/SupportTicket';
import { User } from '../models/User';

function createContext(options: { body?: Record<string, unknown>; userId?: string; param?: string; validData?: Record<string, unknown> } = {}) {
  let statusCode = 200;
  let payload: unknown;

  const context = {
    req: {
      json: async () => options.body ?? {},
      valid: (_key: string) => options.validData ?? {},
      param: (_key: string) => options.param,
    },
    get: (key: string) => (key === 'userId' ? options.userId : undefined),
    json: (value: unknown, status?: number) => {
      payload = value;
      statusCode = status ?? 200;
      return { payload: value, status: statusCode };
    },
  };

  return {
    context,
    get statusCode() {
      return statusCode;
    },
    get payload() {
      return payload;
    },
  };
}

afterEach(() => {
  mock.restore();
});

describe('createSupportTicket controller', () => {
  test('creates a support ticket associated to the authenticated user', async () => {
    const createTicket = mock(() =>
      Promise.resolve({
        _id: 'support_1',
        status: 'open',
      }),
    );
    SupportTicket.create = createTicket as typeof SupportTicket.create;
    User.findOne = mock(() => Promise.resolve(null)) as typeof User.findOne;

    const harness = createContext({
      body: {
        category: 'payments',
        description: 'Necesito ayuda con un cobro duplicado.',
        contactChannel: 'email',
      },
      userId: 'user_123',
    });

    await createSupportTicket(harness.context as never);

    expect(createTicket).toHaveBeenCalledWith({
      userId: 'user_123',
      category: 'payments',
      description: 'Necesito ayuda con un cobro duplicado.',
      contactChannel: 'email',
      status: 'open',
    });
    expect(harness.statusCode).toBe(201);
    expect(harness.payload).toEqual({
      ticketId: 'support_1',
      status: 'open',
    });
  });

  test('returns 401 when userId is missing from auth context', async () => {
    const harness = createContext({
      body: {
        category: 'payments',
        description: 'Necesito ayuda con un cobro duplicado.',
        contactChannel: 'email',
      },
    });

    await createSupportTicket(harness.context as never);

    expect(harness.statusCode).toBe(401);
    expect(harness.payload).toEqual({
      error: 'Unauthorized: User ID not found in context',
    });
  });
});

describe('getMySupportTickets controller', () => {
  test('returns the tickets belonging to the authenticated user', async () => {
    const sort = mock(() => Promise.resolve([{ _id: 'ticket_1', status: 'open' }]));
    SupportTicket.find = mock(() => ({ sort })) as unknown as typeof SupportTicket.find;

    const harness = createContext({ userId: 'user_123' });
    await getMySupportTickets(harness.context as never);

    expect(harness.statusCode).toBe(200);
    expect(harness.payload).toEqual([{ _id: 'ticket_1', status: 'open' }]);
  });

  test('returns 401 when userId is missing', async () => {
    const harness = createContext({});
    await getMySupportTickets(harness.context as never);

    expect(harness.statusCode).toBe(401);
  });
});

describe('getAllSupportTickets controller', () => {
  test('returns all tickets sorted by creation date', async () => {
    const sort = mock(() => Promise.resolve([{ _id: 'ticket_1' }, { _id: 'ticket_2' }]));
    SupportTicket.find = mock(() => ({ sort })) as unknown as typeof SupportTicket.find;

    const harness = createContext({});
    await getAllSupportTickets(harness.context as never);

    expect(harness.statusCode).toBe(200);
    expect(harness.payload).toEqual([{ _id: 'ticket_1' }, { _id: 'ticket_2' }]);
  });
});

describe('updateSupportTicketStatus controller', () => {
  test('updates the status and notifies the owner when it changed', async () => {
    const save = mock(() => Promise.resolve());
    SupportTicket.findById = mock(() =>
      Promise.resolve({ _id: 'ticket_1', userId: 'user_123', status: 'open', save }),
    ) as typeof SupportTicket.findById;
    User.findOne = mock(() => Promise.resolve({ email: 'user@safetech.test' })) as typeof User.findOne;

    const harness = createContext({ param: 'ticket_1', validData: { status: 'in_review' } });
    await updateSupportTicketStatus(harness.context as never);

    expect(harness.statusCode).toBe(200);
    expect(save).toHaveBeenCalled();
  });

  test('returns 404 when the ticket does not exist', async () => {
    SupportTicket.findById = mock(() => Promise.resolve(null)) as typeof SupportTicket.findById;

    const harness = createContext({ param: 'missing', validData: { status: 'closed' } });
    await updateSupportTicketStatus(harness.context as never);

    expect(harness.statusCode).toBe(404);
  });
});
