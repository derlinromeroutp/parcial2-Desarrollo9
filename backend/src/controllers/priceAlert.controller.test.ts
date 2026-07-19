import { afterEach, describe, expect, mock, test } from 'bun:test';
import { createPriceAlert, getMyPriceAlerts, deactivatePriceAlert } from './priceAlert.controller';
import { PriceAlert } from '../models/PriceAlert';
import { WishlistItem } from '../models/WishlistItem';
import { Product } from '../models/Product';

function createContext(options: { body?: Record<string, unknown>; userId?: string; param?: string } = {}) {
  let statusCode = 200;
  let payload: unknown;

  const context = {
    req: {
      json: async () => options.body ?? {},
      param: () => options.param,
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

function createFindQuery(result: unknown) {
  const query: any = {
    populate: () => query,
    sort: () => query,
    lean: () => Promise.resolve(result),
  };
  return query;
}

afterEach(() => {
  mock.restore();
});

describe('createPriceAlert controller', () => {
  test('returns 401 when userId is missing from auth context', async () => {
    const harness = createContext({ body: { productId: 'prod_1' } });

    await createPriceAlert(harness.context as never);

    expect(harness.statusCode).toBe(401);
  });

  test('returns 400 when the product is not in the wishlist', async () => {
    WishlistItem.findOne = mock(() => Promise.resolve(null)) as typeof WishlistItem.findOne;

    const harness = createContext({ body: { productId: 'prod_1' }, userId: 'user_123' });

    await createPriceAlert(harness.context as never);

    expect(harness.statusCode).toBe(400);
    expect(harness.payload).toEqual({
      error: 'El producto debe estar en tu lista de deseos para activar una alerta',
    });
  });

  test('returns 404 when the product does not exist', async () => {
    WishlistItem.findOne = mock(() => Promise.resolve({ _id: 'wl_1' })) as typeof WishlistItem.findOne;
    Product.findById = mock(() => Promise.resolve(null)) as typeof Product.findById;

    const harness = createContext({ body: { productId: 'prod_1' }, userId: 'user_123' });

    await createPriceAlert(harness.context as never);

    expect(harness.statusCode).toBe(404);
  });

  test('returns 409 when an active alert already exists for the product', async () => {
    WishlistItem.findOne = mock(() => Promise.resolve({ _id: 'wl_1' })) as typeof WishlistItem.findOne;
    Product.findById = mock(() => Promise.resolve({ _id: 'prod_1', price: 500 })) as typeof Product.findById;
    PriceAlert.findOne = mock(() => Promise.resolve({ _id: 'alert_1' })) as typeof PriceAlert.findOne;

    const harness = createContext({ body: { productId: 'prod_1' }, userId: 'user_123' });

    await createPriceAlert(harness.context as never);

    expect(harness.statusCode).toBe(409);
  });

  test('creates a price alert snapshotting the current product price', async () => {
    WishlistItem.findOne = mock(() => Promise.resolve({ _id: 'wl_1' })) as typeof WishlistItem.findOne;
    Product.findById = mock(() => Promise.resolve({ _id: 'prod_1', price: 500 })) as typeof Product.findById;
    PriceAlert.findOne = mock(() => Promise.resolve(null)) as typeof PriceAlert.findOne;

    const populatedAlert = {
      _id: 'alert_1',
      userId: 'user_123',
      product: { _id: 'prod_1', price: 500 },
      priceAtActivation: 500,
      active: true,
    };
    const createdAlert = {
      ...populatedAlert,
      populate: mock(() => Promise.resolve(populatedAlert)),
    };
    const create = mock(() => Promise.resolve(createdAlert));
    PriceAlert.create = create as typeof PriceAlert.create;

    const harness = createContext({ body: { productId: 'prod_1' }, userId: 'user_123' });

    await createPriceAlert(harness.context as never);

    expect(create).toHaveBeenCalledWith({
      userId: 'user_123',
      product: 'prod_1',
      priceAtActivation: 500,
    });
    expect(harness.statusCode).toBe(201);
    expect(harness.payload).toEqual(populatedAlert);
  });
});

describe('getMyPriceAlerts controller', () => {
  test('returns 401 when userId is missing from auth context', async () => {
    const harness = createContext({});

    await getMyPriceAlerts(harness.context as never);

    expect(harness.statusCode).toBe(401);
  });

  test('marks alerts as triggered when the current price dropped below the activation price', async () => {
    const alerts = [
      { _id: 'alert_1', userId: 'user_123', priceAtActivation: 500, product: { _id: 'prod_1', price: 400 } },
      { _id: 'alert_2', userId: 'user_123', priceAtActivation: 500, product: { _id: 'prod_2', price: 600 } },
    ];
    PriceAlert.find = mock(() => createFindQuery(alerts)) as typeof PriceAlert.find;

    const harness = createContext({ userId: 'user_123' });

    await getMyPriceAlerts(harness.context as never);

    expect(harness.statusCode).toBe(200);
    expect(harness.payload).toEqual([
      { ...alerts[0], triggered: true },
      { ...alerts[1], triggered: false },
    ]);
  });
});

describe('deactivatePriceAlert controller', () => {
  test('returns 401 when userId is missing from auth context', async () => {
    const harness = createContext({ param: 'alert_1' });

    await deactivatePriceAlert(harness.context as never);

    expect(harness.statusCode).toBe(401);
  });

  test('returns 404 when the alert does not exist', async () => {
    PriceAlert.findById = mock(() => Promise.resolve(null)) as typeof PriceAlert.findById;

    const harness = createContext({ param: 'missing_alert', userId: 'user_123' });

    await deactivatePriceAlert(harness.context as never);

    expect(harness.statusCode).toBe(404);
  });

  test('returns 403 when the alert belongs to another user', async () => {
    PriceAlert.findById = mock(() =>
      Promise.resolve({ _id: 'alert_1', userId: 'someone_else', active: true }),
    ) as typeof PriceAlert.findById;

    const harness = createContext({ param: 'alert_1', userId: 'user_123' });

    await deactivatePriceAlert(harness.context as never);

    expect(harness.statusCode).toBe(403);
  });

  test('deactivates an alert owned by the authenticated user', async () => {
    const alertDoc: any = {
      _id: 'alert_1',
      userId: 'user_123',
      active: true,
      save: mock(function (this: any) {
        return Promise.resolve(this);
      }),
    };
    PriceAlert.findById = mock(() => Promise.resolve(alertDoc)) as typeof PriceAlert.findById;

    const harness = createContext({ param: 'alert_1', userId: 'user_123' });

    await deactivatePriceAlert(harness.context as never);

    expect(alertDoc.active).toBe(false);
    expect(alertDoc.save).toHaveBeenCalled();
    expect(harness.statusCode).toBe(200);
  });
});
