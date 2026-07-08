import { z } from 'zod';

const addressFields = {
  recipientName: z.string().min(1, 'El nombre del destinatario es requerido'),
  phone: z.string().min(1, 'El telefono es requerido'),
  street: z.string().min(1, 'La calle es requerida'),
  city: z.string().min(1, 'La ciudad es requerida'),
  state: z.string().min(1, 'La provincia/estado es requerido'),
  zipCode: z.string().min(1, 'El codigo postal es requerido'),
  country: z.string().min(1, 'El pais es requerido'),
  isDefault: z.boolean().optional(),
};

export const createAddressSchema = z.object(addressFields);

export const updateAddressSchema = z.object(addressFields).partial();
