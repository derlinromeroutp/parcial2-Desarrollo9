import { randomUUID } from 'node:crypto';
import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { AppEnv } from '../../config/env.js';
import { logAuditEvent } from '../../services/audit-log.js';
import { BackendApiError, type BackendApiClient } from '../../services/backend-api.js';
import type { Logger } from '../../utils/logger.js';
import { buildToolMeta } from '../access-control.js';

const createSupportTicketInputSchema = z.object({
  category: z.string().trim().min(1),
  description: z.string().trim().min(10),
  contactChannel: z.string().trim().min(1),
});

const createSupportTicketOutputSchema = z.object({
  ticketId: z.string(),
  status: z.enum(['open', 'in_review', 'closed']),
});

interface RegisterCreateSupportTicketToolDependencies {
  env: AppEnv;
  logger: Logger;
  backendApi: BackendApiClient;
}

export function registerCreateSupportTicketTool(
  server: McpServer,
  { env, logger, backendApi }: RegisterCreateSupportTicketToolDependencies,
) {
  server.registerTool(
    'create_support_ticket',
    {
      title: 'Create Support Ticket',
      description:
        'Crea un ticket de soporte para el usuario autenticado con categoria, descripcion y canal de contacto.',
      inputSchema: createSupportTicketInputSchema,
      outputSchema: createSupportTicketOutputSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
      },
      _meta: {
        ...buildToolMeta('user', {
          issue: '#151',
          source: `${env.BACKEND_API_URL}/support-tickets`,
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
            message: 'Se requiere autenticacion para crear tickets de soporte.',
          };

          logAuditEvent(logger, {
            requestId: auditRequestId,
            actor,
            role: extractRole(ctx),
            action: 'tool.create_support_ticket',
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

        const response = await backendApi.createSupportTicket(token, input, auditRequestId);
        const output = response.data;

        logAuditEvent(logger, {
          requestId: auditRequestId,
          actor,
          role: extractRole(ctx),
          action: 'tool.create_support_ticket',
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
          action: 'tool.create_support_ticket',
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
        message: 'La sesion no es valida para crear tickets de soporte.',
      };
    }

    if (error.status === 400) {
      return {
        code: 'INVALID_SUPPORT_TICKET',
        message: extractBackendMessage(error.body) ?? 'Los datos del ticket de soporte no son validos.',
      };
    }

    return {
      code: `BACKEND_${error.status}`,
      message: 'No fue posible crear el ticket de soporte en este momento.',
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'Ocurrio un error inesperado al crear el ticket de soporte.',
  };
}

function extractBackendMessage(body: unknown) {
  if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
    return body.error;
  }

  return null;
}
