import type { Product } from '../types/product';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface CreateProductDTO {
  name: string;
  description?: string;
  price: number;
  stock: number;
  condition: 'A' | 'B' | 'C';
  category: 'celular' | 'laptop' | 'pc' | 'auriculares' | 'tablet';
  image_urls: string[];
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  condition?: 'A' | 'B' | 'C';
  category?: 'celular' | 'laptop' | 'pc' | 'auriculares' | 'tablet';
  image_urls?: string[];
}

export interface ProductFilters {
  name?: string;
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedProducts {
  data: Product[];
  pagination: ProductPagination;
}

function buildQueryString(filters?: ProductFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.name?.trim()) params.set('name', filters.name.trim());
  if (filters.category) params.set('category', filters.category);
  if (filters.condition) params.set('condition', filters.condition);
  if (filters.minPrice !== undefined && !Number.isNaN(filters.minPrice)) {
    params.set('minPrice', String(filters.minPrice));
  }
  if (filters.maxPrice !== undefined && !Number.isNaN(filters.maxPrice)) {
    params.set('maxPrice', String(filters.maxPrice));
  }
  if (filters.page !== undefined) params.set('page', String(filters.page));
  if (filters.limit !== undefined) params.set('limit', String(filters.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const productsService = {
  async getAll(filters?: ProductFilters, token?: string): Promise<Product[]> {
    const response = await fetch(`${API_URL}/products${buildQueryString(filters)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result?.message || result?.errors?.[0]?.message || 'Failed to fetch products');
    }
    const result = await response.json();
    return result.data || [];
  },

  // Usa page/limit del backend (HU-31); a diferencia de getAll(), no descarta
  // la metadata de paginacion que necesita el catalogo para armar el paginador.
  async getAllPaginated(filters?: ProductFilters, token?: string): Promise<PaginatedProducts> {
    const response = await fetch(`${API_URL}/products${buildQueryString(filters)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result?.message || result?.errors?.[0]?.message || 'Failed to fetch products');
    }
    const result = await response.json();
    const data: Product[] = result.data || [];
    return {
      data,
      pagination: result.pagination ?? { page: 1, limit: data.length, total: data.length },
    };
  },

  async getById(id: string, token?: string): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to fetch product');
    const result = await response.json();
    // Backend returns { success, data: product }; older callers may have relied on raw shape.
    return (result?.data ?? result) as Product;
  },

  async create(data: CreateProductDTO, token: string): Promise<Product> {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result?.error || 'Failed to create product');
    }

    return response.json();
  },

  async update(id: string, data: UpdateProductDTO, token: string): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result?.error || 'Failed to update product');
    }

    return response.json();
  },

  async delete(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result?.error || 'Failed to delete product');
    }

    return response.json();
  },
};