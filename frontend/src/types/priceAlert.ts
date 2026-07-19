import type { Product } from './product';

export interface PriceAlert {
  _id: string;
  userId: string;
  product: Product;
  priceAtActivation: number;
  active: boolean;
  triggeredAt: string | null;
  triggered: boolean;
  createdAt: string;
  updatedAt: string;
}
