import type {
  BackendHealth,
  ProductDetail,
  ProductDetailResponse,
  ProductListResponse,
  ProductSummary,
} from '../types.js';

export class BackendApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
  }
}

export class BackendApiClient {
  constructor(private readonly baseUrl: string) {}

  async getHealth(requestId: string): Promise<BackendHealth> {
    return this.request<BackendHealth>('/health', {
      method: 'GET',
      headers: {
        'x-request-id': requestId,
      },
    });
  }

  async getProducts(
    filters: { name?: string; limit?: number },
    requestId: string,
  ): Promise<{ data: ProductSummary[] }> {
    const search = new URLSearchParams();

    if (filters.name) {
      search.set('name', filters.name);
    }

    if (filters.limit !== undefined) {
      search.set('limit', String(filters.limit));
    }

    const path = search.size > 0 ? `/products?${search.toString()}` : '/products';
    const response = await this.request<ProductListResponse>(path, {
      method: 'GET',
      headers: {
        'x-request-id': requestId,
      },
    });

    return {
      data: response.data.map((product) => ({
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        condition: product.condition,
        category: product.category,
        primaryImageUrl: product.image_urls?.[0],
      })),
    };
  }

  async getProduct(productId: string, requestId: string): Promise<{ data: ProductDetail }> {
    const response = await this.request<ProductDetailResponse>(`/products/${productId}`, {
      method: 'GET',
      headers: {
        'x-request-id': requestId,
      },
    });

    return {
      data: {
        id: response.data._id,
        name: response.data.name,
        description: response.data.description,
        price: response.data.price,
        stock: response.data.stock,
        condition: response.data.condition,
        category: response.data.category,
        primaryImageUrl: response.data.image_urls?.[0],
        imageUrls: response.data.image_urls ?? [],
      },
    };
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, init);
    const text = await response.text();
    const body = text ? safeJsonParse(text) : null;

    if (!response.ok) {
      throw new BackendApiError(`Backend request failed for ${path}`, response.status, body);
    }

    return body as T;
  }
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
