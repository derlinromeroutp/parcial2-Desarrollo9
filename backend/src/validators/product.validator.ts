import { z } from 'zod';

const productFields = {
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.number().min(0, 'El precio debe ser un valor positivo'),
  stock: z.number().int().min(0, 'El stock debe ser 0 o un entero positivo'),
  condition: z.enum(['A', 'B', 'C'], {
    errorMap: () => ({ message: 'La condición debe ser A, B o C' }),
  }),
  category: z.enum(['celular', 'laptop', 'pc', 'auriculares', 'tablet'], {
    errorMap: () => ({ message: 'Categoría inválida' }),
  }),
  image_urls: z.array(z.string().url('Debe ser una URL válida')).optional(),
};

export const createProductSchema = z.object({
  ...productFields,
  stock: productFields.stock.default(0),
});

// Se construye desde `productFields` (sin el `.default(0)` de stock) en vez de
// `createProductSchema.partial()`: partial() no elimina los default() internos,
// asi que un update parcial sin `stock` terminaria reseteandolo a 0.
// `reason` (HU-36) es el motivo del ajuste de stock, para el historial de
// movimientos de inventario; no es un campo del producto en si.
export const updateProductSchema = z.object(productFields).partial().extend({
  reason: z.string().min(1).optional(),
});

export const productFilterSchema = z
  .object({
    name: z.string().min(1, 'El nombre debe tener al menos 1 caracter').max(100, 'El nombre no puede superar los 100 caracteres').optional(),
    category: productFields.category.optional(),
    condition: productFields.condition.optional(),
    minPrice: z.coerce.number().min(0, 'minPrice debe ser 0 o un valor positivo').optional(),
    maxPrice: z.coerce.number().min(0, 'maxPrice debe ser 0 o un valor positivo').optional(),
    available: z.enum(['true', 'false']).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
    page: z.coerce.number().int().min(1).optional(),
  })
  .refine((data) => data.minPrice === undefined || data.maxPrice === undefined || data.minPrice <= data.maxPrice, {
    message: 'minPrice no puede ser mayor que maxPrice',
    path: ['minPrice'],
  });

export const lowStockQuerySchema = z.object({
  threshold: z.coerce.number().int().min(0, 'threshold debe ser 0 o un entero positivo').optional(),
});
