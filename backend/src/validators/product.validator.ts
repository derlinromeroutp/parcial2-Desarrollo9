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
export const updateProductSchema = z.object(productFields).partial();
