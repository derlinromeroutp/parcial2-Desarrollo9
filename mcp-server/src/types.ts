export type SafeTechRole = 'user' | 'admin';
export type ToolAccessLevel = 'public' | 'user' | 'admin';

export interface AuthContext {
  token: string;
  userId: string;
  role: SafeTechRole;
  expiresAt: number;
}

export interface Authenticator {
  authenticate(request: Request, requestId: string): Promise<AuthContext>;
}

export interface BackendHealth {
  status: string;
  timestamp: number;
  dbConnected: boolean;
}

export interface ProductSummary {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  condition: 'A' | 'B' | 'C';
  category: 'celular' | 'laptop' | 'pc' | 'auriculares' | 'tablet';
  primaryImageUrl?: string;
}

export interface ProductDetail extends ProductSummary {
  imageUrls: string[];
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  condition: 'A' | 'B' | 'C';
  category: 'celular' | 'laptop' | 'pc' | 'auriculares' | 'tablet';
  imageUrls?: string[];
}

export interface CreateProductResult extends ProductDetail {}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  condition?: 'A' | 'B' | 'C';
  category?: 'celular' | 'laptop' | 'pc' | 'auriculares' | 'tablet';
  imageUrls?: string[];
  reason?: string;
}

export interface UpdateProductResult extends ProductDetail {}

export interface DeleteProductInput {
  reason?: string;
}

export interface DeleteProductResult {
  success: boolean;
  message: string;
  data: ProductDetail;
}

export interface ProductListResponse {
  success: boolean;
  data: Array<{
    _id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    condition: 'A' | 'B' | 'C';
    category: 'celular' | 'laptop' | 'pc' | 'auriculares' | 'tablet';
    image_urls?: string[];
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  }>;
}

export interface ProductDetailResponse {
  success: boolean;
  data: {
    _id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    condition: 'A' | 'B' | 'C';
    category: 'celular' | 'laptop' | 'pc' | 'auriculares' | 'tablet';
    image_urls?: string[];
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  };
}

export interface ProductCreateResponse {
  success: boolean;
  data: {
    _id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    condition: 'A' | 'B' | 'C';
    category: 'celular' | 'laptop' | 'pc' | 'auriculares' | 'tablet';
    image_urls?: string[];
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  };
}

export interface ProductDeleteResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    condition: 'A' | 'B' | 'C';
    category: 'celular' | 'laptop' | 'pc' | 'auriculares' | 'tablet';
    image_urls?: string[];
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  };
}

export interface OrderProductSummary {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  condition?: 'A' | 'B' | 'C';
  category?: 'celular' | 'laptop' | 'pc' | 'auriculares' | 'tablet';
  primaryImageUrl?: string;
}

export interface OrderItemSummary {
  id: string;
  quantity: number;
  price: number;
  product?: OrderProductSummary;
}

export interface ShippingAddressSummary {
  recipientName?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface OrderSummary {
  id: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'failed';
  createdAt: string;
  updatedAt: string;
  stripeSessionId?: string;
  paymentIntentId?: string;
  carrier?: string;
  trackingNumber?: string;
  shippingAddress?: ShippingAddressSummary;
  items: OrderItemSummary[];
}

export interface BackendOrderItemResponse {
  _id: string;
  quantity: number;
  price: number;
  product?: {
    _id?: string;
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    condition?: 'A' | 'B' | 'C';
    category?: 'celular' | 'laptop' | 'pc' | 'auriculares' | 'tablet';
    image_urls?: string[];
  };
}

export interface BackendOrderResponse {
  _id: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'failed';
  createdAt: string;
  updatedAt: string;
  stripe_session_id?: string;
  payment_intent_id?: string;
  carrier?: string;
  trackingNumber?: string;
  shippingAddress?: ShippingAddressSummary;
  items?: BackendOrderItemResponse[];
}

export interface WarrantyOrderSummary {
  id: string;
  totalAmount?: number;
  status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'failed';
  createdAt?: string;
  updatedAt?: string;
}

export interface WarrantySummary {
  id: string;
  status: 'pending' | 'review' | 'resolved' | 'rejected' | 'refunded';
  description: string;
  evidenceUrls: string[];
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  technicianId?: string;
  technicianName?: string;
  order: WarrantyOrderSummary;
}

export interface CreateWarrantyClaimInput {
  orderId: string;
  reason: string;
  description: string;
  evidenceUrls?: string[];
}

export interface CreateWarrantyClaimResult {
  ticketId: string;
  status: 'pending' | 'review' | 'resolved' | 'rejected' | 'refunded';
}

export interface UpdateWarrantyStatusInput {
  status: 'review' | 'resolved' | 'rejected' | 'refunded';
  repairNotes?: string;
}

export interface AssignTechnicianInput {
  technicianId: string;
}

export interface UpdateWarrantyStatusResult {
  id: string;
  orderId: string;
  userId: string;
  status: 'pending' | 'review' | 'resolved' | 'rejected' | 'refunded';
  description: string;
  evidenceUrls: string[];
  repairNotes?: string;
  technicianId?: string;
  technicianName?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface AssignTechnicianResult {
  id: string;
  orderId: string;
  userId: string;
  status: 'pending' | 'review' | 'resolved' | 'rejected' | 'refunded';
  description: string;
  evidenceUrls: string[];
  repairNotes?: string;
  technicianId?: string;
  technicianName?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface BackendWarrantyResponse {
  _id: string;
  status: 'pending' | 'review' | 'resolved' | 'rejected' | 'refunded';
  description: string;
  evidenceUrls?: string[];
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  technicianId?: string;
  technicianName?: string;
  orderId:
    | string
    | {
        _id?: string;
        total_amount?: number;
        status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'failed';
        createdAt?: string;
        updatedAt?: string;
      };
}

export interface BackendWarrantyStatusResponse {
  _id: string;
  orderId: string;
  userId: string;
  status: 'pending' | 'review' | 'resolved' | 'rejected' | 'refunded';
  description: string;
  evidenceUrls?: string[];
  repairNotes?: string;
  technicianId?: string;
  technicianName?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface BackendAssignTechnicianResponse {
  _id: string;
  orderId: string;
  userId: string;
  status: 'pending' | 'review' | 'resolved' | 'rejected' | 'refunded';
  description: string;
  evidenceUrls?: string[];
  repairNotes?: string;
  technicianId?: string;
  technicianName?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}
