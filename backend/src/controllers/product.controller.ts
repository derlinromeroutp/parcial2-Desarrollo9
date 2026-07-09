import { Context } from 'hono';
import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { InventoryMovement } from '../models/InventoryMovement';
import { recordInventoryMovement } from '../services/inventory.service';

export const getProducts = async (c: Context) => {
  try {
    const query = c.req.valid('query' as any) as {
      name?: string;
      category?: string;
      condition?: string;
      minPrice?: number;
      maxPrice?: number;
      available?: 'true' | 'false';
      limit?: number;
      page?: number;
    };

    const hasFilters = Object.values(query).some((value) => value !== undefined);

    if (!hasFilters) {
      const products = await Product.find();
      return c.json({ success: true, data: products });
    }

    const filter: Record<string, unknown> = {};
    if (query.name) filter.name = { $regex: query.name, $options: 'i' };
    if (query.category) filter.category = query.category;
    if (query.condition) filter.condition = query.condition;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {
        ...(query.minPrice !== undefined && { $gte: query.minPrice }),
        ...(query.maxPrice !== undefined && { $lte: query.maxPrice }),
      };
    }
    if (query.available === 'true') filter.stock = { $gt: 0 };
    if (query.available === 'false') filter.stock = { $lte: 0 };

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ price: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return c.json({
      success: true,
      data: products,
      pagination: { page, limit, total },
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
};

export const getProductById = async (c: Context) => {
  try {
    const id = c.req.param('id');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return c.json({ success: false, message: 'ID de producto invalido' }, 400);
    }

    const product = await Product.findById(id);
    
    if (!product) {
      return c.json({ success: false, message: 'Producto no encontrado' }, 404);
    }
    
    return c.json({ success: true, data: product });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
};

export const createProduct = async (c: Context) => {
  try {
    // Validated by zod-validator middleware
    const data = c.req.valid('json' as any);
    const userId = c.get('userId');

    const newProduct = (await Product.create(data)) as unknown as { _id: unknown; stock: number };

    if (newProduct.stock > 0) {
      await recordInventoryMovement({
        productId: newProduct._id as any,
        type: 'restock',
        previousStock: 0,
        newStock: newProduct.stock,
        reason: 'Alta de producto',
        performedBy: userId ?? 'system',
      });
    }

    return c.json({ success: true, data: newProduct }, 201);
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
};

export const updateProduct = async (c: Context) => {
  try {
    const id = c.req.param('id');
    // Validated by zod-validator middleware
    const data = c.req.valid('json' as any) as { stock?: number; reason?: string; [key: string]: unknown };
    const userId = c.get('userId');

    const previousProduct = await Product.findById(id);
    if (!previousProduct) {
      return c.json({ success: false, message: 'Producto no encontrado' }, 404);
    }

    const { reason, ...updateData } = data;

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return c.json({ success: false, message: 'Producto no encontrado' }, 404);
    }

    if (data.stock !== undefined && data.stock !== previousProduct.stock) {
      await recordInventoryMovement({
        productId: updatedProduct._id,
        type: 'manual_adjustment',
        previousStock: previousProduct.stock,
        newStock: updatedProduct.stock,
        reason: reason?.trim() || 'Ajuste manual de stock',
        performedBy: userId ?? 'system',
      });
    }

    return c.json({ success: true, data: updatedProduct });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
};

export const getProductInventoryMovements = async (c: Context) => {
  try {
    const id = c.req.param('id');

    const product = await Product.findById(id);
    if (!product) {
      return c.json({ success: false, message: 'Producto no encontrado' }, 404);
    }

    const movements = await InventoryMovement.find({ productId: id }).sort({ createdAt: -1 });

    return c.json({ success: true, data: movements });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
};

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export const getLowStockProducts = async (c: Context) => {
  try {
    const { threshold } = c.req.valid('query' as any) as { threshold?: number };
    const effectiveThreshold = threshold ?? DEFAULT_LOW_STOCK_THRESHOLD;

    const products = await Product.find({ stock: { $lte: effectiveThreshold } }).sort({ stock: 1 });

    return c.json({ success: true, threshold: effectiveThreshold, data: products });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
};

export const deleteProduct = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return c.json({ success: false, message: 'Producto no encontrado' }, 404);
    }
    
    return c.json({ success: true, message: 'Producto eliminado correctamente' });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
};
