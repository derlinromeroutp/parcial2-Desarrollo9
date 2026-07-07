import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../controllers/product.controller';
import {
  createProductSchema,
  updateProductSchema,
} from '../validators/product.validator';

const productRoutes = new Hono();

// Obtener todos los productos
productRoutes.get('/', getProducts);

// Obtener un producto por ID
productRoutes.get('/:id', getProductById);

// Crear un producto con validación de Zod
productRoutes.post(
  '/',
  zValidator('json', createProductSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  createProduct
);

// Actualizar un producto con validación parcial
productRoutes.put(
  '/:id',
  zValidator('json', updateProductSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  updateProduct
);

// Eliminar un producto
productRoutes.delete('/:id', deleteProduct);

export default productRoutes;
