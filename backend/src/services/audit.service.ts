import { AuditLog } from '../models/AuditLog';

export interface RecordAuditLogParams {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
}

export async function recordAuditLog(params: RecordAuditLogParams) {
  const { userId, action, resourceType, resourceId, metadata } = params;

  return AuditLog.create({ userId, action, resourceType, resourceId, metadata });
}
