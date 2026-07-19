import { describe, expect, test } from 'bun:test';
import { createPriceAlertSchema } from './priceAlert.validator';

describe('createPriceAlertSchema', () => {
  test('accepts a valid productId', () => {
    const result = createPriceAlertSchema.safeParse({ productId: 'prod_1' });
    expect(result.success).toBe(true);
  });

  test('rejects an empty productId', () => {
    const result = createPriceAlertSchema.safeParse({ productId: '' });
    expect(result.success).toBe(false);
  });

  test('rejects a missing productId', () => {
    const result = createPriceAlertSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
