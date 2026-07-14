import { randomUUID } from 'node:crypto';
import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { AppEnv } from '../../config/env.js';
import { logAuditEvent } from '../../services/audit-log.js';
import { BackendApiError, type BackendApiClient } from '../../services/backend-api.js';
import type { Logger } from '../../utils/logger.js';
import { buildToolMeta } from '../access-control.js';

const deleteProductInputSchema = z.object({
  productId: z.string().trim().min(1),
  reason: z.string().trim().min(1).max(500).optional(),
});

const deleteProductOutputSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    stock: z.number().int(),
    condition: z.enum(['A', 'B', 'C']),
    category: z.enum(['celular', 'laptop', 'pc', 'auriculares', 'tablet']),
    primaryImageUrl: z.string().url().optional(),
    imageUrls: z.array(z.string().url()),
  }),
});

interface RegisterDeleteProductToolDependencies {
  env: AppEnv;
  logger: Logger;
  backendApi: BackendApiClient;
}

export function registerDeleteProductTool(
  server: McpServer,
  { env, logger, backendApi }: RegisterDeleteProductToolDependencies,
) {
  server.registerTool(
    'delete_product',
    {
      title: 'Delete Product',
      description:
        'Elimina un producto del catalogo de SafeTech. Solo disponible para administradores.',
      inputSchema: deleteProductInputSchema,
      outputSchema: deleteProductOutputSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: true,
      },
      _meta: {
        ...buildToolMeta('admin', {
          issue: '#197',
          source: `${env.BACKEND_API_URL}/products/:id`,
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
        productId: input.productId,
        destructive: true,
        ...(input.reason !== undefined ? { reason: input.reason } : {}),
      };

      try {
        if (!token) {
          const authError = {
            code: 'AUTH_REQUIRED',
            message: 'Se requiere autenticacion para eliminar productos.',
          };

          logAuditEvent(logger, {
            requestId: auditRequestId,
            actor,
            role,
            action: 'tool.delete_product',
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
            message: 'Solo un administrador puede eliminar productos.',
          };

          logAuditEvent(logger, {
            requestId: auditRequestId,
            actor,
            role,
            action: 'tool.delete_product',
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

        const response = await backendApi.deleteProduct(token, input.productId, auditRequestId);
        const output = {
          success: true as const,
          message: response.data.message,
          data: normalizeDeletedProduct(response.data.data),
        };

        logAuditEvent(logger, {
          requestId: auditRequestId,
          actor,
          role,
          action: 'tool.delete_product',
          outcome: 'success',
          durationMs: Date.now() - startedAt,
          metadata: auditMetadata,
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
          action: 'tool.delete_product',
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

function normalizeDeletedProduct(
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    condition: 'A' | 'B' | 'C';
    category: 'celular' | 'laptop' | 'pc' | 'auriculares' | 'tablet';
    primaryImageUrl?: string;
    imageUrls: string[];
  },
) {
  return {
    id: product.id,
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    price: product.price,
    stock: product.stock,
    condition: product.condition,
    category: product.category,
    ...(product.primaryImageUrl ? { primaryImageUrl: product.primaryImageUrl } : {}),
    imageUrls: product.imageUrls,
  };
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
        message: 'La sesion no es valida para eliminar productos.',
      };
    }

    if (error.status === 403) {
      return {
        code: 'FORBIDDEN',
        message: 'No tienes permisos para eliminar productos.',
      };
    }

    if (error.status === 404) {
      return {
        code: 'PRODUCT_NOT_FOUND',
        message: extractBackendMessage(error.body) ?? 'El producto indicado no existe.',
      };
    }

    return {
      code: `BACKEND_${error.status}`,
      message: 'No fue posible eliminar el producto en este momento.',
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'Ocurrio un error inesperado al eliminar el producto.',
  };
}

function extractBackendMessage(body: unknown) {
  if (body && typeof body === 'object') {
    const candidate = body as {
      message?: unknown;
      error?: unknown;
    };

    if (typeof candidate.message === 'string') {
      return candidate.message;
    }

    if (typeof candidate.error === 'string') {
      return candidate.error;
    }
  }

  return null;
}
