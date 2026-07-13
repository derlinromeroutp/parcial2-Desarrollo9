import { describe, expect, test } from 'bun:test';
import { addToWishlistSchema, updateNoteSchema } from './wishlist.validator';

describe('addToWishlistSchema', () => {
  test('accepts a valid productId', () => {
    const result = addToWishlistSchema.safeParse({ productId: 'prod_1' });
    expect(result.success).toBe(true);
  });

  test('rejects an empty productId', () => {
    const result = addToWishlistSchema.safeParse({ productId: '' });
    expect(result.success).toBe(false);
  });

  test('rejects a missing productId', () => {
    const result = addToWishlistSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('updateNoteSchema', () => {
  test('accepts a valid note', () => {
    const result = updateNoteSchema.safeParse({ note: 'Esperar oferta de fin de mes' });
    expect(result.success).toBe(true);
  });

  test('accepts an empty note string', () => {
    const result = updateNoteSchema.safeParse({ note: '' });
    expect(result.success).toBe(true);
  });

  test('rejects a note longer than 500 characters', () => {
    const result = updateNoteSchema.safeParse({ note: 'a'.repeat(501) });
    expect(result.success).toBe(false);
  });
});
