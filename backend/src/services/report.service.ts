import { Order } from '../models/Order';
import { WarrantyReport } from '../models/WarrantyReport';

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

interface GetWarrantyReportInput {
  from: Date;
  to: Date;
}

interface WarrantyReportSummary {
  totalCases: number;
}

interface WarrantyReportByStatusItem {
  status: 'pending' | 'review' | 'resolved' | 'rejected' | 'refunded';
  count: number;
}

interface WarrantyReportByTechnicianItem {
  technicianId?: string;
  technicianName: string;
  count: number;
}

export interface WarrantyReportResult {
  summary: WarrantyReportSummary;
  byStatus: WarrantyReportByStatusItem[];
  byTechnician: WarrantyReportByTechnicianItem[];
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

export async function getWarrantyReport({ from, to }: GetWarrantyReportInput): Promise<WarrantyReportResult> {
  const [totalCasesAggregation, byStatusAggregation, byTechnicianAggregation] = await Promise.all([
    WarrantyReport.aggregate<{ totalCases: number }>([
      {
        $match: {
          createdAt: {
            $gte: from,
            $lte: to,
          },
        },
      },
      {
        $count: 'totalCases',
      },
    ]),
    WarrantyReport.aggregate<WarrantyReportByStatusItem>([
      {
        $match: {
          createdAt: {
            $gte: from,
            $lte: to,
          },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
      {
        $sort: {
          status: 1,
        },
      },
    ]),
    WarrantyReport.aggregate<WarrantyReportByTechnicianItem>([
      {
        $match: {
          createdAt: {
            $gte: from,
            $lte: to,
          },
        },
      },
      {
        $group: {
          _id: {
            technicianId: '$technicianId',
            technicianName: '$technicianName',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          technicianId: '$_id.technicianId',
          technicianName: {
            $ifNull: ['$_id.technicianName', 'Sin tecnico asignado'],
          },
          count: 1,
        },
      },
      {
        $sort: {
          count: -1,
          technicianName: 1,
        },
      },
    ]),
  ]);

  return {
    summary: {
      totalCases: totalCasesAggregation[0]?.totalCases ?? 0,
    },
    byStatus: byStatusAggregation,
    byTechnician: byTechnicianAggregation,
    range: {
      from: from.toISOString(),
      to: to.toISOString(),
    },
  };
}
