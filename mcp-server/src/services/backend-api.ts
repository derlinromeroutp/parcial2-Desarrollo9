import type {
  AssignTechnicianInput,
  AssignTechnicianResult,
  BackendAssignTechnicianResponse,
  CreateWarrantyClaimInput,
  CreateWarrantyClaimResult,
  DeleteProductResult,
  CreateProductInput,
  CreateProductResult,
  ProductPagination,
  ProductSearchAdvancedInput,
  UpdateProductInput,
  UpdateProductResult,
  BackendOrderResponse,
  BackendWarrantyStatusResponse,
  BackendWarrantyResponse,
  BackendHealth,
  ProductCreateResponse,
  ProductDeleteResponse,
  OrderSummary,
  ProductDetail,
  ProductDetailResponse,
  ProductListResponse,
  ProductSummary,
  UpdateWarrantyStatusInput,
  UpdateWarrantyStatusResult,
  WarrantySummary,
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

  async searchProductsAdvanced(
    filters: ProductSearchAdvancedInput,
    requestId: string,
  ): Promise<{ data: ProductSummary[]; pagination?: ProductPagination }> {
    const search = new URLSearchParams();

    if (filters.name) {
      search.set('name', filters.name);
    }

    if (filters.category) {
      search.set('category', filters.category);
    }

    if (filters.condition) {
      search.set('condition', filters.condition);
    }

    if (filters.minPrice !== undefined) {
      search.set('minPrice', String(filters.minPrice));
    }

    if (filters.maxPrice !== undefined) {
      search.set('maxPrice', String(filters.maxPrice));
    }

    if (filters.available !== undefined) {
      search.set('available', String(filters.available));
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
      ...(response.pagination ? { pagination: response.pagination } : {}),
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

  async createProduct(
    token: string,
    input: CreateProductInput,
    requestId: string,
  ): Promise<{ data: CreateProductResult }> {
    const response = await this.request<ProductCreateResponse>('/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-request-id': requestId,
      },
      body: JSON.stringify({
        name: input.name,
        ...(input.description !== undefined ? { description: input.description } : {}),
        price: input.price,
        ...(input.stock !== undefined ? { stock: input.stock } : {}),
        condition: input.condition,
        category: input.category,
        ...(input.imageUrls !== undefined ? { image_urls: input.imageUrls } : {}),
      }),
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

  async updateProduct(
    token: string,
    productId: string,
    input: UpdateProductInput,
    requestId: string,
  ): Promise<{ data: UpdateProductResult }> {
    const response = await this.request<ProductCreateResponse>(`/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-request-id': requestId,
      },
      body: JSON.stringify({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.stock !== undefined ? { stock: input.stock } : {}),
        ...(input.condition !== undefined ? { condition: input.condition } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.imageUrls !== undefined ? { image_urls: input.imageUrls } : {}),
        ...(input.reason !== undefined ? { reason: input.reason } : {}),
      }),
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

  async deleteProduct(
    token: string,
    productId: string,
    requestId: string,
  ): Promise<{ data: DeleteProductResult }> {
    const response = await this.request<ProductDeleteResponse>(`/products/${productId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-request-id': requestId,
      },
    });

    return {
      data: {
        success: response.success,
        message: response.message,
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
      },
    };
  }

  async getMyOrders(token: string, requestId: string): Promise<{ data: OrderSummary[] }> {
    const response = await this.request<BackendOrderResponse[]>('/orders/mine', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-request-id': requestId,
      },
    });

    return {
      data: response.map((order) => ({
        id: order._id,
        totalAmount: order.total_amount,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        ...(order.stripe_session_id ? { stripeSessionId: order.stripe_session_id } : {}),
        ...(order.payment_intent_id ? { paymentIntentId: order.payment_intent_id } : {}),
        ...(order.carrier ? { carrier: order.carrier } : {}),
        ...(order.trackingNumber ? { trackingNumber: order.trackingNumber } : {}),
        ...(order.shippingAddress ? { shippingAddress: order.shippingAddress } : {}),
        items: (order.items ?? []).map((item) => ({
          id: item._id,
          quantity: item.quantity,
          price: item.price,
          ...(item.product?._id
            ? {
                product: {
                  id: item.product._id,
                  ...(item.product.name ? { name: item.product.name } : {}),
                  ...(item.product.description ? { description: item.product.description } : {}),
                  ...(item.product.price !== undefined ? { price: item.product.price } : {}),
                  ...(item.product.stock !== undefined ? { stock: item.product.stock } : {}),
                  ...(item.product.condition ? { condition: item.product.condition } : {}),
                  ...(item.product.category ? { category: item.product.category } : {}),
                  ...(item.product.image_urls?.[0]
                    ? { primaryImageUrl: item.product.image_urls[0] }
                    : {}),
                },
              }
            : {}),
        })),
      })),
    };
  }

  async getMyWarranties(token: string, requestId: string): Promise<{ data: WarrantySummary[] }> {
    const response = await this.request<BackendWarrantyResponse[]>('/warranties/mine', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-request-id': requestId,
      },
    });

    return {
      data: response.map((warranty) => ({
        id: warranty._id,
        status: warranty.status,
        description: warranty.description,
        evidenceUrls: warranty.evidenceUrls ?? [],
        createdAt: warranty.createdAt,
        ...(warranty.updatedAt ? { updatedAt: warranty.updatedAt } : {}),
        ...(warranty.resolvedAt ? { resolvedAt: warranty.resolvedAt } : {}),
        ...(warranty.technicianId ? { technicianId: warranty.technicianId } : {}),
        ...(warranty.technicianName ? { technicianName: warranty.technicianName } : {}),
        order: normalizeWarrantyOrder(warranty.orderId),
      })),
    };
  }

  async createWarrantyClaim(
    token: string,
    input: CreateWarrantyClaimInput,
    requestId: string,
  ): Promise<{ data: CreateWarrantyClaimResult }> {
    const response = await this.request<CreateWarrantyClaimResult>('/warranties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-request-id': requestId,
      },
      body: JSON.stringify(input),
    });

    return {
      data: {
        ticketId: response.ticketId,
        status: response.status,
      },
    };
  }

  async updateWarrantyStatus(
    token: string,
    warrantyId: string,
    input: UpdateWarrantyStatusInput,
    requestId: string,
  ): Promise<{ data: UpdateWarrantyStatusResult }> {
    const response = await this.request<BackendWarrantyStatusResponse>(
      `/warranties/${warrantyId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-request-id': requestId,
        },
        body: JSON.stringify(input),
      },
    );

    return {
      data: {
        id: response._id,
        orderId: response.orderId,
        userId: response.userId,
        status: response.status,
        description: response.description,
        evidenceUrls: response.evidenceUrls ?? [],
        ...(response.repairNotes !== undefined ? { repairNotes: response.repairNotes } : {}),
        ...(response.technicianId ? { technicianId: response.technicianId } : {}),
        ...(response.technicianName ? { technicianName: response.technicianName } : {}),
        createdAt: response.createdAt,
        ...(response.updatedAt ? { updatedAt: response.updatedAt } : {}),
        ...(response.resolvedAt ? { resolvedAt: response.resolvedAt } : {}),
      },
    };
  }

  async assignTechnician(
    token: string,
    warrantyId: string,
    input: AssignTechnicianInput,
    requestId: string,
  ): Promise<{ data: AssignTechnicianResult }> {
    const response = await this.request<BackendAssignTechnicianResponse>(
      `/warranties/${warrantyId}/assign`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-request-id': requestId,
        },
        body: JSON.stringify(input),
      },
    );

    return {
      data: {
        id: response._id,
        orderId: response.orderId,
        userId: response.userId,
        status: response.status,
        description: response.description,
        evidenceUrls: response.evidenceUrls ?? [],
        ...(response.repairNotes !== undefined ? { repairNotes: response.repairNotes } : {}),
        ...(response.technicianId ? { technicianId: response.technicianId } : {}),
        ...(response.technicianName ? { technicianName: response.technicianName } : {}),
        createdAt: response.createdAt,
        ...(response.updatedAt ? { updatedAt: response.updatedAt } : {}),
        ...(response.resolvedAt ? { resolvedAt: response.resolvedAt } : {}),
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

function normalizeWarrantyOrder(order: BackendWarrantyResponse['orderId']) {
  if (typeof order === 'string') {
    return {
      id: order,
    };
  }

  return {
    id: order._id ?? '',
    ...(order.total_amount !== undefined ? { totalAmount: order.total_amount } : {}),
    ...(order.status ? { status: order.status } : {}),
    ...(order.createdAt ? { createdAt: order.createdAt } : {}),
    ...(order.updatedAt ? { updatedAt: order.updatedAt } : {}),
  };
}
