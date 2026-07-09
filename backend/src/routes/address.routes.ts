import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  createAddress,
  deleteAddress,
  getMyAddresses,
  updateAddress,
} from '../controllers/address.controller';
import { createAddressSchema, updateAddressSchema } from '../validators/address.validator';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware';

const addressRoutes = new Hono();

addressRoutes.use('*', clerkAuthMiddleware);

// Listar las direcciones guardadas del usuario autenticado
addressRoutes.get('/', getMyAddresses);

// Crear una direccion de entrega
addressRoutes.post(
  '/',
  zValidator('json', createAddressSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  createAddress
);

// Editar una direccion propia
addressRoutes.put(
  '/:id',
  zValidator('json', updateAddressSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  updateAddress
);

// Eliminar una direccion propia
addressRoutes.delete('/:id', deleteAddress);

export default addressRoutes;
