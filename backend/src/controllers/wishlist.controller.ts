import { Context } from 'hono';
import { WishlistItem } from '../models/WishlistItem';
import { Product } from '../models/Product';

const getWishlistSuggestions = async (c: Context) => {
  try {
    const userId = c.get('userId');
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const wishlistItems = await WishlistItem.find({ userId }).lean();
    if (wishlistItems.length === 0) return c.json([]);

    const wishlistedProductIds = wishlistItems.map(i => i.product);
    const categories = [...new Set(wishlistItems.map(i => i.product).filter(Boolean))];

    const categoryDocs = await Product.find({ _id: { $in: wishlistedProductIds } }).select('category').lean();
    const uniqueCategories = [...new Set(categoryDocs.map(p => p.category))];

    if (uniqueCategories.length === 0) return c.json([]);

    const suggestions = await Product.find({
      _id: { $nin: wishlistedProductIds },
      category: { $in: uniqueCategories },
      stock: { $gt: 0 },
    })
      .limit(8)
      .lean();

    return c.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return c.json({ error: 'Failed to fetch suggestions' }, 500);
  }
};

export const getMyWishlist = async (c: Context) => {
  try {
    const userId = c.get('userId');
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const items = await WishlistItem.find({ userId })
      .populate('product')
      .sort({ createdAt: -1 })
      .lean();

    return c.json(items);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return c.json({ error: 'Failed to fetch wishlist' }, 500);
  }
};

export const addToWishlist = async (c: Context) => {
  try {
    const userId = c.get('userId');
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const { productId } = await c.req.json();

    const product = await Product.findById(productId);
    if (!product) return c.json({ error: 'Producto no encontrado' }, 404);

    const existing = await WishlistItem.findOne({ userId, product: productId });
    if (existing) return c.json({ error: 'El producto ya está en tu lista de deseos' }, 409);

    const item = await WishlistItem.create({ userId, product: productId });
    const populated = await item.populate('product');

    return c.json(populated, 201);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return c.json({ error: 'Failed to add to wishlist' }, 500);
  }
};

export const removeFromWishlist = async (c: Context) => {
  try {
    const userId = c.get('userId');
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const productId = c.req.param('productId');
    const deleted = await WishlistItem.findOneAndDelete({ userId, product: productId });

    if (!deleted) return c.json({ error: 'Producto no encontrado en la lista' }, 404);

    return c.json({ message: 'Producto eliminado de la lista de deseos' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return c.json({ error: 'Failed to remove from wishlist' }, 500);
  }
};

export const updateWishlistNote = async (c: Context) => {
  try {
    const userId = c.get('userId');
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const productId = c.req.param('productId');
    const { note } = await c.req.json();

    const item = await WishlistItem.findOneAndUpdate(
      { userId, product: productId },
      { note },
      { new: true },
    ).populate('product');

    if (!item) return c.json({ error: 'Producto no encontrado en la lista' }, 404);

    return c.json(item);
  } catch (error) {
    console.error('Error updating note:', error);
    return c.json({ error: 'Failed to update note' }, 500);
  }
};

export { getWishlistSuggestions };

export const checkWishlistItem = async (c: Context) => {
  try {
    const userId = c.get('userId');
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const productId = c.req.param('productId');
    const item = await WishlistItem.findOne({ userId, product: productId }).lean();

    return c.json({ isWishlisted: !!item });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return c.json({ error: 'Failed to check wishlist' }, 500);
  }
};
