import type { Product } from './product';

export interface OrderItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  _id: string;
  userId: string;
  userDoc?: { email?: string };
  total_amount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'failed' | 'refunded';
  stripe_session_id?: string;
  payment_intent_id?: string;
  shippingAddress?: ShippingAddress;
  carrier?: string;
  trackingNumber?: string;
  coupon_code?: string;
  discount_amount?: number;
  refund_id?: string;
  refunded_amount?: number;
  refunded_by?: string;
  refunded_at?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
