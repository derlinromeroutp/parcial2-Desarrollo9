import { describe, expect, test } from 'bun:test';
import { updateShippingSchema } from './order.validator';

describe('updateShippingSchema', () => {
  test('accepts a status-only update', () => {
    const result = updateShippingSchema.safeParse({ status: 'shipped' });
    expect(result.success).toBe(true);
  });

  test('accepts a carrier and trackingNumber update', () => {
    const result = updateShippingSchema.safeParse({ carrier: 'DHL', trackingNumber: 'ABC123' });
    expect(result.success).toBe(true);
  });

  test('rejects an empty object with no fields set', () => {
    const result = updateShippingSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  test('rejects an invalid status value', () => {
    const result = updateShippingSchema.safeParse({ status: 'in_transit' });
    expect(result.success).toBe(false);
  });

  test('rejects an empty carrier string', () => {
    const result = updateShippingSchema.safeParse({ carrier: '' });
    expect(result.success).toBe(false);
  });
});
