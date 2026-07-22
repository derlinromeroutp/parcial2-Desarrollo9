import { afterEach, describe, expect, mock, test } from 'bun:test';
import { getProductInspection, upsertProductInspection } from './inspection.controller';
import { InspectionReport } from '../models/InspectionReport';
import { Product } from '../models/Product';
import { Technician } from '../models/Technician';

const validId = '507f1f77bcf86cd799439011';

function createContext(options: { param?: string; json?: Record<string, unknown>; technicianDocId?: string } = {}) {
  let statusCode = 200;
  let payload: unknown;

  const context = {
    req: {
      param: () => options.param,
      valid: (_key: string) => options.json ?? {},
    },
    get: (key: string) => (key === 'technicianDocId' ? options.technicianDocId : undefined),
    json: (value: unknown, status?: number) => {
      payload = value;
      statusCode = status ?? 200;
      return { payload: value, status: statusCode };
    },
  };

  return {
    context,
    get statusCode() {
      return statusCode;
    },
    get payload() {
      return payload;
    },
  };
}

afterEach(() => {
  mock.restore();
});

describe('getProductInspection controller', () => {
  test('returns a 400 for an invalid product id', async () => {
    const harness = createContext({ param: 'not-an-id' });

    await getProductInspection(harness.context as never);

    expect(harness.statusCode).toBe(400);
    expect(harness.payload).toEqual({ success: false, message: 'ID de producto invalido' });
  });

  test('returns data: null when no report exists, not an error', async () => {
    InspectionReport.findOne = mock(() => Promise.resolve(null)) as typeof InspectionReport.findOne;

    const harness = createContext({ param: validId });

    await getProductInspection(harness.context as never);

    expect(harness.statusCode).toBe(200);
    expect(harness.payload).toEqual({ success: true, data: null });
  });

  test('returns the existing report', async () => {
    const report = { product: validId, checklist: [{ aspect: 'Pantalla', result: 'Sin rayones', passed: true }] };
    InspectionReport.findOne = mock(() => Promise.resolve(report)) as typeof InspectionReport.findOne;

    const harness = createContext({ param: validId });

    await getProductInspection(harness.context as never);

    expect(harness.statusCode).toBe(200);
    expect(harness.payload).toEqual({ success: true, data: report });
  });
});

describe('upsertProductInspection controller', () => {
  test('returns a 400 for an invalid product id', async () => {
    const harness = createContext({ param: 'not-an-id' });

    await upsertProductInspection(harness.context as never);

    expect(harness.statusCode).toBe(400);
    expect(harness.payload).toEqual({ success: false, message: 'ID de producto invalido' });
  });

  test('returns a 404 when the product does not exist', async () => {
    Product.findById = mock(() => Promise.resolve(null)) as typeof Product.findById;

    const harness = createContext({ param: validId });

    await upsertProductInspection(harness.context as never);

    expect(harness.statusCode).toBe(404);
    expect(harness.payload).toEqual({ success: false, message: 'Producto no encontrado' });
  });

  test('upserts the report tagging the acting technician', async () => {
    Product.findById = mock(() => Promise.resolve({ _id: validId })) as typeof Product.findById;
    Technician.findById = mock(() => Promise.resolve({ _id: 'tech_1', name: 'Ana Pérez' })) as typeof Technician.findById;

    const checklist = [{ aspect: 'Batería', result: '92% de salud', passed: true }];
    const updatedReport = { product: validId, checklist, technicianId: 'tech_1', technicianName: 'Ana Pérez' };
    const findOneAndUpdate = mock(() => Promise.resolve(updatedReport));
    InspectionReport.findOneAndUpdate = findOneAndUpdate as typeof InspectionReport.findOneAndUpdate;

    const harness = createContext({ param: validId, json: { checklist }, technicianDocId: 'tech_1' });

    await upsertProductInspection(harness.context as never);

    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { product: validId },
      expect.objectContaining({ checklist, technicianId: 'tech_1', technicianName: 'Ana Pérez' }),
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    expect(harness.statusCode).toBe(200);
    expect(harness.payload).toEqual({ success: true, data: updatedReport });
  });
});
