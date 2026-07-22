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

export const bestSellersQuerySchema = z.object({
  limit: z.coerce.number().int().min(1, 'limit debe ser al menos 1').max(12, 'limit no puede superar 12').optional(),
});

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// HU-43: ids llega como query string separado por comas (?ids=a,b,c). Se
// valida en el propio schema (2 a 4 productos, todos ObjectId válidos) para
// no duplicar esa lógica en el controller.
export const compareQuerySchema = z
  .object({
    ids: z.string().min(1, 'Debe indicar los ids de los productos a comparar'),
  })
  .refine(
    (data) => {
      const ids = data.ids.split(',').map((id) => id.trim()).filter(Boolean);
      return ids.length >= 2 && ids.length <= 4 && ids.every((id) => objectIdRegex.test(id));
    },
    {
      message: 'Debe indicar entre 2 y 4 ids de producto válidos, separados por comas',
      path: ['ids'],
    }
  );
