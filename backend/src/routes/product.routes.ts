import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  createProduct,
  deleteProduct,
  getLowStockProducts,
  getProductById,
  getProducts,
  updateProduct,
} from '../controllers/product.controller';
import {
  createProductSchema,
  lowStockQuerySchema,
  productFilterSchema,
  updateProductSchema,
} from '../validators/product.validator';
import { adminAuthMiddleware } from '../middlewares/auth.middleware';

const productRoutes = new Hono();

// Obtener todos los productos, con filtros opcionales (categoria, condicion,
// rango de precio, disponibilidad) para busquedas acotadas y ordenadas
productRoutes.get(
  '/',
  zValidator('query', productFilterSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  getProducts
);

// Productos con stock igual o por debajo de un umbral (alerta de stock bajo, solo admin)
// Registrada antes de '/:id' para que "low-stock" no se interprete como un id.
productRoutes.get(
  '/low-stock',
  adminAuthMiddleware,
  zValidator('query', lowStockQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  getLowStockProducts
);

// Obtener un producto por ID
productRoutes.get('/:id', getProductById);

// Crear un producto con validación de Zod (solo admin)
productRoutes.post(
  '/',
  adminAuthMiddleware,
  zValidator('json', createProductSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  createProduct
);

// Actualizar un producto con validación parcial (solo admin)
productRoutes.put(
  '/:id',
  adminAuthMiddleware,
  zValidator('json', updateProductSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  updateProduct
);

// Eliminar un producto (solo admin)
productRoutes.delete('/:id', adminAuthMiddleware, deleteProduct);

export default productRoutes;
