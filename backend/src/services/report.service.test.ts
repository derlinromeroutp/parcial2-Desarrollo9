import { afterEach, describe, expect, mock, test } from 'bun:test';
import { Order } from '../models/Order';
import { getSalesReport } from './report.service';

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
