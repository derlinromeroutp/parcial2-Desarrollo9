import { z } from 'zod';

export const updateShippingSchema = z.object({
  status: z.enum(['processing', 'shipped', 'delivered']).optional(),
  carrier: z.string().min(1).optional(),
  trackingNumber: z.string().min(1).optional(),
}).refine((data) => Object.values(data).some((value) => value !== undefined), {
  message: 'Debe enviar al menos status, carrier o trackingNumber',
});

export const salesReportQuerySchema = z.object({
  from: z.string().datetime({ offset: true }),
  to: z.string().datetime({ offset: true }),
}).refine(({ from, to }) => new Date(from).getTime() <= new Date(to).getTime(), {
  message: 'La fecha inicial no puede ser posterior a la fecha final',
  path: ['from'],
});
