import { afterEach, describe, expect, mock, test } from 'bun:test';
import { getAuditLogs } from './audit.controller';
import { AuditLog } from '../models/AuditLog';

function createContext() {
  let statusCode = 200;
  let payload: unknown;

  const context = {
    json: (value: unknown, status?: number) => {
      payload = value;
      statusCode = status ?? 200;
      return { payload: value, status: statusCode };
    },
  };

  return {
    context,
    get statusCode() {
      return statusCode;
    },
    get payload() {
      return payload;
    },
  };
}

function createSortLimitQuery(result: unknown) {
  const limitSpy = mock(() => Promise.resolve(result));
  const sortSpy = mock(() => ({ limit: limitSpy }));
  return { sortSpy, limitSpy, query: { sort: sortSpy } };
}

afterEach(() => {
  mock.restore();
});

describe('getAuditLogs controller', () => {
  test('returns logs sorted by most recent first, capped at 200', async () => {
    const logs = [{ _id: 'log_2' }, { _id: 'log_1' }];
    const { sortSpy, limitSpy, query } = createSortLimitQuery(logs);
    AuditLog.find = mock(() => query) as unknown as typeof AuditLog.find;

    const harness = createContext();

    await getAuditLogs(harness.context as never);

    expect(sortSpy).toHaveBeenCalledWith({ createdAt: -1 });
    expect(limitSpy).toHaveBeenCalledWith(200);
    expect(harness.statusCode).toBe(200);
    expect(harness.payload).toEqual(logs);
  });

  test('returns a 500 when the lookup fails', async () => {
    AuditLog.find = mock(() => {
      throw new Error('db down');
    }) as unknown as typeof AuditLog.find;

    const harness = createContext();

    await getAuditLogs(harness.context as never);

    expect(harness.statusCode).toBe(500);
    expect(harness.payload).toEqual({ error: 'db down' });
  });
});
