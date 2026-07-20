import { describe, expect, test } from 'bun:test';
import { createCouponSchema, validateCouponSchema } from './coupon.validator';

describe('createCouponSchema', () => {
  const valid = {
    code: 'VERANO10',
    discountType: 'percentage' as const,
    discountValue: 10,
    validFrom: '2026-01-01T00:00:00.000Z',
    validUntil: '2026-12-31T00:00:00.000Z',
  };

  test('accepts a valid coupon', () => {
    expect(createCouponSchema.safeParse(valid).success).toBe(true);
  });

  test('rejects a short code', () => {
    expect(createCouponSchema.safeParse({ ...valid, code: 'AB' }).success).toBe(false);
  });

  test('rejects validFrom after validUntil', () => {
    const result = createCouponSchema.safeParse({ ...valid, validFrom: '2027-01-01T00:00:00.000Z' });
    expect(result.success).toBe(false);
  });

  test('rejects a percentage discount over 100', () => {
    const result = createCouponSchema.safeParse({ ...valid, discountValue: 150 });
    expect(result.success).toBe(false);
  });

  test('accepts a fixed discount over 100', () => {
    const result = createCouponSchema.safeParse({ ...valid, discountType: 'fixed', discountValue: 150 });
    expect(result.success).toBe(true);
  });

  test('rejects a negative discountValue', () => {
    expect(createCouponSchema.safeParse({ ...valid, discountValue: -5 }).success).toBe(false);
  });
});

describe('validateCouponSchema', () => {
  test('accepts a valid payload', () => {
    expect(validateCouponSchema.safeParse({ code: 'VERANO10', subtotal: 100 }).success).toBe(true);
  });

  test('rejects an empty code', () => {
    expect(validateCouponSchema.safeParse({ code: '', subtotal: 100 }).success).toBe(false);
  });

  test('rejects a non-positive subtotal', () => {
    expect(validateCouponSchema.safeParse({ code: 'VERANO10', subtotal: 0 }).success).toBe(false);
  });
});
