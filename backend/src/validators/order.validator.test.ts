import { describe, expect, test } from 'bun:test';
import { salesReportQuerySchema, updateShippingSchema } from './order.validator';

describe('updateShippingSchema', () => {
  test('accepts a status-only update', () => {
    const result = updateShippingSchema.safeParse({ status: 'shipped' });
    expect(result.success).toBe(true);
  });

  test('accepts a carrier and trackingNumber update', () => {
    const result = updateShippingSchema.safeParse({ carrier: 'DHL', trackingNumber: 'ABC123' });
    expect(result.success).toBe(true);
  });

  test('rejects empty payloads', () => {
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

describe('salesReportQuerySchema', () => {
  test('accepts a valid date range', () => {
    const result = salesReportQuerySchema.safeParse({
      from: '2026-07-01T00:00:00.000Z',
      to: '2026-07-14T23:59:59.999Z',
    });

    expect(result.success).toBe(true);
  });

  test('rejects when from is later than to', () => {
    const result = salesReportQuerySchema.safeParse({
      from: '2026-07-15T00:00:00.000Z',
      to: '2026-07-14T23:59:59.999Z',
    });

    expect(result.success).toBe(false);
  });
});
