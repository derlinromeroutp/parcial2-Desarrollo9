import { describe, expect, test } from 'bun:test';
import { resolveCouponDiscount, type CouponRules } from './coupons';

const baseCoupon: CouponRules = {
  active: true,
  validFrom: new Date('2026-01-01T00:00:00Z'),
  validUntil: new Date('2026-12-31T23:59:59Z'),
  minPurchase: 0,
  usedCount: 0,
  discountType: 'percentage',
  discountValue: 10,
};

const NOW = new Date('2026-06-01T00:00:00Z');

describe('resolveCouponDiscount', () => {
  test('returns invalid when coupon is null (not found)', () => {
    const result = resolveCouponDiscount(null, 100, NOW);
    expect(result.valid).toBe(false);
    expect(result.discountAmount).toBe(0);
  });

  test('returns invalid when coupon is inactive', () => {
    const result = resolveCouponDiscount({ ...baseCoupon, active: false }, 100, NOW);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/inactivo/i);
  });

  test('returns invalid when now is before validFrom', () => {
    const result = resolveCouponDiscount(baseCoupon, 100, new Date('2025-12-31T00:00:00Z'));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/vigencia/i);
  });

  test('returns invalid when now is after validUntil', () => {
    const result = resolveCouponDiscount(baseCoupon, 100, new Date('2027-01-01T00:00:00Z'));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/vigencia/i);
  });

  test('returns invalid when subtotal is below minPurchase', () => {
    const result = resolveCouponDiscount({ ...baseCoupon, minPurchase: 200 }, 100, NOW);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/minima/i);
  });

  test('returns invalid when usedCount reached maxUses', () => {
    const result = resolveCouponDiscount({ ...baseCoupon, maxUses: 5, usedCount: 5 }, 100, NOW);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/agotado/i);
  });

  test('allows usage when usedCount is below maxUses', () => {
    const result = resolveCouponDiscount({ ...baseCoupon, maxUses: 5, usedCount: 4 }, 100, NOW);
    expect(result.valid).toBe(true);
  });

  test('computes percentage discount correctly', () => {
    const result = resolveCouponDiscount({ ...baseCoupon, discountType: 'percentage', discountValue: 10 }, 200, NOW);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(20);
  });

  test('computes fixed discount correctly', () => {
    const result = resolveCouponDiscount({ ...baseCoupon, discountType: 'fixed', discountValue: 15 }, 200, NOW);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(15);
  });

  test('clamps a fixed discount larger than the subtotal to the subtotal itself', () => {
    const result = resolveCouponDiscount({ ...baseCoupon, discountType: 'fixed', discountValue: 500 }, 50, NOW);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(50);
  });
});
