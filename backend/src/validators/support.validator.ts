import { z } from 'zod';

export const createSupportTicketSchema = z.object({
  category: z.string().trim().min(1, 'Debe indicar una categoria'),
  description: z.string().trim().min(10, 'La descripcion debe tener al menos 10 caracteres'),
  contactChannel: z.string().trim().min(1, 'Debe indicar un canal de contacto'),
});

export const updateSupportTicketStatusSchema = z.object({
  status: z.enum(['open', 'in_review', 'closed']),
});
