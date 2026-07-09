import { randomUUID } from 'node:crypto';
import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { AppEnv } from '../../config/env.js';
import { logAuditEvent } from '../../services/audit-log.js';
import { BackendApiError, type BackendApiClient } from '../../services/backend-api.js';
import type { Logger } from '../../utils/logger.js';
import { buildToolMeta } from '../access-control.js';

const listMyWarrantiesInputSchema = z.object({}).strict();

const warrantyOrderSchema = z.object({
  id: z.string().min(1),
  totalAmount: z.number().optional(),
  status: z.enum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'failed']).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const warrantySummarySchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'review', 'resolved', 'rejected', 'refunded']),
  description: z.string(),
  evidenceUrls: z.array(z.string().url()),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  resolvedAt: z.string().optional(),
  technicianId: z.string().optional(),
  technicianName: z.string().optional(),
  order: warrantyOrderSchema,
});

const listMyWarrantiesOutputSchema = z.object({
  warranties: z.array(warrantySummarySchema),
  count: z.number().int().min(0),
});

interface RegisterListMyWarrantiesToolDependencies {
  env: AppEnv;
  logger: Logger;
  backendApi: BackendApiClient;
}

export function registerListMyWarrantiesTool(
  server: McpServer,
  { env, logger, backendApi }: RegisterListMyWarrantiesToolDependencies,
) {
  server.registerTool(
    'list_my_warranties',
    {
      title: 'List My Warranties',
      description: 'Devuelve los reclamos de garantia del usuario autenticado con su estado, fechas, orden relacionada y tecnico asignado si existe.',
      inputSchema: listMyWarrantiesInputSchema,
      outputSchema: listMyWarrantiesOutputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
      },
      _meta: {
        ...buildToolMeta('user', {
          issue: '#191',
          source: `${env.BACKEND_API_URL}/warranties/mine`,
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
            message: 'Se requiere autenticacion para consultar las garantias del usuario.',
          };

          logAuditEvent(logger, {
            requestId: auditRequestId,
            actor,
            role: extractRole(ctx),
            action: 'tool.list_my_warranties',
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

        const response = await backendApi.getMyWarranties(token, auditRequestId);
        const output = {
          warranties: response.data,
          count: response.data.length,
        };

        logAuditEvent(logger, {
          requestId: auditRequestId,
          actor,
          role: extractRole(ctx),
          action: 'tool.list_my_warranties',
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
          action: 'tool.list_my_warranties',
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
        message: 'La sesion no es valida para consultar garantias.',
      };
    }

    if (error.status === 403) {
      return {
        code: 'FORBIDDEN',
        message: 'No tienes permiso para consultar estas garantias.',
      };
    }

    return {
      code: `BACKEND_${error.status}`,
      message: 'No fue posible consultar las garantias en este momento.',
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'Ocurrio un error inesperado al consultar las garantias.',
  };
}
