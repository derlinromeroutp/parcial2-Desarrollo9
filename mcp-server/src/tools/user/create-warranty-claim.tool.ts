import { randomUUID } from 'node:crypto';
import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { AppEnv } from '../../config/env.js';
import { logAuditEvent } from '../../services/audit-log.js';
import { BackendApiError, type BackendApiClient } from '../../services/backend-api.js';
import type { Logger } from '../../utils/logger.js';
import { buildToolMeta } from '../access-control.js';

const createWarrantyClaimInputSchema = z.object({
  orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Order ID format'),
  reason: z.string().trim().min(1),
  description: z.string().trim().min(10),
  evidenceUrls: z.array(z.string().url()).optional().default([]),
});

const createWarrantyClaimOutputSchema = z.object({
  ticketId: z.string(),
  status: z.enum(['pending', 'review', 'resolved', 'rejected', 'refunded']),
});

interface RegisterCreateWarrantyClaimToolDependencies {
  env: AppEnv;
  logger: Logger;
  backendApi: BackendApiClient;
}

export function registerCreateWarrantyClaimTool(
  server: McpServer,
  { env, logger, backendApi }: RegisterCreateWarrantyClaimToolDependencies,
) {
  server.registerTool(
    'create_warranty_claim',
    {
      title: 'Create Warranty Claim',
      description:
        'Crea un reclamo de garantia para una orden del usuario autenticado y devuelve el identificador del caso creado.',
      inputSchema: createWarrantyClaimInputSchema,
      outputSchema: createWarrantyClaimOutputSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
      },
      _meta: {
        ...buildToolMeta('user', {
          issue: '#192',
          source: `${env.BACKEND_API_URL}/warranties`,
        }),
      },
    },
    async (input, ctx) => {
      const auditRequestId = randomUUID();
      const startedAt = Date.now();
      const authInfo = getAuthInfo(ctx);
      const actor = authInfo?.clientId ?? 'anonymous';
      const token = authInfo?.token;

      try {
        if (!token) {
          const authError = {
            code: 'AUTH_REQUIRED',
            message: 'Se requiere autenticacion para crear un reclamo de garantia.',
          };

          logAuditEvent(logger, {
            requestId: auditRequestId,
            actor,
            role: extractRole(ctx),
            action: 'tool.create_warranty_claim',
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

        const response = await backendApi.createWarrantyClaim(
          token,
          {
            orderId: input.orderId,
            reason: input.reason,
            description: input.description,
            evidenceUrls: input.evidenceUrls ?? [],
          },
          auditRequestId,
        );

        const output = response.data;

        logAuditEvent(logger, {
          requestId: auditRequestId,
          actor,
          role: extractRole(ctx),
          action: 'tool.create_warranty_claim',
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
          action: 'tool.create_warranty_claim',
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
        message: 'La sesion no es valida para crear reclamos de garantia.',
      };
    }

    if (error.status === 403) {
      return {
        code: 'FORBIDDEN',
        message: 'No puedes crear un reclamo sobre una orden que no te pertenece.',
      };
    }

    if (error.status === 404) {
      return {
        code: 'ORDER_NOT_FOUND',
        message: 'No se encontro la orden indicada para crear el reclamo.',
      };
    }

    if (error.status === 409) {
      return {
        code: 'WARRANTY_ALREADY_EXISTS',
        message: 'Ya existe un reclamo de garantia para esta orden.',
      };
    }

    if (error.status === 400) {
      return {
        code: 'INVALID_WARRANTY_CLAIM',
        message: extractBackendMessage(error.body) ?? 'Los datos del reclamo de garantia no son validos.',
      };
    }

    return {
      code: `BACKEND_${error.status}`,
      message: 'No fue posible crear el reclamo de garantia en este momento.',
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'Ocurrio un error inesperado al crear el reclamo de garantia.',
  };
}

function extractBackendMessage(body: unknown) {
  if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
    return body.error;
  }

  return null;
}
