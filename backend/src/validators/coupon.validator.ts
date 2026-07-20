import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().trim().min(3, 'El codigo debe tener al menos 3 caracteres').max(30),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  validFrom: z.string().datetime({ offset: true }),
  validUntil: z.string().datetime({ offset: true }),
  minPurchase: z.number().min(0).optional(),
  maxUses: z.number().int().positive().optional(),
}).refine((data) => new Date(data.validFrom).getTime() < new Date(data.validUntil).getTime(), {
  message: 'validFrom debe ser anterior a validUntil',
  path: ['validFrom'],
}).refine((data) => data.discountType !== 'percentage' || data.discountValue <= 100, {
  message: 'El descuento porcentual no puede superar 100',
  path: ['discountValue'],
});

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1, 'Debe indicar un codigo de cupon'),
  subtotal: z.number().positive(),
});
