import type { Product } from './product';

export interface WishlistItem {
  _id: string;
  userId: string;
  product: Product;
  note: string;
  priceAtAdded: number;
  priceDropped: boolean;
  createdAt: string;
  updatedAt: string;
}
