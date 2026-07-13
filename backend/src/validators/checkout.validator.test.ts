import { describe, expect, test } from 'bun:test';
import mongoose from 'mongoose';
import { checkoutSchema } from './checkout.validator';

const validId = () => new mongoose.Types.ObjectId().toString();

describe('checkoutSchema', () => {
  test('accepts a cart with one or more valid items', () => {
    const result = checkoutSchema.safeParse({
      items: [
        { productId: validId(), quantity: 1 },
        { productId: validId(), quantity: 3 },
      ],
    });
    expect(result.success).toBe(true);
  });

  test('rejects an empty items array', () => {
    const result = checkoutSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
  });

  test('rejects an invalid productId format', () => {
    const result = checkoutSchema.safeParse({
      items: [{ productId: 'not-a-valid-object-id', quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });

  test('rejects a quantity of zero or less', () => {
    const result = checkoutSchema.safeParse({
      items: [{ productId: validId(), quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  test('rejects a non-integer quantity', () => {
    const result = checkoutSchema.safeParse({
      items: [{ productId: validId(), quantity: 1.5 }],
    });
    expect(result.success).toBe(false);
  });
});
