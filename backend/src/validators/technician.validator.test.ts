import { describe, expect, test } from 'bun:test';
import {
  assignTechnicianSchema,
  confirmPaymentSchema,
  createTechnicianSchema,
  techUpdateWarrantySchema,
} from './technician.validator';

describe('createTechnicianSchema', () => {
  test('accepts a technician with a valid email', () => {
    const result = createTechnicianSchema.safeParse({ name: 'Juan', email: 'juan@safetech.com' });
    expect(result.success).toBe(true);
  });

  test('rejects an invalid email', () => {
    const result = createTechnicianSchema.safeParse({ name: 'Juan', email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  test('rejects a missing name', () => {
    const result = createTechnicianSchema.safeParse({ email: 'juan@safetech.com' });
    expect(result.success).toBe(false);
  });
});

describe('assignTechnicianSchema', () => {
  test('accepts a valid technician assignment', () => {
    const result = assignTechnicianSchema.safeParse({ technicianId: 'tech_1', technicianName: 'Juan' });
    expect(result.success).toBe(true);
  });

  test('accepts a technician assignment with only technicianId', () => {
    const result = assignTechnicianSchema.safeParse({ technicianId: 'tech_1' });
    expect(result.success).toBe(true);
  });

  test('rejects a missing technicianId', () => {
    const result = assignTechnicianSchema.safeParse({ technicianName: 'Juan' });
    expect(result.success).toBe(false);
  });
});

describe('techUpdateWarrantySchema', () => {
  test('accepts a status-only update', () => {
    const result = techUpdateWarrantySchema.safeParse({ status: 'resolved' });
    expect(result.success).toBe(true);
  });

  test('accepts a repairNotes-only update', () => {
    const result = techUpdateWarrantySchema.safeParse({ repairNotes: 'Se reemplazo la pantalla' });
    expect(result.success).toBe(true);
  });

  test('rejects an empty object', () => {
    const result = techUpdateWarrantySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  test('rejects an invalid status', () => {
    const result = techUpdateWarrantySchema.safeParse({ status: 'pending' });
    expect(result.success).toBe(false);
  });
});

describe('confirmPaymentSchema', () => {
  test('accepts a valid paymentIntentId', () => {
    const result = confirmPaymentSchema.safeParse({ paymentIntentId: 'pi_123' });
    expect(result.success).toBe(true);
  });

  test('rejects an empty paymentIntentId', () => {
    const result = confirmPaymentSchema.safeParse({ paymentIntentId: '' });
    expect(result.success).toBe(false);
  });
});
