import type { Product } from './product';

export interface WishlistItem {
  _id: string;
  userId: string;
  product: Product;
  note: string;
  createdAt: string;
  updatedAt: string;
}
