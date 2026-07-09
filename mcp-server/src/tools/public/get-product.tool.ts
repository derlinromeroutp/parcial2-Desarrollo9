import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { logAuditEvent } from '../../services/audit-log.js';
import { BackendApiError, type BackendApiClient } from '../../services/backend-api.js';
import type { AppEnv } from '../../config/env.js';
import type { ProductDetail } from '../../types.js';
import type { Logger } from '../../utils/logger.js';
import type { McpServer } from '@modelcontextprotocol/server';
import { buildToolMeta } from '../access-control.js';

const getProductInputSchema = z.object({
  id: z.string().trim().min(1).max(100),
});

const productDetailSchema = z.object({
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

interface RegisterGetProductToolDependencies {
  env: AppEnv;
  logger: Logger;
  backendApi: BackendApiClient;
}

export function registerGetProductTool(
  server: McpServer,
  { env, logger, backendApi }: RegisterGetProductToolDependencies,
) {
  server.registerTool(
    'get_product',
    {
      title: 'Get Product',
      description: 'Obtiene el detalle de un producto del catalogo de SafeTech por su identificador.',
      inputSchema: getProductInputSchema,
      outputSchema: productDetailSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
      },
      _meta: {
        ...buildToolMeta('user', {
          issue: '#189',
          source: `${env.BACKEND_API_URL}/products/:id`,
        }),
      },
    },
    async (input, ctx) => {
      const auditRequestId = randomUUID();
      const startedAt = Date.now();
      const actor = ctx.http?.authInfo?.clientId ?? 'anonymous';

      try {
        const response = await backendApi.getProduct(input.id, auditRequestId);
        const output = normalizeProduct(response.data);

        logAuditEvent(logger, {
          requestId: auditRequestId,
          actor,
          role: extractRole(ctx),
          action: 'tool.get_product',
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
          action: 'tool.get_product',
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

function normalizeProduct(product: ProductDetail): z.infer<typeof productDetailSchema> {
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
  const roleScope = ctx.http?.authInfo?.scopes?.find((scope) => scope.startsWith('role:'));
  return roleScope?.replace('role:', '') ?? 'unknown';
}

function normalizeToolError(error: unknown) {
  if (error instanceof BackendApiError) {
    if (error.status === 400) {
      return {
        code: 'INVALID_PRODUCT_ID',
        message: 'El identificador del producto no es valido.',
      };
    }

    if (error.status === 404) {
      return {
        code: 'PRODUCT_NOT_FOUND',
        message: 'No se encontro un producto con el identificador indicado.',
      };
    }

    return {
      code: `BACKEND_${error.status}`,
      message: 'No fue posible obtener el detalle del producto en este momento.',
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'Ocurrio un error inesperado al obtener el detalle del producto.',
  };
}
