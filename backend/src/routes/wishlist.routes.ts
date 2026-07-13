import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlistNote,
  checkWishlistItem,
  getWishlistSuggestions,
} from '../controllers/wishlist.controller';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware';
import { addToWishlistSchema, updateNoteSchema } from '../validators/wishlist.validator';

const wishlistRoutes = new Hono();

wishlistRoutes.get('/mine', clerkAuthMiddleware, getMyWishlist);

wishlistRoutes.get('/suggestions', clerkAuthMiddleware, getWishlistSuggestions);

wishlistRoutes.get('/check/:productId', clerkAuthMiddleware, checkWishlistItem);

wishlistRoutes.post(
  '/',
  clerkAuthMiddleware,
  zValidator('json', addToWishlistSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  addToWishlist,
);

wishlistRoutes.delete('/:productId', clerkAuthMiddleware, removeFromWishlist);

wishlistRoutes.put(
  '/:productId/note',
  clerkAuthMiddleware,
  zValidator('json', updateNoteSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  updateWishlistNote,
);

export default wishlistRoutes;
