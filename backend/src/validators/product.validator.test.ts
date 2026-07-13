import { describe, expect, test } from 'bun:test';
import {
  bestSellersQuerySchema,
  createProductSchema,
  lowStockQuerySchema,
  productFilterSchema,
  updateProductSchema,
} from './product.validator';

const validProduct = {
  name: 'iPhone 12',
  price: 350,
  condition: 'A' as const,
  category: 'celular' as const,
};

describe('createProductSchema', () => {
  test('accepts a valid product and defaults stock to 0', () => {
    const result = createProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stock).toBe(0);
    }
  });

  test('accepts an explicit stock value', () => {
    const result = createProductSchema.safeParse({ ...validProduct, stock: 5 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stock).toBe(5);
    }
  });

  test('rejects a negative price', () => {
    const result = createProductSchema.safeParse({ ...validProduct, price: -1 });
    expect(result.success).toBe(false);
  });

  test('rejects an invalid condition', () => {
    const result = createProductSchema.safeParse({ ...validProduct, condition: 'D' });
    expect(result.success).toBe(false);
  });

  test('rejects an invalid category', () => {
    const result = createProductSchema.safeParse({ ...validProduct, category: 'consola' });
    expect(result.success).toBe(false);
  });

  test('rejects a non-url image', () => {
    const result = createProductSchema.safeParse({ ...validProduct, image_urls: ['not-a-url'] });
    expect(result.success).toBe(false);
  });
});

describe('updateProductSchema', () => {
  test('accepts a partial update without resetting stock to 0', () => {
    const result = updateProductSchema.safeParse({ price: 400 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stock).toBeUndefined();
    }
  });

  test('accepts an optional reason for stock adjustment', () => {
    const result = updateProductSchema.safeParse({ stock: 10, reason: 'Reposicion' });
    expect(result.success).toBe(true);
  });

  test('rejects an empty reason string', () => {
    const result = updateProductSchema.safeParse({ reason: '' });
    expect(result.success).toBe(false);
  });
});

describe('productFilterSchema', () => {
  test('accepts an empty filter', () => {
    const result = productFilterSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  test('coerces numeric query params from strings', () => {
    const result = productFilterSchema.safeParse({ minPrice: '10', maxPrice: '100', limit: '20', page: '2' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.minPrice).toBe(10);
      expect(result.data.limit).toBe(20);
    }
  });

  test('rejects minPrice greater than maxPrice', () => {
    const result = productFilterSchema.safeParse({ minPrice: '100', maxPrice: '10' });
    expect(result.success).toBe(false);
  });

  test('rejects a limit above the max allowed', () => {
    const result = productFilterSchema.safeParse({ limit: '51' });
    expect(result.success).toBe(false);
  });
});

describe('lowStockQuerySchema', () => {
  test('accepts a missing threshold', () => {
    const result = lowStockQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  test('rejects a negative threshold', () => {
    const result = lowStockQuerySchema.safeParse({ threshold: '-1' });
    expect(result.success).toBe(false);
  });
});

describe('bestSellersQuerySchema', () => {
  test('accepts a limit within range', () => {
    const result = bestSellersQuerySchema.safeParse({ limit: '5' });
    expect(result.success).toBe(true);
  });

  test('rejects a limit above 12', () => {
    const result = bestSellersQuerySchema.safeParse({ limit: '13' });
    expect(result.success).toBe(false);
  });
});
