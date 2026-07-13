import { describe, expect, test } from 'bun:test';
import { createAddressSchema, updateAddressSchema } from './address.validator';

const validAddress = {
  recipientName: 'Ana Perez',
  phone: '099123456',
  street: 'Av. Siempre Viva 123',
  city: 'Asuncion',
  state: 'Central',
  zipCode: '1000',
  country: 'Paraguay',
};

describe('createAddressSchema', () => {
  test('accepts a fully populated address', () => {
    const result = createAddressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  test('accepts isDefault as an optional boolean', () => {
    const result = createAddressSchema.safeParse({ ...validAddress, isDefault: true });
    expect(result.success).toBe(true);
  });

  test.each(Object.keys(validAddress) as Array<keyof typeof validAddress>)(
    'rejects a missing required field: %s',
    (field) => {
      const incomplete: Record<string, unknown> = { ...validAddress };
      delete incomplete[field];
      const result = createAddressSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    },
  );

  test('rejects an empty string field', () => {
    const result = createAddressSchema.safeParse({ ...validAddress, city: '' });
    expect(result.success).toBe(false);
  });
});

describe('updateAddressSchema', () => {
  test('accepts a partial update with a single field', () => {
    const result = updateAddressSchema.safeParse({ city: 'Encarnacion' });
    expect(result.success).toBe(true);
  });

  test('accepts an empty object since all fields are optional', () => {
    const result = updateAddressSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  test('rejects an empty string on a provided field', () => {
    const result = updateAddressSchema.safeParse({ street: '' });
    expect(result.success).toBe(false);
  });
});
