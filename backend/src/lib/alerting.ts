import { logger } from './logger';

interface AlertRule {
  name: string;
  check: () => boolean;
  severity: 'critical' | 'warning';
  message: () => string;
}

interface AlertState {
  lastTriggered: Record<string, number>;
  cooldownMs: number;
}

const state: AlertState = {
  lastTriggered: {},
  cooldownMs: 5 * 60 * 1000,
};

let dbHealthy = true;
let errorWindow: number[] = [];
let checkoutErrorWindow: number[] = [];
let webhookErrorWindow: number[] = [];

export const alerting = {
  setDbHealth(healthy: boolean) {
    dbHealthy = healthy;
  },

  recordError(path: string) {
    const now = Date.now();
    errorWindow.push(now);
    errorWindow = errorWindow.filter((t) => t > now - 60000);

    if (path.includes('/checkout') || path.includes('/webhooks')) {
      checkoutErrorWindow.push(now);
      checkoutErrorWindow = checkoutErrorWindow.filter((t) => t > now - 60000);
    }

    if (path.includes('/webhooks')) {
      webhookErrorWindow.push(now);
      webhookErrorWindow = webhookErrorWindow.filter((t) => t > now - 60000);
    }
  },

  checkAlerts() {
    const now = Date.now();
    const rules: AlertRule[] = [
      {
        name: 'high_error_rate',
        severity: 'critical',
        check: () => errorWindow.length > 20,
        message: () => `High error rate: ${errorWindow.length} errors in the last minute`,
      },
      {
        name: 'checkout_failures',
        severity: 'critical',
        check: () => checkoutErrorWindow.length > 5,
        message: () => `Checkout/webhook failures: ${checkoutErrorWindow.length} in the last minute`,
      },
      {
        name: 'webhook_failures',
        severity: 'critical',
        check: () => webhookErrorWindow.length > 3,
        message: () => `Webhook processing failures: ${webhookErrorWindow.length} in the last minute`,
      },
      {
        name: 'db_unhealthy',
        severity: 'critical',
        check: () => !dbHealthy,
        message: () => 'Database connection is unhealthy',
      },
    ];

    for (const rule of rules) {
      if (rule.check()) {
        const last = state.lastTriggered[rule.name] || 0;
        if (now - last > state.cooldownMs) {
          state.lastTriggered[rule.name] = now;
          logger.error(`ALERT:${rule.severity.toUpperCase()}: ${rule.name}`, {
            method: 'SYSTEM',
            path: 'alerting',
          });
          logger.error(rule.message(), { method: 'SYSTEM', path: 'alerting' });
        }
      }
    }
  },

  getActiveAlerts() {
    const now = Date.now();
    const alerts: { name: string; severity: string; active: boolean; message: string }[] = [];

    if (errorWindow.length > 20) {
      alerts.push({
        name: 'high_error_rate',
        severity: 'critical',
        active: true,
        message: `${errorWindow.length} errors in the last minute`,
      });
    }
    if (checkoutErrorWindow.length > 5) {
      alerts.push({
        name: 'checkout_failures',
        severity: 'critical',
        active: true,
        message: `${checkoutErrorWindow.length} checkout/webhook failures in the last minute`,
      });
    }
    if (webhookErrorWindow.length > 3) {
      alerts.push({
        name: 'webhook_failures',
        severity: 'critical',
        active: true,
        message: `${webhookErrorWindow.length} webhook failures in the last minute`,
      });
    }
    if (!dbHealthy) {
      alerts.push({
        name: 'db_unhealthy',
        severity: 'critical',
        active: true,
        message: 'Database connection is unhealthy',
      });
    }

    return alerts;
  },
};

setInterval(() => alerting.checkAlerts(), 30000);
