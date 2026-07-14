import { randomUUID } from 'node:crypto';
import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { AppEnv } from '../../config/env.js';
import { logAuditEvent } from '../../services/audit-log.js';
import { BackendApiError, type BackendApiClient } from '../../services/backend-api.js';
import type { Logger } from '../../utils/logger.js';
import { buildToolMeta } from '../access-control.js';

const productPatchSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).optional(),
    price: z.number().min(0).optional(),
    stock: z.number().int().min(0).optional(),
    condition: z.enum(['A', 'B', 'C']).optional(),
    category: z.enum(['celular', 'laptop', 'pc', 'auriculares', 'tablet']).optional(),
    imageUrls: z.array(z.string().url()).optional(),
    reason: z.string().trim().min(1).optional(),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar.',
  });

const updateProductInputSchema = z.object({
  productId: z.string().trim().min(1),
  updates: productPatchSchema,
});

const updateProductOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  stock: z.number().int(),
  condition: z.enum(['A', 'B', 'C']),
  category: z.enum(['celular', 'laptop', 'pc', 'auriculares', 'tablet']),
  primaryImageUrl: z.string().url().optional(),
  imageUrls: z.array(z.string().url()),
});

interface RegisterUpdateProductToolDependencies {
  env: AppEnv;
  logger: Logger;
  backendApi: BackendApiClient;
}

export function registerUpdateProductTool(
  server: McpServer,
  { env, logger, backendApi }: RegisterUpdateProductToolDependencies,
) {
  server.registerTool(
    'update_product',
    {
      title: 'Update Product',
      description:
        'Actualiza parcialmente un producto del catalogo de SafeTech y devuelve el registro persistido. Solo disponible para administradores.',
      inputSchema: updateProductInputSchema,
      outputSchema: updateProductOutputSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
      },
      _meta: {
        ...buildToolMeta('admin', {
          issue: '#196',
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
        updatedFields: Object.keys(input.updates),
        stockReasonProvided: input.updates.reason !== undefined,
      };

      try {
        if (!token) {
          const authError = {
            code: 'AUTH_REQUIRED',
            message: 'Se requiere autenticacion para actualizar productos.',
          };

          logAuditEvent(logger, {
            requestId: auditRequestId,
            actor,
            role,
            action: 'tool.update_product',
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
            message: 'Solo un administrador puede actualizar productos.',
          };

          logAuditEvent(logger, {
            requestId: auditRequestId,
            actor,
            role,
            action: 'tool.update_product',
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

        const response = await backendApi.updateProduct(
          token,
          input.productId,
          input.updates,
          auditRequestId,
        );

        const output = normalizeProduct(response.data);

        logAuditEvent(logger, {
          requestId: auditRequestId,
          actor,
          role,
          action: 'tool.update_product',
          outcome: 'success',
          durationMs: Date.now() - startedAt,
          metadata: {
            ...auditMetadata,
            productName: output.name,
            stock: output.stock,
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
          action: 'tool.update_product',
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

function normalizeProduct(product: z.infer<typeof updateProductOutputSchema>) {
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
        message: 'La sesion no es valida para actualizar productos.',
      };
    }

    if (error.status === 403) {
      return {
        code: 'FORBIDDEN',
        message: 'No tienes permisos para actualizar productos.',
      };
    }

    if (error.status === 404) {
      return {
        code: 'PRODUCT_NOT_FOUND',
        message: extractBackendMessage(error.body) ?? 'El producto indicado no existe.',
      };
    }

    if (error.status === 400) {
      return {
        code: 'INVALID_PRODUCT_INPUT',
        message:
          extractBackendMessage(error.body) ??
          'Los datos enviados para actualizar el producto no son validos.',
      };
    }

    return {
      code: `BACKEND_${error.status}`,
      message: 'No fue posible actualizar el producto en este momento.',
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'Ocurrio un error inesperado al actualizar el producto.',
  };
}

function extractBackendMessage(body: unknown) {
  if (body && typeof body === 'object') {
    const candidate = body as {
      message?: unknown;
      error?: unknown;
      errors?: Array<{ message?: string }>;
    };

    if (typeof candidate.message === 'string') {
      return candidate.message;
    }

    if (typeof candidate.error === 'string') {
      return candidate.error;
    }

    const firstError = candidate.errors?.find((entry) => typeof entry.message === 'string');
    if (firstError?.message) {
      return firstError.message;
    }
  }

  return null;
}
