import { Context, Next } from 'hono';

interface MetricBucket {
  count: number;
  totalDuration: number;
  errors: number;
  byStatus: Record<number, number>;
}

interface BusinessMetric {
  count: number;
  timestamps: number[];
}

export class MetricsStore {
  private requests: MetricBucket = { count: 0, totalDuration: 0, errors: 0, byStatus: {} };
  private routes: Record<string, MetricBucket> = {};
  private business: Record<string, BusinessMetric> = {};
  private startedAt = Date.now();

  recordRequest(method: string, path: string, statusCode: number, duration: number) {
    this.requests.count++;
    this.requests.totalDuration += duration;
    if (statusCode >= 400) this.requests.errors++;
    this.requests.byStatus[statusCode] = (this.requests.byStatus[statusCode] || 0) + 1;

    const key = `${method} ${path}`;
    if (!this.routes[key]) {
      this.routes[key] = { count: 0, totalDuration: 0, errors: 0, byStatus: {} };
    }
    const route = this.routes[key];
    route.count++;
    route.totalDuration += duration;
    if (statusCode >= 400) route.errors++;
    route.byStatus[statusCode] = (route.byStatus[statusCode] || 0) + 1;
  }

  recordBusiness(event: string) {
    if (!this.business[event]) {
      this.business[event] = { count: 0, timestamps: [] };
    }
    this.business[event].count++;
    this.business[event].timestamps.push(Date.now());
    if (this.business[event].timestamps.length > 1000) {
      this.business[event].timestamps = this.business[event].timestamps.slice(-500);
    }
  }

  getSnapshot() {
    const uptimeMs = Date.now() - this.startedAt;
    const avgDuration = this.requests.count > 0
      ? Math.round(this.requests.totalDuration / this.requests.count)
      : 0;

    const topRoutes = Object.entries(this.routes)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20)
      .map(([route, data]) => ({
        route,
        count: data.count,
        avgDuration: data.count > 0 ? Math.round(data.totalDuration / data.count) : 0,
        errors: data.errors,
        errorRate: data.count > 0 ? Math.round((data.errors / data.count) * 100 * 100) / 100 : 0,
      }));

    return {
      uptime: Math.round(uptimeMs / 1000),
      requests: {
        total: this.requests.count,
        errors: this.requests.errors,
        errorRate: this.requests.count > 0
          ? Math.round((this.requests.errors / this.requests.count) * 100 * 100) / 100
          : 0,
        avgDuration,
        byStatus: this.requests.byStatus,
      },
      topRoutes,
      business: Object.entries(this.business).map(([event, data]) => ({
        event,
        count: data.count,
        recent: data.timestamps.filter((t) => t > Date.now() - 3600000).length,
      })),
    };
  }
}

export const metrics = new MetricsStore();

export const metricsMiddleware = async (c: Context, next: Next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  const requestId = c.get('requestId') as string;
  metrics.recordRequest(c.req.method, c.req.path, c.res.status, duration);
};

export const metricsHandler = (c: Context) => {
  return c.json(metrics.getSnapshot());
};
