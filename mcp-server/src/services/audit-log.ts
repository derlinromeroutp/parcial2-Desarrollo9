import type { Logger } from '../utils/logger.js';

interface AuditEvent {
  requestId: string;
  actor: string;
  role: string;
  action: string;
  outcome: 'success' | 'error';
  durationMs: number;
  errorCode?: string;
  metadata?: Record<string, unknown>;
}

export function logAuditEvent(logger: Logger, event: AuditEvent) {
  logger.info('audit.event', { ...event });
}
