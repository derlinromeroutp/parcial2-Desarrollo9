import { Context } from 'hono';
import { getSalesReport } from '../services/report.service';

export const getSalesReportController = async (c: Context) => {
  try {
    const fromRaw = c.req.query('from');
    const toRaw = c.req.query('to');

    if (!fromRaw || !toRaw) {
      return c.json({ success: false, errors: [{ message: 'from y to son requeridos' }] }, 400);
    }

    const report = await getSalesReport({
      from: new Date(fromRaw),
      to: new Date(toRaw),
    });

    return c.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    return c.json({ success: false, message: 'Failed to fetch sales report' }, 500);
  }
};
