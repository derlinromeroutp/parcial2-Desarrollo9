import { afterEach, describe, expect, mock, test } from 'bun:test';
import { getMyWishlist, addToWishlist } from './wishlist.controller';
import { WishlistItem } from '../models/WishlistItem';
import { Product } from '../models/Product';

function createContext(options: { body?: Record<string, unknown>; userId?: string } = {}) {
  let statusCode = 200;
  let payload: unknown;

  const context = {
    req: {
      json: async () => options.body ?? {},
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

describe('addToWishlist controller', () => {
  test('snapshots the current product price as priceAtAdded', async () => {
    Product.findById = mock(() => Promise.resolve({ _id: 'prod_1', price: 500 })) as typeof Product.findById;
    WishlistItem.findOne = mock(() => Promise.resolve(null)) as typeof WishlistItem.findOne;

    const populatedItem = {
      _id: 'wl_1',
      userId: 'user_123',
      product: { _id: 'prod_1', price: 500 },
      priceAtAdded: 500,
    };
    const createdItem = { ...populatedItem, populate: mock(() => Promise.resolve(populatedItem)) };
    const create = mock(() => Promise.resolve(createdItem));
    WishlistItem.create = create as typeof WishlistItem.create;

    const harness = createContext({ body: { productId: 'prod_1' }, userId: 'user_123' });

    await addToWishlist(harness.context as never);

    expect(create).toHaveBeenCalledWith({ userId: 'user_123', product: 'prod_1', priceAtAdded: 500 });
    expect(harness.statusCode).toBe(201);
  });
});

describe('getMyWishlist controller', () => {
  test('returns 401 when userId is missing from auth context', async () => {
    const harness = createContext({});

    await getMyWishlist(harness.context as never);

    expect(harness.statusCode).toBe(401);
  });

  test('marks priceDropped true when the current price is below priceAtAdded', async () => {
    const items = [
      { _id: 'wl_1', priceAtAdded: 500, product: { _id: 'prod_1', price: 400 } },
    ];
    WishlistItem.find = mock(() => createFindQuery(items)) as typeof WishlistItem.find;

    const harness = createContext({ userId: 'user_123' });

    await getMyWishlist(harness.context as never);

    expect((harness.payload as any[])[0]).toEqual({ ...items[0], priceDropped: true });
  });

  test('marks priceDropped false when the current price did not drop', async () => {
    const items = [
      { _id: 'wl_1', priceAtAdded: 500, product: { _id: 'prod_1', price: 500 } },
    ];
    WishlistItem.find = mock(() => createFindQuery(items)) as typeof WishlistItem.find;

    const harness = createContext({ userId: 'user_123' });

    await getMyWishlist(harness.context as never);

    expect((harness.payload as any[])[0].priceDropped).toBe(false);
  });

  test('falls back to no drop for legacy items without a stored priceAtAdded', async () => {
    const items = [
      { _id: 'wl_1', priceAtAdded: undefined, product: { _id: 'prod_1', price: 400 } },
    ];
    WishlistItem.find = mock(() => createFindQuery(items)) as typeof WishlistItem.find;

    const harness = createContext({ userId: 'user_123' });

    await getMyWishlist(harness.context as never);

    expect((harness.payload as any[])[0].priceDropped).toBe(false);
  });

  test('does not crash when the referenced product no longer exists', async () => {
    const items = [{ _id: 'wl_1', priceAtAdded: 500, product: null }];
    WishlistItem.find = mock(() => createFindQuery(items)) as typeof WishlistItem.find;

    const harness = createContext({ userId: 'user_123' });

    await getMyWishlist(harness.context as never);

    expect(harness.statusCode).toBe(200);
    expect((harness.payload as any[])[0].priceDropped).toBe(false);
  });
});
