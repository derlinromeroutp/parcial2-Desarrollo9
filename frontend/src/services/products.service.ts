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

export const productsService = {
  async getAll(token?: string): Promise<Product[]> {
    const response = await fetch(`${API_URL}/products`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    const result = await response.json();
    return result.data || [];
  },

  async getById(id: string, token?: string): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
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