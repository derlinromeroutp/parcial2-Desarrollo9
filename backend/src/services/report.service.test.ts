import { afterEach, describe, expect, mock, test } from 'bun:test';
import { Order } from '../models/Order';
import { WarrantyReport } from '../models/WarrantyReport';
import { getSalesReport, getWarrantyReport } from './report.service';

afterEach(() => {
  mock.restore();
});

describe('getSalesReport service', () => {
  test('aggregates paid orders in the requested range', async () => {
    const aggregate = mock(() =>
      Promise.resolve([{ ordersCount: 3, grossRevenue: 1500 }]),
    );
    Order.aggregate = aggregate as typeof Order.aggregate;

    const result = await getSalesReport({
      from: new Date('2026-07-01T00:00:00.000Z'),
      to: new Date('2026-07-14T23:59:59.999Z'),
    });

    expect(aggregate).toHaveBeenCalled();
    expect(result).toEqual({
      summary: {
        ordersCount: 3,
        grossRevenue: 1500,
        averageOrderValue: 500,
      },
      range: {
        from: '2026-07-01T00:00:00.000Z',
        to: '2026-07-14T23:59:59.999Z',
      },
    });
  });

  test('returns zeroed metrics when there is no data', async () => {
    const aggregate = mock(() => Promise.resolve([]));
    Order.aggregate = aggregate as typeof Order.aggregate;

    const result = await getSalesReport({
      from: new Date('2026-07-01T00:00:00.000Z'),
      to: new Date('2026-07-14T23:59:59.999Z'),
    });

    expect(result.summary).toEqual({
      ordersCount: 0,
      grossRevenue: 0,
      averageOrderValue: 0,
    });
  });
});

describe('getWarrantyReport service', () => {
  test('aggregates warranty cases by status and technician in the requested range', async () => {
    const aggregate = mock((pipeline: unknown[]) => {
      const countStage = pipeline.find(
        (stage) => typeof stage === 'object' && stage !== null && '$count' in stage,
      );
      const groupStage = pipeline.find(
        (stage) => typeof stage === 'object' && stage !== null && '$group' in stage,
      ) as { $group?: { _id?: unknown } } | undefined;

      if (countStage) {
        return Promise.resolve([{ totalCases: 4 }]);
      }

      if (
        groupStage?.$group &&
        typeof groupStage.$group._id === 'string' &&
        groupStage.$group._id === '$status'
      ) {
        return Promise.resolve([
          { status: 'pending', count: 2 },
          { status: 'resolved', count: 2 },
        ]);
      }

      return Promise.resolve([
        { technicianId: 'tech_1', technicianName: 'Maria Gomez', count: 3 },
        { technicianId: undefined, technicianName: 'Sin tecnico asignado', count: 1 },
      ]);
    });

    WarrantyReport.aggregate = aggregate as typeof WarrantyReport.aggregate;

    const result = await getWarrantyReport({
      from: new Date('2026-07-01T00:00:00.000Z'),
      to: new Date('2026-07-14T23:59:59.999Z'),
    });

    expect(aggregate).toHaveBeenCalledTimes(3);
    expect(result).toEqual({
      summary: {
        totalCases: 4,
      },
      byStatus: [
        { status: 'pending', count: 2 },
        { status: 'resolved', count: 2 },
      ],
      byTechnician: [
        { technicianId: 'tech_1', technicianName: 'Maria Gomez', count: 3 },
        { technicianId: undefined, technicianName: 'Sin tecnico asignado', count: 1 },
      ],
      range: {
        from: '2026-07-01T00:00:00.000Z',
        to: '2026-07-14T23:59:59.999Z',
      },
    });
  });

  test('returns empty sections when there is no warranty data', async () => {
    const aggregate = mock(() => Promise.resolve([]));
    WarrantyReport.aggregate = aggregate as typeof WarrantyReport.aggregate;

    const result = await getWarrantyReport({
      from: new Date('2026-07-01T00:00:00.000Z'),
      to: new Date('2026-07-14T23:59:59.999Z'),
    });

    expect(result).toEqual({
      summary: {
        totalCases: 0,
      },
      byStatus: [],
      byTechnician: [],
      range: {
        from: '2026-07-01T00:00:00.000Z',
        to: '2026-07-14T23:59:59.999Z',
      },
    });
  });
});
