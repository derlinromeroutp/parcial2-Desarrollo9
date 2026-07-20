import { z } from 'zod';
import mongoose from 'mongoose';

export const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid productId format',
      }),
      quantity: z.number().int().positive().min(1)
    })
  ).min(1, 'Cart items cannot be empty'),
  couponCode: z.string().trim().min(1).optional(),
});
