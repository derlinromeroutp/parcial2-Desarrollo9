import { Context } from 'hono';
import { AuditLog } from '../models/AuditLog';

const MAX_AUDIT_LOGS = 200;

export const getAuditLogs = async (c: Context) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(MAX_AUDIT_LOGS);
    return c.json(logs);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};
