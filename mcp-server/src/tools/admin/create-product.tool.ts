import { randomUUID } from 'node:crypto';
import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { AppEnv } from '../../config/env.js';
import { logAuditEvent } from '../../services/audit-log.js';
import { BackendApiError, type BackendApiClient } from '../../services/backend-api.js';
import type { CreateProductInput, CreateProductResult } from '../../types.js';
import type { Logger } from '../../utils/logger.js';
import { buildToolMeta } from '../access-control.js';

const createProductInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).optional(),
  price: z.number().min(0),
  stock: z.number().int().min(0).optional(),
  condition: z.enum(['A', 'B', 'C']),
  category: z.enum(['celular', 'laptop', 'pc', 'auriculares', 'tablet']),
  imageUrls: z.array(z.string().url()).optional(),
});

const createProductOutputSchema = z.object({
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

interface RegisterCreateProductToolDependencies {
  env: AppEnv;
  logger: Logger;
  backendApi: BackendApiClient;
}

export function registerCreateProductTool(
  server: McpServer,
  { env, logger, backendApi }: RegisterCreateProductToolDependencies,
) {
  server.registerTool(
    'create_product',
    {
      title: 'Create Product',
      description:
        'Crea un producto nuevo en el catalogo de SafeTech y devuelve el registro persistido. Solo disponible para administradores.',
      inputSchema: createProductInputSchema,
      outputSchema: createProductOutputSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
      },
      _meta: {
        ...buildToolMeta('admin', {
          issue: '#195',
          source: `${env.BACKEND_API_URL}/products`,
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
        productName: input.name,
        category: input.category,
        condition: input.condition,
      };

      try {
        if (!token) {
          const authError = {
            code: 'AUTH_REQUIRED',
            message: 'Se requiere autenticacion para crear productos.',
          };

          logAuditEvent(logger, {
            requestId: auditRequestId,
            actor,
            role,
            action: 'tool.create_product',
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
            message: 'Solo un administrador puede crear productos.',
          };

          logAuditEvent(logger, {
            requestId: auditRequestId,
            actor,
            role,
            action: 'tool.create_product',
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

        const response = await backendApi.createProduct(
          token,
          {
            name: input.name,
            ...(input.description !== undefined ? { description: input.description } : {}),
            price: input.price,
            ...(input.stock !== undefined ? { stock: input.stock } : {}),
            condition: input.condition,
            category: input.category,
            ...(input.imageUrls !== undefined ? { imageUrls: input.imageUrls } : {}),
          },
          auditRequestId,
        );

        const output = normalizeProduct(response.data);

        logAuditEvent(logger, {
          requestId: auditRequestId,
          actor,
          role,
          action: 'tool.create_product',
          outcome: 'success',
          durationMs: Date.now() - startedAt,
          metadata: {
            ...auditMetadata,
            productId: output.id,
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
          action: 'tool.create_product',
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

function normalizeProduct(product: CreateProductResult): z.infer<typeof createProductOutputSchema> {
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
        message: 'La sesion no es valida para crear productos.',
      };
    }

    if (error.status === 403) {
      return {
        code: 'FORBIDDEN',
        message: 'No tienes permisos para crear productos.',
      };
    }

    if (error.status === 400) {
      return {
        code: 'INVALID_PRODUCT_INPUT',
        message:
          extractBackendMessage(error.body) ??
          'Los datos enviados para crear el producto no son validos.',
      };
    }

    return {
      code: `BACKEND_${error.status}`,
      message: 'No fue posible crear el producto en este momento.',
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'Ocurrio un error inesperado al crear el producto.',
  };
}

function extractBackendMessage(body: unknown) {
  if (typeof body === 'object' && body !== null) {
    if ('message' in body && typeof body.message === 'string') {
      return body.message;
    }

    if ('error' in body && typeof body.error === 'string') {
      return body.error;
    }
  }

  return null;
}
