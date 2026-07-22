import { afterEach, describe, expect, mock, test } from 'bun:test';
import { assignTechnician, updateWarrantyStatus } from './warranty.controller';
import { Technician } from '../models/Technician';
import { WarrantyReport } from '../models/WarrantyReport';
import { AuditLog } from '../models/AuditLog';

function createContext(body: Record<string, unknown>, id = 'wr_1', userId?: string) {
  let statusCode = 200;
  let payload: unknown;

  const context = {
    req: {
      param: () => ({ id }),
      json: async () => body,
    },
    get: (key: string) => (key === 'userId' ? userId : undefined),
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

describe('updateWarrantyStatus controller', () => {
  test('records an audit log for the admin performing the update', async () => {
    const report = {
      _id: 'wr_1',
      userId: 'user_1',
      status: 'review',
      resolvedAt: undefined as Date | undefined,
      repairNotes: undefined as string | undefined,
      save: mock(() => Promise.resolve()),
    };
    WarrantyReport.findById = mock(() => Promise.resolve(report)) as typeof WarrantyReport.findById;
    const auditCreate = mock(() => Promise.resolve({ _id: 'log_1' }));
    AuditLog.create = auditCreate as unknown as typeof AuditLog.create;

    // Mismo status que el actual: evita el envio de email (rama no cubierta
    // aqui) mientras se verifica que la auditoria se registra igual.
    const harness = createContext({ status: 'review' }, 'wr_1', 'admin_1');

    await updateWarrantyStatus(harness.context as never);

    expect(report.save).toHaveBeenCalled();
    expect(auditCreate).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'admin_1',
      action: 'warranty.status_change',
      resourceType: 'WarrantyReport',
      resourceId: 'wr_1',
    }));
    expect(harness.statusCode).toBe(200);
  });

  test('returns 404 when the report does not exist', async () => {
    WarrantyReport.findById = mock(() => Promise.resolve(null)) as typeof WarrantyReport.findById;

    const harness = createContext({ status: 'resolved' }, 'missing');

    await updateWarrantyStatus(harness.context as never);

    expect(harness.statusCode).toBe(404);
  });
});
