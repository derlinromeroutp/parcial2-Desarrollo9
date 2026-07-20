import { describe, expect, test } from 'bun:test';
import { createSupportTicketSchema, updateSupportTicketStatusSchema } from './support.validator';

describe('createSupportTicketSchema', () => {
  const valid = {
    category: 'payments',
    description: 'Necesito ayuda con un cobro duplicado.',
    contactChannel: 'email',
  };

  test('accepts a valid payload', () => {
    expect(createSupportTicketSchema.safeParse(valid).success).toBe(true);
  });

  test('rejects an empty category', () => {
    expect(createSupportTicketSchema.safeParse({ ...valid, category: '' }).success).toBe(false);
  });

  test('rejects a description shorter than 10 characters', () => {
    expect(createSupportTicketSchema.safeParse({ ...valid, description: 'muy corta' }).success).toBe(false);
  });

  test('rejects an empty contactChannel', () => {
    expect(createSupportTicketSchema.safeParse({ ...valid, contactChannel: '' }).success).toBe(false);
  });
});

describe('updateSupportTicketStatusSchema', () => {
  test('accepts a valid status', () => {
    expect(updateSupportTicketStatusSchema.safeParse({ status: 'in_review' }).success).toBe(true);
  });

  test('rejects an invalid status', () => {
    expect(updateSupportTicketStatusSchema.safeParse({ status: 'archived' }).success).toBe(false);
  });

  test('rejects a missing status', () => {
    expect(updateSupportTicketStatusSchema.safeParse({}).success).toBe(false);
  });
});
