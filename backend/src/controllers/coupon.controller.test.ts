import { afterEach, describe, expect, mock, test } from 'bun:test';
import { createCoupon, getAllCoupons, deactivateCoupon, validateCoupon } from './coupon.controller';
import { Coupon } from '../models/Coupon';

function createContext(options: { validData?: Record<string, unknown>; param?: string } = {}) {
  let statusCode = 200;
  let payload: unknown;

  const context = {
    req: {
      valid: (_key: string) => options.validData ?? {},
      param: (_key: string) => options.param,
    },
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

describe('createCoupon controller', () => {
  test('creates a coupon with an uppercased code', async () => {
    Coupon.findOne = mock(() => Promise.resolve(null)) as typeof Coupon.findOne;
    const create = mock(() => Promise.resolve({ code: 'VERANO10' }));
    Coupon.create = create as typeof Coupon.create;

    const harness = createContext({
      validData: {
        code: 'verano10',
        discountType: 'percentage',
        discountValue: 10,
        validFrom: '2026-01-01T00:00:00.000Z',
        validUntil: '2026-12-31T00:00:00.000Z',
      },
    });

    await createCoupon(harness.context as never);

    expect(create).toHaveBeenCalledWith(expect.objectContaining({ code: 'VERANO10' }));
    expect(harness.statusCode).toBe(201);
  });

  test('rejects a duplicate coupon code with 409', async () => {
    Coupon.findOne = mock(() => Promise.resolve({ code: 'VERANO10' })) as typeof Coupon.findOne;

    const harness = createContext({
      validData: {
        code: 'VERANO10',
        discountType: 'percentage',
        discountValue: 10,
        validFrom: '2026-01-01T00:00:00.000Z',
        validUntil: '2026-12-31T00:00:00.000Z',
      },
    });

    await createCoupon(harness.context as never);

    expect(harness.statusCode).toBe(409);
  });
});

describe('getAllCoupons controller', () => {
  test('returns all coupons sorted by creation date', async () => {
    const sort = mock(() => Promise.resolve([{ code: 'A' }, { code: 'B' }]));
    Coupon.find = mock(() => ({ sort })) as unknown as typeof Coupon.find;

    const harness = createContext();
    await getAllCoupons(harness.context as never);

    expect(harness.statusCode).toBe(200);
    expect(harness.payload).toEqual([{ code: 'A' }, { code: 'B' }]);
  });
});

describe('deactivateCoupon controller', () => {
  test('deactivates an existing coupon', async () => {
    Coupon.findByIdAndUpdate = mock(() => Promise.resolve({ code: 'VERANO10', active: false })) as typeof Coupon.findByIdAndUpdate;

    const harness = createContext({ param: 'coupon_1' });
    await deactivateCoupon(harness.context as never);

    expect(harness.statusCode).toBe(200);
  });

  test('returns 404 when the coupon does not exist', async () => {
    Coupon.findByIdAndUpdate = mock(() => Promise.resolve(null)) as typeof Coupon.findByIdAndUpdate;

    const harness = createContext({ param: 'missing' });
    await deactivateCoupon(harness.context as never);

    expect(harness.statusCode).toBe(404);
  });
});

describe('validateCoupon controller', () => {
  test('returns a valid resolution for an active coupon', async () => {
    Coupon.findOne = mock(() => Promise.resolve({
      active: true,
      validFrom: new Date('2020-01-01'),
      validUntil: new Date('2030-01-01'),
      minPurchase: 0,
      usedCount: 0,
      discountType: 'fixed',
      discountValue: 20,
    })) as typeof Coupon.findOne;

    const harness = createContext({ validData: { code: 'VERANO10', subtotal: 100 } });
    await validateCoupon(harness.context as never);

    expect(harness.statusCode).toBe(200);
    expect((harness.payload as any).valid).toBe(true);
    expect((harness.payload as any).discountAmount).toBe(20);
  });

  test('returns an invalid resolution when the coupon does not exist', async () => {
    Coupon.findOne = mock(() => Promise.resolve(null)) as typeof Coupon.findOne;

    const harness = createContext({ validData: { code: 'NOPE', subtotal: 100 } });
    await validateCoupon(harness.context as never);

    expect(harness.statusCode).toBe(200);
    expect((harness.payload as any).valid).toBe(false);
  });
});
