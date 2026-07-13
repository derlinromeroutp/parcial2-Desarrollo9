import { z } from 'zod';

export const addToWishlistSchema = z.object({
  productId: z.string().min(1, 'El ID del producto es requerido'),
});

export const updateNoteSchema = z.object({
  note: z.string().max(500, 'La nota no puede superar los 500 caracteres'),
});
