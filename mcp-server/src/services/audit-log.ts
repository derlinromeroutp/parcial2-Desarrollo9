import type { Logger } from '../utils/logger.js';

interface AuditEvent {
  requestId: string;
  actor: string;
  role: string;
  action: string;
  outcome: 'success' | 'error';
  durationMs: number;
  errorCode?: string;
}

export function logAuditEvent(logger: Logger, event: AuditEvent) {
  logger.info('audit.event', { ...event });
}
