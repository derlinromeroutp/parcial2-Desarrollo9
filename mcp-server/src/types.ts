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
