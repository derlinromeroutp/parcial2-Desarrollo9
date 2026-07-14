import { randomUUID } from 'node:crypto';
import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { AppEnv } from '../../config/env.js';
import { logAuditEvent } from '../../services/audit-log.js';
import { BackendApiError, type BackendApiClient } from '../../services/backend-api.js';
import type { Logger } from '../../utils/logger.js';
import { buildToolMeta } from '../access-control.js';

const getSalesReportInputSchema = z.object({
  from: z.string().datetime({ offset: true }),
  to: z.string().datetime({ offset: true }),
}).refine(({ from, to }) => new Date(from).getTime() <= new Date(to).getTime(), {
  message: 'La fecha inicial no puede ser posterior a la fecha final',
  path: ['from'],
});

const getSalesReportOutputSchema = z.object({
  summary: z.object({
    ordersCount: z.number().int().min(0),
    grossRevenue: z.number().min(0),
    averageOrderValue: z.number().min(0),
  }),
  range: z.object({
    from: z.string(),
    to: z.string(),
  }),
});

interface RegisterGetSalesReportToolDependencies {
  env: AppEnv;
  logger: Logger;
  backendApi: BackendApiClient;
}

export function registerGetSalesReportTool(
  server: McpServer,
  { env, logger, backendApi }: RegisterGetSalesReportToolDependencies,
) {
  server.registerTool(
    'get_sales_report',
    {
      title: 'Get Sales Report',
      description:
        'Consulta un reporte consolidado de ventas para un rango de fechas y devuelve metricas agregadas del backend. Solo disponible para administradores.',
      inputSchema: getSalesReportInputSchema,
      outputSchema: getSalesReportOutputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
      },
      _meta: {
        ...buildToolMeta('admin', {
          issue: '#146',
          source: `${env.BACKEND_API_URL}/reports/sales`,
        }),
      },
    },
    async (input, ctx) => {
      const auditRequestId = randomUUID();
      const startedAt = Date.now();
      const authInfo = getAuthInfo(ctx);
      const actor = authInfo?.clientId ?? 'anonymous';
      const role = extractRole(ctx);
      const token = authInfo?.token;
      const auditMetadata = {
        from: input.from,
        to: input.to,
      };

      try {
        if (!token) {
          const authError = {
            code: 'AUTH_REQUIRED',
            message: 'Se requiere autenticacion para consultar reportes de ventas.',
          };

          logAuditEvent(logger, {
            requestId: auditRequestId,
            actor,
            role,
            action: 'tool.get_sales_report',
            outcome: 'error',
            durationMs: Date.now() - startedAt,
            errorCode: authError.code,
            metadata: auditMetadata,
          });

          return {
            content: [{ type: 'text', text: authError.message }],
            structuredContent: authError,
            isError: true,
          };
        }

        if (role !== 'admin') {
          const forbiddenError = {
            code: 'FORBIDDEN',
            message: 'Solo un administrador puede consultar reportes de ventas.',
          };

          logAuditEvent(logger, {
            requestId: auditRequestId,
            actor,
            role,
            action: 'tool.get_sales_report',
            outcome: 'error',
            durationMs: Date.now() - startedAt,
            errorCode: forbiddenError.code,
            metadata: auditMetadata,
          });

          return {
            content: [{ type: 'text', text: forbiddenError.message }],
            structuredContent: forbiddenError,
            isError: true,
          };
        }

        const response = await backendApi.getSalesReport(token, input, auditRequestId);
        const output = response.data;

        logAuditEvent(logger, {
          requestId: auditRequestId,
          actor,
          role,
          action: 'tool.get_sales_report',
          outcome: 'success',
          durationMs: Date.now() - startedAt,
          metadata: {
            ...auditMetadata,
            ordersCount: output.summary.ordersCount,
            grossRevenue: output.summary.grossRevenue,
          },
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
          role,
          action: 'tool.get_sales_report',
          outcome: 'error',
          durationMs: Date.now() - startedAt,
          errorCode: normalizedError.code,
          metadata: auditMetadata,
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
        message: 'La sesion no es valida para consultar reportes de ventas.',
      };
    }

    if (error.status === 403) {
      return {
        code: 'FORBIDDEN',
        message: 'No tienes permisos para consultar el reporte de ventas.',
      };
    }

    if (error.status === 400) {
      return {
        code: 'INVALID_DATE_RANGE',
        message: extractBackendMessage(error.body) ?? 'El rango de fechas enviado no es valido.',
      };
    }

    return {
      code: `BACKEND_${error.status}`,
      message: 'No fue posible consultar el reporte de ventas en este momento.',
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'Ocurrio un error inesperado al consultar el reporte de ventas.',
  };
}

function extractBackendMessage(body: unknown) {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  const payload = body as {
    message?: unknown;
    errors?: Array<{ message?: unknown }>;
  };

  if (typeof payload.message === 'string' && payload.message.length > 0) {
    return payload.message;
  }

  const firstMessage = payload.errors?.find((issue) => typeof issue.message === 'string')?.message;
  return typeof firstMessage === 'string' ? firstMessage : undefined;
}
