import { randomUUID } from 'node:crypto';
import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { AppEnv } from '../../config/env.js';
import { logAuditEvent } from '../../services/audit-log.js';
import { BackendApiError, type BackendApiClient } from '../../services/backend-api.js';
import type { Logger } from '../../utils/logger.js';
import { buildToolMeta } from '../access-control.js';

const updateWarrantyStatusInputSchema = z.object({
  warrantyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid warranty ID format'),
  status: z.enum(['review', 'resolved', 'rejected', 'refunded']),
  repairNotes: z.string().trim().optional(),
});

const updateWarrantyStatusOutputSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  userId: z.string(),
  status: z.enum(['pending', 'review', 'resolved', 'rejected', 'refunded']),
  description: z.string(),
  evidenceUrls: z.array(z.string().url()),
  repairNotes: z.string().optional(),
  technicianId: z.string().optional(),
  technicianName: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  resolvedAt: z.string().optional(),
});

interface RegisterUpdateWarrantyStatusToolDependencies {
  env: AppEnv;
  logger: Logger;
  backendApi: BackendApiClient;
}

export function registerUpdateWarrantyStatusTool(
  server: McpServer,
  { env, logger, backendApi }: RegisterUpdateWarrantyStatusToolDependencies,
) {
  server.registerTool(
    'update_warranty_status',
    {
      title: 'Update Warranty Status',
      description:
        'Actualiza el estado de un reclamo de garantia existente y devuelve el estado persistido. Solo disponible para administradores.',
      inputSchema: updateWarrantyStatusInputSchema,
      outputSchema: updateWarrantyStatusOutputSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
      },
      _meta: {
        ...buildToolMeta('admin', {
          issue: '#193',
          source: `${env.BACKEND_API_URL}/warranties/:id/status`,
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
        warrantyId: input.warrantyId,
        targetStatus: input.status,
      };

      try {
        if (!token) {
          const authError = {
            code: 'AUTH_REQUIRED',
            message: 'Se requiere autenticacion para actualizar garantias.',
          };

          logAuditEvent(logger, {
            requestId: auditRequestId,
            actor,
            role,
            action: 'tool.update_warranty_status',
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
            message: 'Solo un administrador puede actualizar el estado de una garantia.',
          };

          logAuditEvent(logger, {
            requestId: auditRequestId,
            actor,
            role,
            action: 'tool.update_warranty_status',
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

        const response = await backendApi.updateWarrantyStatus(
          token,
          input.warrantyId,
          {
            status: input.status,
            ...(input.repairNotes !== undefined ? { repairNotes: input.repairNotes } : {}),
          },
          auditRequestId,
        );

        const output = response.data;

        logAuditEvent(logger, {
          requestId: auditRequestId,
          actor,
          role,
          action: 'tool.update_warranty_status',
          outcome: 'success',
          durationMs: Date.now() - startedAt,
          metadata: {
            ...auditMetadata,
            persistedStatus: output.status,
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
          action: 'tool.update_warranty_status',
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
        message: 'La sesion no es valida para actualizar garantias.',
      };
    }

    if (error.status === 403) {
      return {
        code: 'FORBIDDEN',
        message: 'No tienes permisos para actualizar el estado de esta garantia.',
      };
    }

    if (error.status === 404) {
      return {
        code: 'WARRANTY_NOT_FOUND',
        message: 'No se encontro la garantia indicada.',
      };
    }

    if (error.status === 400) {
      return {
        code: 'INVALID_WARRANTY_UPDATE',
        message:
          extractBackendMessage(error.body) ??
          'Los datos enviados para actualizar la garantia no son validos.',
      };
    }

    return {
      code: `BACKEND_${error.status}`,
      message: 'No fue posible actualizar la garantia en este momento.',
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'Ocurrio un error inesperado al actualizar la garantia.',
  };
}

function extractBackendMessage(body: unknown) {
  if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
    return body.error;
  }

  return null;
}
