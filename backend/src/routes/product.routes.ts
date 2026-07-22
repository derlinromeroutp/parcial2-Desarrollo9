import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  createProduct,
  deleteProduct,
  getBestSellingProducts,
  getLowStockProducts,
  getProductById,
  getProductInventoryMovements,
  getProducts,
  getProductsForComparison,
  getRelatedProducts,
  updateProduct,
} from '../controllers/product.controller';
import { getProductInspection, upsertProductInspection } from '../controllers/inspection.controller';
import {
  createProductSchema,
  bestSellersQuerySchema,
  compareQuerySchema,
  lowStockQuerySchema,
  productFilterSchema,
  relatedProductsQuerySchema,
  updateProductSchema,
} from '../validators/product.validator';
import { upsertInspectionSchema } from '../validators/inspection.validator';
import { adminAuthMiddleware, technicianAuthMiddleware } from '../middlewares/auth.middleware';

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

productRoutes.get(
  '/best-sellers',
  zValidator('query', bestSellersQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  getBestSellingProducts
);

// Productos a comparar lado a lado (HU-43). Registrada antes de '/:id' para
// que "compare" no se interprete como un id.
productRoutes.get(
  '/compare',
  zValidator('query', compareQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  getProductsForComparison
);

// Obtener un producto por ID
productRoutes.get('/:id', getProductById);

// Historial de movimientos de inventario de un producto (solo admin)
productRoutes.get('/:id/inventory-movements', adminAuthMiddleware, getProductInventoryMovements);

// Productos relacionados (misma categoria, excluyendo el actual) (HU-44)
productRoutes.get(
  '/:id/related',
  zValidator('query', relatedProductsQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  getRelatedProducts
);

// Ficha de inspeccion tecnica de un producto (HU-46). Lectura publica;
// solo un tecnico autenticado puede registrarla/actualizarla.
productRoutes.get('/:id/inspection', getProductInspection);
productRoutes.put(
  '/:id/inspection',
  technicianAuthMiddleware,
  zValidator('json', upsertInspectionSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  upsertProductInspection
);

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
