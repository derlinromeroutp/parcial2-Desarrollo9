import { z } from 'zod';

export const createPriceAlertSchema = z.object({
  productId: z.string().min(1, 'El ID del producto es requerido'),
});
