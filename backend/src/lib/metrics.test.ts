import { describe, expect, test } from 'bun:test';
import { MetricsStore } from './metrics';

describe('MetricsStore', () => {
  test('starts with an empty snapshot', () => {
    const store = new MetricsStore();
    const snapshot = store.getSnapshot();
    expect(snapshot.requests.total).toBe(0);
    expect(snapshot.requests.errors).toBe(0);
    expect(snapshot.requests.avgDuration).toBe(0);
    expect(snapshot.topRoutes).toEqual([]);
    expect(snapshot.business).toEqual([]);
  });

  test('aggregates request counts, durations and status codes', () => {
    const store = new MetricsStore();
    store.recordRequest('GET', '/api/products', 200, 100);
    store.recordRequest('GET', '/api/products', 200, 300);

    const snapshot = store.getSnapshot();
    expect(snapshot.requests.total).toBe(2);
    expect(snapshot.requests.avgDuration).toBe(200);
    expect(snapshot.requests.byStatus[200]).toBe(2);
    expect(snapshot.requests.errors).toBe(0);
  });

  test('counts responses with status >= 400 as errors', () => {
    const store = new MetricsStore();
    store.recordRequest('POST', '/api/checkout', 500, 50);
    store.recordRequest('GET', '/api/products', 200, 50);

    const snapshot = store.getSnapshot();
    expect(snapshot.requests.errors).toBe(1);
    expect(snapshot.requests.errorRate).toBe(50);
  });

  test('tracks per-route stats independently of the global total', () => {
    const store = new MetricsStore();
    store.recordRequest('GET', '/api/products', 200, 100);
    store.recordRequest('GET', '/api/orders', 404, 20);

    const snapshot = store.getSnapshot();
    const routes = snapshot.topRoutes.map((r) => r.route);
    expect(routes).toContain('GET /api/products');
    expect(routes).toContain('GET /api/orders');

    const ordersRoute = snapshot.topRoutes.find((r) => r.route === 'GET /api/orders');
    expect(ordersRoute?.errors).toBe(1);
    expect(ordersRoute?.errorRate).toBe(100);
  });

  test('records a business event and includes it in recent counts', () => {
    const store = new MetricsStore();
    store.recordBusiness('order_paid');
    store.recordBusiness('order_paid');

    const snapshot = store.getSnapshot();
    const event = snapshot.business.find((b) => b.event === 'order_paid');
    expect(event?.count).toBe(2);
    expect(event?.recent).toBe(2);
  });

  test('orders topRoutes by descending request count', () => {
    const store = new MetricsStore();
    store.recordRequest('GET', '/api/low-traffic', 200, 10);
    for (let i = 0; i < 3; i++) {
      store.recordRequest('GET', '/api/high-traffic', 200, 10);
    }

    const snapshot = store.getSnapshot();
    expect(snapshot.topRoutes[0].route).toBe('GET /api/high-traffic');
  });
});
