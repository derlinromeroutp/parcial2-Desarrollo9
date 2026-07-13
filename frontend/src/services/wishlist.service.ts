import axios from 'axios';
import type { WishlistItem } from '../types/wishlist';
import type { Product } from '../types/product';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const wishlistService = {
  getMyWishlist: async (token: string): Promise<WishlistItem[]> => {
    const { data } = await axios.get(`${API_URL}/wishlist/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  getSuggestions: async (token: string): Promise<Product[]> => {
    const { data } = await axios.get(`${API_URL}/wishlist/suggestions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  addToWishlist: async (productId: string, token: string): Promise<WishlistItem> => {
    const { data } = await axios.post(`${API_URL}/wishlist`, { productId }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  removeFromWishlist: async (productId: string, token: string): Promise<void> => {
    await axios.delete(`${API_URL}/wishlist/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateNote: async (productId: string, note: string, token: string): Promise<WishlistItem> => {
    const { data } = await axios.put(`${API_URL}/wishlist/${productId}/note`, { note }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  checkItem: async (productId: string, token: string): Promise<boolean> => {
    const { data } = await axios.get(`${API_URL}/wishlist/check/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.isWishlisted;
  },
};
