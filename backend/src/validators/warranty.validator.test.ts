import { describe, expect, test } from 'bun:test';
import { createWarrantySchema, updateStatusSchema } from './warranty.validator';

const validOrderId = '507f1f77bcf86cd799439011';

describe('createWarrantySchema', () => {
  test('accepts a valid warranty claim', () => {
    const result = createWarrantySchema.safeParse({
      orderId: validOrderId,
      reason: 'Producto defectuoso',
      description: 'La pantalla dejo de encender al segundo dia de uso',
    });
    expect(result.success).toBe(true);
  });

  test('defaults evidenceUrls to an empty array', () => {
    const result = createWarrantySchema.safeParse({
      orderId: validOrderId,
      reason: 'Producto defectuoso',
      description: 'La pantalla dejo de encender al segundo dia de uso',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.evidenceUrls).toEqual([]);
    }
  });

  test('rejects an invalid orderId format', () => {
    const result = createWarrantySchema.safeParse({
      orderId: 'not-an-object-id',
      reason: 'Producto defectuoso',
      description: 'La pantalla dejo de encender al segundo dia de uso',
    });
    expect(result.success).toBe(false);
  });

  test('rejects a description shorter than 10 characters', () => {
    const result = createWarrantySchema.safeParse({
      orderId: validOrderId,
      reason: 'Producto defectuoso',
      description: 'Muy corta',
    });
    expect(result.success).toBe(false);
  });

  test('rejects a missing reason', () => {
    const result = createWarrantySchema.safeParse({
      orderId: validOrderId,
      description: 'La pantalla dejo de encender al segundo dia de uso',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateStatusSchema', () => {
  test('accepts a valid status', () => {
    const result = updateStatusSchema.safeParse({ status: 'resolved' });
    expect(result.success).toBe(true);
  });

  test('accepts repairNotes alongside status', () => {
    const result = updateStatusSchema.safeParse({ status: 'refunded', repairNotes: 'Reembolso procesado' });
    expect(result.success).toBe(true);
  });

  test('rejects an invalid status', () => {
    const result = updateStatusSchema.safeParse({ status: 'unknown' });
    expect(result.success).toBe(false);
  });

  test('rejects a missing status', () => {
    const result = updateStatusSchema.safeParse({ repairNotes: 'Reembolso procesado' });
    expect(result.success).toBe(false);
  });
});
