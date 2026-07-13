import { afterEach, describe, expect, mock, test } from 'bun:test';
import { assignTechnician } from './warranty.controller';
import { Technician } from '../models/Technician';
import { WarrantyReport } from '../models/WarrantyReport';

function createContext(body: Record<string, unknown>, id = 'wr_1') {
  let statusCode = 200;
  let payload: unknown;

  const context = {
    req: {
      param: () => ({ id }),
      json: async () => body,
    },
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

describe('assignTechnician controller', () => {
  test('resolves technician name from technicianId and updates the report', async () => {
    const technicianLookup = mock(() =>
      Promise.resolve({ _id: 'tech_1', name: 'Maria Gomez', active: true }),
    );
    const previousLookup = mock(() =>
      Promise.resolve({ _id: 'wr_1', status: 'review' }),
    );
    const updateReport = mock(() =>
      Promise.resolve({
        _id: 'wr_1',
        orderId: 'ord_1',
        userId: 'user_1',
        status: 'review',
        description: 'Falla de bateria',
        technicianId: 'tech_1',
        technicianName: 'Maria Gomez',
      }),
    );

    Technician.findById = technicianLookup as typeof Technician.findById;
    WarrantyReport.findById = previousLookup as typeof WarrantyReport.findById;
    WarrantyReport.findByIdAndUpdate = updateReport as typeof WarrantyReport.findByIdAndUpdate;

    const harness = createContext({ technicianId: 'tech_1' });

    await assignTechnician(harness.context as never);

    expect(technicianLookup).toHaveBeenCalledWith('tech_1');
    expect(updateReport).toHaveBeenCalledWith(
      'wr_1',
      expect.objectContaining({
        technicianId: 'tech_1',
        technicianName: 'Maria Gomez',
        status: 'review',
      }),
      { new: true },
    );
    expect(harness.statusCode).toBe(200);
  });

  test('returns 409 when the technician exists but is inactive', async () => {
    const technicianLookup = mock(() =>
      Promise.resolve({ _id: 'tech_1', name: 'Maria Gomez', active: false }),
    );

    Technician.findById = technicianLookup as typeof Technician.findById;

    const harness = createContext({ technicianId: 'tech_1' });

    await assignTechnician(harness.context as never);

    expect(harness.statusCode).toBe(409);
    expect(harness.payload).toEqual({ error: 'Technician is inactive' });
  });
});
