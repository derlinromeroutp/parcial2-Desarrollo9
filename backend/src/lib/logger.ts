import { Context, Next } from 'hono';
import crypto from 'crypto';

export interface LogContext {
  requestId: string;
  method: string;
  path: string;
  statusCode?: number;
  duration?: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

const formatLog = (level: string, message: string, ctx?: Partial<LogContext>) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...ctx,
  };
  return JSON.stringify(entry);
};

export const logger = {
  info: (message: string, ctx?: Partial<LogContext>) => console.log(formatLog('info', message, ctx)),
  warn: (message: string, ctx?: Partial<LogContext>) => console.warn(formatLog('warn', message, ctx)),
  error: (message: string, ctx?: Partial<LogContext>, error?: Error) => {
    const entry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      ...ctx,
      ...(error ? { stack: error.stack, errorName: error.name } : {}),
    };
    console.error(JSON.stringify(entry));
  },
};

export const requestIdMiddleware = async (c: Context, next: Next) => {
  const requestId = c.req.header('x-request-id') || crypto.randomUUID();
  c.set('requestId', requestId);
  c.header('x-request-id', requestId);
  await next();
};

export const requestLogger = async (c: Context, next: Next) => {
  const start = Date.now();
  const requestId = c.get('requestId') as string;
  const method = c.req.method;
  const path = c.req.path;

  logger.info('request:start', { requestId, method, path, ip: c.req.header('x-forwarded-for'), userAgent: c.req.header('user-agent') });

  await next();

  const duration = Date.now() - start;
  const statusCode = c.res.status;

  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  logger[level]('request:complete', { requestId, method, path, statusCode, duration });
};
