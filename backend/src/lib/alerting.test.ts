import { beforeEach, describe, expect, test } from 'bun:test';
import { alerting } from './alerting';

describe('alerting', () => {
  beforeEach(() => {
    alerting.resetForTests();
  });

  test('reports no active alerts in a healthy, low-traffic state', () => {
    expect(alerting.getActiveAlerts()).toEqual([]);
  });

  test('triggers high_error_rate after more than 20 errors in a minute', () => {
    for (let i = 0; i < 21; i++) {
      alerting.recordError('/api/products');
    }
    const alerts = alerting.getActiveAlerts();
    expect(alerts.some((a) => a.name === 'high_error_rate')).toBe(true);
  });

  test('does not trigger high_error_rate at exactly the threshold', () => {
    for (let i = 0; i < 20; i++) {
      alerting.recordError('/api/products');
    }
    const alerts = alerting.getActiveAlerts();
    expect(alerts.some((a) => a.name === 'high_error_rate')).toBe(false);
  });

  test('triggers checkout_failures after more than 5 checkout errors in a minute', () => {
    for (let i = 0; i < 6; i++) {
      alerting.recordError('/api/checkout');
    }
    const alerts = alerting.getActiveAlerts();
    expect(alerts.some((a) => a.name === 'checkout_failures')).toBe(true);
  });

  test('triggers webhook_failures after more than 3 webhook errors in a minute', () => {
    for (let i = 0; i < 4; i++) {
      alerting.recordError('/api/webhooks/stripe');
    }
    const alerts = alerting.getActiveAlerts();
    expect(alerts.some((a) => a.name === 'webhook_failures')).toBe(true);
  });

  test('counts webhook errors towards checkout_failures too, since webhooks match both windows', () => {
    for (let i = 0; i < 6; i++) {
      alerting.recordError('/api/webhooks/stripe');
    }
    const alerts = alerting.getActiveAlerts();
    expect(alerts.some((a) => a.name === 'checkout_failures')).toBe(true);
    expect(alerts.some((a) => a.name === 'webhook_failures')).toBe(true);
  });

  test('does not count unrelated errors towards checkout or webhook windows', () => {
    for (let i = 0; i < 10; i++) {
      alerting.recordError('/api/products');
    }
    const alerts = alerting.getActiveAlerts();
    expect(alerts.some((a) => a.name === 'checkout_failures')).toBe(false);
    expect(alerts.some((a) => a.name === 'webhook_failures')).toBe(false);
  });

  test('triggers db_unhealthy when the database connection is marked unhealthy', () => {
    alerting.setDbHealth(false);
    const alerts = alerting.getActiveAlerts();
    expect(alerts.some((a) => a.name === 'db_unhealthy')).toBe(true);
  });

  test('clears db_unhealthy once the connection recovers', () => {
    alerting.setDbHealth(false);
    alerting.setDbHealth(true);
    const alerts = alerting.getActiveAlerts();
    expect(alerts.some((a) => a.name === 'db_unhealthy')).toBe(false);
  });
});
