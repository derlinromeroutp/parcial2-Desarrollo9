import { afterEach, describe, expect, mock, test } from 'bun:test';
import { updateShippingInfo, refundOrder } from './order.controller';
import { Order } from '../models/Order';
import { User } from '../models/User';

function createContext(options: { validData?: Record<string, unknown>; param?: string; userId?: string } = {}) {
  let statusCode = 200;
  let payload: unknown;

  const context = {
    req: {
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

describe('updateShippingInfo controller', () => {
  test('rejects modifying the shipping of a refunded order', async () => {
    Order.findById = mock(() => Promise.resolve({ status: 'refunded' })) as typeof Order.findById;

    const harness = createContext({ param: 'order_1', validData: { status: 'shipped' } });
    await updateShippingInfo(harness.context as never);

    expect(harness.statusCode).toBe(409);
  });

  test('allows updating a non-refunded order', async () => {
    const save = mock(() => Promise.resolve());
    Order.findById = mock(() => Promise.resolve({ status: 'paid', save })) as typeof Order.findById;
    User.findOne = mock(() => Promise.resolve(null)) as typeof User.findOne;

    const harness = createContext({ param: 'order_1', validData: { status: 'processing' } });
    await updateShippingInfo(harness.context as never);

    expect(harness.statusCode).toBe(200);
    expect(save).toHaveBeenCalled();
  });
});

describe('refundOrder controller', () => {
  test('returns 404 when the order does not exist', async () => {
    Order.findById = mock(() => Promise.resolve(null)) as typeof Order.findById;

    const harness = createContext({ param: 'missing', userId: 'admin_1' });
    await refundOrder(harness.context as never);

    expect(harness.statusCode).toBe(404);
  });

  test('rejects refunding an order that has not been paid', async () => {
    Order.findById = mock(() => Promise.resolve({ status: 'pending', payment_intent_id: 'pi_1' })) as typeof Order.findById;

    const harness = createContext({ param: 'order_1', userId: 'admin_1' });
    await refundOrder(harness.context as never);

    expect(harness.statusCode).toBe(409);
  });

  test('rejects refunding an order that was already refunded', async () => {
    Order.findById = mock(() => Promise.resolve({ status: 'refunded', payment_intent_id: 'pi_1' })) as typeof Order.findById;

    const harness = createContext({ param: 'order_1', userId: 'admin_1' });
    await refundOrder(harness.context as never);

    expect(harness.statusCode).toBe(409);
  });

  test('rejects refunding an order without a payment_intent_id', async () => {
    Order.findById = mock(() => Promise.resolve({ status: 'paid', payment_intent_id: undefined })) as typeof Order.findById;

    const harness = createContext({ param: 'order_1', userId: 'admin_1' });
    await refundOrder(harness.context as never);

    expect(harness.statusCode).toBe(400);
  });
});
