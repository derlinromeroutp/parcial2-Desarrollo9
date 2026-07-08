import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { logAuditEvent } from '../../services/audit-log.js';
import { BackendApiError, type BackendApiClient } from '../../services/backend-api.js';
import type { AppEnv } from '../../config/env.js';
import type { ProductSummary } from '../../types.js';
import type { Logger } from '../../utils/logger.js';
import type { McpServer } from '@modelcontextprotocol/server';

const searchProductsInputSchema = z
  .object({
    query: z.string().trim().min(1).max(100).optional(),
    name: z.string().trim().min(1).max(100).optional(),
    limit: z.number().int().min(1).max(50).optional(),
  })
  .refine((input) => input.query === undefined || input.name === undefined, {
    message: 'Use query o name, pero no ambos al mismo tiempo.',
    path: ['query'],
  });

const productSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  stock: z.number().int(),
  condition: z.enum(['A', 'B', 'C']),
  category: z.enum(['celular', 'laptop', 'pc', 'auriculares', 'tablet']),
  primaryImageUrl: z.string().url().optional(),
});

const searchProductsOutputSchema = z.object({
  products: z.array(productSummarySchema),
  count: z.number().int().min(0),
  appliedFilters: z.object({
    name: z.string().optional(),
    limit: z.number().int().min(1).max(50).optional(),
  }),
});

interface RegisterSearchProductsToolDependencies {
  env: AppEnv;
  logger: Logger;
  backendApi: BackendApiClient;
}

export function registerSearchProductsTool(
  server: McpServer,
  { env, logger, backendApi }: RegisterSearchProductsToolDependencies,
) {
  server.registerTool(
    'search_products',
    {
      title: 'Search Products',
      description: 'Busca productos del catalogo de SafeTech por nombre y devuelve datos basicos normalizados.',
      inputSchema: searchProductsInputSchema,
      outputSchema: searchProductsOutputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
      },
      _meta: {
        issue: '#188',
        source: `${env.BACKEND_API_URL}/products`,
      },
    },
    async (input, ctx) => {
      const auditRequestId = randomUUID();
      const startedAt = Date.now();
      const actor = ctx.http?.authInfo?.clientId ?? 'anonymous';
      const normalizedName = input.query ?? input.name;

      try {
        const response = await backendApi.getProducts(
          {
            name: normalizedName,
            limit: input.limit,
          },
          auditRequestId,
        );

        const output = {
          products: response.data.map(normalizeProduct),
          count: response.data.length,
          appliedFilters: {
            ...(normalizedName ? { name: normalizedName } : {}),
            ...(input.limit !== undefined ? { limit: input.limit } : {}),
          },
        };

        logAuditEvent(logger, {
          requestId: auditRequestId,
          actor,
          role: extractRole(ctx),
          action: 'tool.search_products',
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
          action: 'tool.search_products',
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

function normalizeProduct(product: ProductSummary): z.infer<typeof productSummarySchema> {
  return {
    id: product.id,
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    price: product.price,
    stock: product.stock,
    condition: product.condition,
    category: product.category,
    ...(product.primaryImageUrl ? { primaryImageUrl: product.primaryImageUrl } : {}),
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
        code: 'INVALID_BACKEND_REQUEST',
        message: 'La busqueda no pudo ejecutarse por parametros invalidos.',
      };
    }

    return {
      code: `BACKEND_${error.status}`,
      message: 'No fue posible consultar el catalogo en este momento.',
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'Ocurrio un error inesperado al consultar productos.',
  };
}
