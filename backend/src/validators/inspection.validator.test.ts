import { describe, expect, test } from 'bun:test';
import { upsertInspectionSchema } from './inspection.validator';

describe('upsertInspectionSchema', () => {
  test('accepts a checklist with at least one item', () => {
    const result = upsertInspectionSchema.safeParse({
      checklist: [{ aspect: 'Pantalla', result: 'Sin rayones', passed: true }],
    });
    expect(result.success).toBe(true);
  });

  test('defaults passed to true when omitted', () => {
    const result = upsertInspectionSchema.safeParse({
      checklist: [{ aspect: 'Pantalla', result: 'Sin rayones' }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.checklist[0].passed).toBe(true);
    }
  });

  test('rejects an empty checklist', () => {
    const result = upsertInspectionSchema.safeParse({ checklist: [] });
    expect(result.success).toBe(false);
  });

  test('rejects an item missing the result', () => {
    const result = upsertInspectionSchema.safeParse({
      checklist: [{ aspect: 'Pantalla', result: '' }],
    });
    expect(result.success).toBe(false);
  });

  test('rejects a missing checklist', () => {
    const result = upsertInspectionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
