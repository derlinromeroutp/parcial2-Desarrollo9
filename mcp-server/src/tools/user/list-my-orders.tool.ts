import { randomUUID } from 'node:crypto';
import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { AppEnv } from '../../config/env.js';
import { logAuditEvent } from '../../services/audit-log.js';
import { BackendApiError, type BackendApiClient } from '../../services/backend-api.js';
import type { Logger } from '../../utils/logger.js';
import { buildToolMeta } from '../access-control.js';

const listMyOrdersInputSchema = z.object({}).strict();

const orderProductSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  stock: z.number().int().optional(),
  condition: z.enum(['A', 'B', 'C']).optional(),
  category: z.enum(['celular', 'laptop', 'pc', 'auriculares', 'tablet']).optional(),
  primaryImageUrl: z.string().url().optional(),
});

const orderItemSchema = z.object({
  id: z.string(),
  quantity: z.number().int().min(1),
  price: z.number(),
  product: orderProductSchema.optional(),
});

const shippingAddressSchema = z.object({
  recipientName: z.string().optional(),
  phone: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

const orderSummarySchema = z.object({
  id: z.string(),
  totalAmount: z.number(),
  status: z.enum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'failed']),
  createdAt: z.string(),
  updatedAt: z.string(),
  stripeSessionId: z.string().optional(),
  paymentIntentId: z.string().optional(),
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  shippingAddress: shippingAddressSchema.optional(),
  items: z.array(orderItemSchema),
});

const listMyOrdersOutputSchema = z.object({
  orders: z.array(orderSummarySchema),
  count: z.number().int().min(0),
});

interface RegisterListMyOrdersToolDependencies {
  env: AppEnv;
  logger: Logger;
  backendApi: BackendApiClient;
}

export function registerListMyOrdersTool(
  server: McpServer,
  { env, logger, backendApi }: RegisterListMyOrdersToolDependencies,
) {
  server.registerTool(
    'list_my_orders',
    {
      title: 'List My Orders',
      description: 'Devuelve los pedidos del usuario autenticado en SafeTech con estado, monto, fechas e items asociados.',
      inputSchema: listMyOrdersInputSchema,
      outputSchema: listMyOrdersOutputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
      },
      _meta: {
        ...buildToolMeta('user', {
          issue: '#190',
          source: `${env.BACKEND_API_URL}/orders/mine`,
        }),
      },
    },
    async (_input, ctx) => {
      const auditRequestId = randomUUID();
      const startedAt = Date.now();
      const authInfo = getAuthInfo(ctx);
      const actor = authInfo?.clientId ?? 'anonymous';
      const token = authInfo?.token;

      try {
        if (!token) {
          const authError = {
            code: 'AUTH_REQUIRED',
            message: 'Se requiere autenticacion para consultar los pedidos del usuario.',
          };

          logAuditEvent(logger, {
            requestId: auditRequestId,
            actor,
            role: extractRole(ctx),
            action: 'tool.list_my_orders',
            outcome: 'error',
            durationMs: Date.now() - startedAt,
            errorCode: authError.code,
          });

          return {
            content: [{ type: 'text', text: authError.message }],
            structuredContent: authError,
            isError: true,
          };
        }

        const response = await backendApi.getMyOrders(token, auditRequestId);
        const output = {
          orders: response.data,
          count: response.data.length,
        };

        logAuditEvent(logger, {
          requestId: auditRequestId,
          actor,
          role: extractRole(ctx),
          action: 'tool.list_my_orders',
          outcome: 'success',
          durationMs: Date.now() - startedAt,
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(output) }],
          structuredContent: output,
        };
      } catch (error) {
        const normalizedError = normalizeToolError(error);

        logAuditEvent(logger, {
          requestId: auditRequestId,
          actor,
          role: extractRole(ctx),
          action: 'tool.list_my_orders',
          outcome: 'error',
          durationMs: Date.now() - startedAt,
          errorCode: normalizedError.code,
        });

        return {
          content: [{ type: 'text', text: normalizedError.message }],
          structuredContent: normalizedError,
          isError: true,
        };
      }
    },
  );
}

function extractRole(ctx: Parameters<Parameters<McpServer['registerTool']>[2]>[1]) {
  const roleScope = getAuthInfo(ctx)?.scopes?.find((scope: string) => scope.startsWith('role:'));
  return roleScope?.replace('role:', '') ?? 'unknown';
}

function getAuthInfo(ctx: Parameters<Parameters<McpServer['registerTool']>[2]>[1]) {
  return ctx.http?.authInfo ?? (ctx as { authInfo?: { token?: string; clientId?: string; scopes?: string[] } }).authInfo;
}

function normalizeToolError(error: unknown) {
  if (error instanceof BackendApiError) {
    if (error.status === 401) {
      return {
        code: 'AUTH_REQUIRED',
        message: 'La sesion no es valida para consultar pedidos.',
      };
    }

    if (error.status === 403) {
      return {
        code: 'FORBIDDEN',
        message: 'No tienes permiso para consultar estos pedidos.',
      };
    }

    return {
      code: `BACKEND_${error.status}`,
      message: 'No fue posible consultar los pedidos en este momento.',
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'Ocurrio un error inesperado al consultar los pedidos.',
  };
}
