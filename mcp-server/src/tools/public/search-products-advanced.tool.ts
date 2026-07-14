import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { logAuditEvent } from '../../services/audit-log.js';
import { BackendApiError, type BackendApiClient } from '../../services/backend-api.js';
import type { AppEnv } from '../../config/env.js';
import type { ProductSearchAdvancedInput, ProductSummary } from '../../types.js';
import type { Logger } from '../../utils/logger.js';
import type { McpServer } from '@modelcontextprotocol/server';
import { buildToolMeta } from '../access-control.js';

const productCategorySchema = z.enum(['celular', 'laptop', 'pc', 'auriculares', 'tablet']);
const productConditionSchema = z.enum(['A', 'B', 'C']);

const searchProductsAdvancedInputSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    category: productCategorySchema.optional(),
    condition: productConditionSchema.optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    available: z.boolean().optional(),
    limit: z.number().int().min(1).max(50).optional(),
  })
  .refine(
    (input) =>
      input.minPrice === undefined ||
      input.maxPrice === undefined ||
      input.minPrice <= input.maxPrice,
    {
      message: 'minPrice no puede ser mayor que maxPrice.',
      path: ['minPrice'],
    },
  );

const productSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  stock: z.number().int(),
  condition: productConditionSchema,
  category: productCategorySchema,
  primaryImageUrl: z.string().url().optional(),
});

const searchProductsAdvancedOutputSchema = z.object({
  products: z.array(productSummarySchema),
  count: z.number().int().min(0),
  appliedFilters: z.object({
    name: z.string().optional(),
    category: productCategorySchema.optional(),
    condition: productConditionSchema.optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    available: z.boolean().optional(),
    limit: z.number().int().min(1).max(50).optional(),
  }),
  pagination: z
    .object({
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
      total: z.number().int().min(0),
    })
    .optional(),
});

interface RegisterSearchProductsAdvancedToolDependencies {
  env: AppEnv;
  logger: Logger;
  backendApi: BackendApiClient;
}

export function registerSearchProductsAdvancedTool(
  server: McpServer,
  { env, logger, backendApi }: RegisterSearchProductsAdvancedToolDependencies,
) {
  server.registerTool(
    'search_products_advanced',
    {
      title: 'Search Products Advanced',
      description:
        'Busca productos del catalogo de SafeTech con filtros avanzados por categoria, condicion, precio y disponibilidad.',
      inputSchema: searchProductsAdvancedInputSchema,
      outputSchema: searchProductsAdvancedOutputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
      },
      _meta: {
        ...buildToolMeta('user', {
          issue: '#198',
          source: `${env.BACKEND_API_URL}/products`,
        }),
      },
    },
    async (input, ctx) => {
      const auditRequestId = randomUUID();
      const startedAt = Date.now();
      const actor = ctx.http?.authInfo?.clientId ?? 'anonymous';

      try {
        const response = await backendApi.searchProductsAdvanced(input, auditRequestId);
        const output = {
          products: response.data.map(normalizeProduct),
          count: response.data.length,
          appliedFilters: buildAppliedFilters(input),
          ...(response.pagination ? { pagination: response.pagination } : {}),
        };

        logAuditEvent(logger, {
          requestId: auditRequestId,
          actor,
          role: extractRole(ctx),
          action: 'tool.search_products_advanced',
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
          action: 'tool.search_products_advanced',
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

function buildAppliedFilters(input: ProductSearchAdvancedInput) {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.condition !== undefined ? { condition: input.condition } : {}),
    ...(input.minPrice !== undefined ? { minPrice: input.minPrice } : {}),
    ...(input.maxPrice !== undefined ? { maxPrice: input.maxPrice } : {}),
    ...(input.available !== undefined ? { available: input.available } : {}),
    ...(input.limit !== undefined ? { limit: input.limit } : {}),
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
        message: 'La busqueda avanzada no pudo ejecutarse por filtros invalidos.',
      };
    }

    return {
      code: `BACKEND_${error.status}`,
      message: 'No fue posible consultar el catalogo avanzado en este momento.',
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'Ocurrio un error inesperado al consultar productos con filtros avanzados.',
  };
}
