import { afterEach, describe, expect, mock, test } from 'bun:test';
import { createSupportTicket } from './support.controller';
import { SupportTicket } from '../models/SupportTicket';

function createContext(body: Record<string, unknown>, userId?: string) {
  let statusCode = 200;
  let payload: unknown;

  const context = {
    req: {
      json: async () => body,
    },
    get: (key: string) => (key === 'userId' ? userId : undefined),
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

    const harness = createContext(
      {
        category: 'payments',
        description: 'Necesito ayuda con un cobro duplicado.',
        contactChannel: 'email',
      },
      'user_123',
    );

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
      category: 'payments',
      description: 'Necesito ayuda con un cobro duplicado.',
      contactChannel: 'email',
    });

    await createSupportTicket(harness.context as never);

    expect(harness.statusCode).toBe(401);
    expect(harness.payload).toEqual({
      error: 'Unauthorized: User ID not found in context',
    });
  });
});
