import { z } from 'zod';

export const createTechnicianSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'El teléfono es requerido').optional(),
  specialty: z.string().optional(),
});

export const assignTechnicianSchema = z.object({
  technicianId: z.string().min(1, 'El ID del técnico es requerido'),
  technicianName: z.string().min(1, 'El nombre del técnico es requerido'),
});

export const techUpdateWarrantySchema = z.object({
  status: z.enum(['review', 'resolved', 'rejected', 'refunded']).optional(),
  repairNotes: z.string().optional(),
}).refine((data) => data.status !== undefined || data.repairNotes !== undefined, {
  message: 'Debe enviar al menos status o repairNotes',
});

export const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, 'paymentIntentId es requerido'),
});
