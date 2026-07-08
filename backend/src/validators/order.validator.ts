import { z } from 'zod';

export const updateShippingSchema = z.object({
  status: z.enum(['processing', 'shipped', 'delivered']).optional(),
  carrier: z.string().min(1).optional(),
  trackingNumber: z.string().min(1).optional(),
}).refine((data) => Object.values(data).some((value) => value !== undefined), {
  message: 'Debe enviar al menos status, carrier o trackingNumber',
});
