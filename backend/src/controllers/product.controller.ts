import { Context } from 'hono';
import { Product } from '../models/Product';

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

    const products = await Product.find(filter)
      .sort({ price: 1 })
      .limit(query.limit ?? 20);

    return c.json({ success: true, data: products });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
};

export const getProductById = async (c: Context) => {
  try {
    const id = c.req.param('id');
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
    
    const newProduct = await Product.create(data);
    return c.json({ success: true, data: newProduct }, 201);
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
};

export const updateProduct = async (c: Context) => {
  try {
    const id = c.req.param('id');
    // Validated by zod-validator middleware
    const data = c.req.valid('json' as any);
    
    const updatedProduct = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    
    if (!updatedProduct) {
      return c.json({ success: false, message: 'Producto no encontrado' }, 404);
    }
    
    return c.json({ success: true, data: updatedProduct });
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
