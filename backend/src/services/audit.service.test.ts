import { afterEach, describe, expect, mock, test } from 'bun:test';
import { recordAuditLog } from './audit.service';
import { AuditLog } from '../models/AuditLog';

afterEach(() => {
  mock.restore();
});

describe('recordAuditLog', () => {
  test('creates an audit log entry with the given fields', async () => {
    const created = { _id: 'log_1' };
    const create = mock(() => Promise.resolve(created));
    AuditLog.create = create as unknown as typeof AuditLog.create;

    const result = await recordAuditLog({
      userId: 'admin_1',
      action: 'product.create',
      resourceType: 'Product',
      resourceId: 'prod_1',
      metadata: { name: 'iPhone 13' },
    });

    expect(create).toHaveBeenCalledWith({
      userId: 'admin_1',
      action: 'product.create',
      resourceType: 'Product',
      resourceId: 'prod_1',
      metadata: { name: 'iPhone 13' },
    });
    expect(result).toBe(created);
  });

  test('allows omitting metadata', async () => {
    const create = mock(() => Promise.resolve({ _id: 'log_2' }));
    AuditLog.create = create as unknown as typeof AuditLog.create;

    await recordAuditLog({
      userId: 'admin_1',
      action: 'order.refund',
      resourceType: 'Order',
      resourceId: 'order_1',
    });

    expect(create).toHaveBeenCalledWith({
      userId: 'admin_1',
      action: 'order.refund',
      resourceType: 'Order',
      resourceId: 'order_1',
      metadata: undefined,
    });
  });
});
