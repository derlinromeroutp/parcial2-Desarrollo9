import { Order } from '../models/Order';

interface GetSalesReportInput {
  from: Date;
  to: Date;
}

interface SalesReportSummary {
  ordersCount: number;
  grossRevenue: number;
  averageOrderValue: number;
}

interface SalesReportRange {
  from: string;
  to: string;
}

export interface SalesReportResult {
  summary: SalesReportSummary;
  range: SalesReportRange;
}

export async function getSalesReport({ from, to }: GetSalesReportInput): Promise<SalesReportResult> {
  const [aggregation] = await Order.aggregate<{
    ordersCount: number;
    grossRevenue: number;
  }>([
    {
      $match: {
        status: 'paid',
        createdAt: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $group: {
        _id: null,
        ordersCount: { $sum: 1 },
        grossRevenue: { $sum: '$total_amount' },
      },
    },
    {
      $project: {
        _id: 0,
        ordersCount: 1,
        grossRevenue: 1,
      },
    },
  ]);

  const ordersCount = aggregation?.ordersCount ?? 0;
  const grossRevenue = aggregation?.grossRevenue ?? 0;
  const averageOrderValue = ordersCount > 0 ? Number((grossRevenue / ordersCount).toFixed(2)) : 0;

  return {
    summary: {
      ordersCount,
      grossRevenue,
      averageOrderValue,
    },
    range: {
      from: from.toISOString(),
      to: to.toISOString(),
    },
  };
}
