import { Context } from 'hono';
import { StatusCode } from 'hono/utils/http-status';
import { logger } from '../lib/logger';

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const errorHandler = (err: Error, c: Context) => {
  const requestId = c.get('requestId') as string;
  logger.error('unhandled:error', { requestId, method: c.req.method, path: c.req.path }, err);

  if (err instanceof AppError) {
    return c.json(
      { success: false, error: { message: err.message, code: err.code } },
      err.statusCode as StatusCode,
    );
  }

  if (err.message.includes('STRIPE_SECRET_KEY')) {
    return c.json(
      { success: false, error: { message: 'Payment service not configured', code: 'PAYMENT_CONFIG_ERROR' } },
      500,
    );
  }

  if (err.message.includes('STRIPE')) {
    return c.json(
      { success: false, error: { message: 'Payment processing error', code: 'PAYMENT_ERROR' } },
      502,
    );
  }

  if (err.message.includes('E11000') || err.message.includes('duplicate key')) {
    return c.json(
      { success: false, error: { message: 'Resource already exists', code: 'DUPLICATE_RESOURCE' } },
      409,
    );
  }

  if (err.name === 'CastError' || err.message.includes('ObjectId')) {
    return c.json(
      { success: false, error: { message: 'Invalid resource ID format', code: 'INVALID_ID' } },
      400,
    );
  }

  return c.json(
    { success: false, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
    500,
  );
};

export const notFoundHandler = (c: Context) => {
  return c.json(
    { success: false, error: { message: `Route ${c.req.method} ${c.req.path} not found`, code: 'NOT_FOUND' } },
    404,
  );
};
