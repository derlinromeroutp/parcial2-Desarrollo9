import assert from 'node:assert/strict';
import test from 'node:test';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { createApp } from './server.js';
import type { Authenticator, AuthContext } from './types.js';
import { BackendApiClient, BackendApiError } from './services/backend-api.js';
import { createLogger } from './utils/logger.js';
import type {
  AssignTechnicianInput,
  AssignTechnicianResult,
  CreateProductInput,
  CreateProductResult,
  CreateWarrantyClaimInput,
  CreateWarrantyClaimResult,
  DeleteProductResult,
  OrderSummary,
  UpdateProductInput,
  UpdateProductResult,
  UpdateWarrantyStatusInput,
  UpdateWarrantyStatusResult,
  WarrantySummary,
} from './types.js';

const env = {
  PORT: 3100,
  HOST: '127.0.0.1',
  MCP_SERVER_NAME: 'SafeTech MCP Server',
  MCP_SERVER_VERSION: '0.1.0-test',
  MCP_PUBLIC_BASE_URL: 'https://mcp.test',
  BACKEND_API_URL: 'http://backend.test/api',
  CLERK_SECRET_KEY: 'test',
  CLERK_PUBLISHABLE_KEY: 'pk_test_test-publishable-key',
  OAUTH_ISSUER_URL: 'https://clever-gator-13.clerk.accounts.dev',
  OAUTH_SCOPES: 'openid profile email offline_access',
  OAUTH_RESOURCE_DOCUMENTATION_URL: 'https://docs.test/mcp',
  MCP_STDIO_USER_ID: 'local_stdio_user',
  MCP_STDIO_ROLE: 'admin' as const,
};

class FakeAuthenticator implements Authenticator {
  constructor(private readonly role: AuthContext['role'] = 'admin') {}

  async authenticate(): Promise<AuthContext> {
    return {
      token: 'test-token',
      userId: 'user_test',
      role: this.role,
      expiresAt: Math.floor(Date.now() / 1000) + 60,
    };
  }
}

class FakeBackendApi extends BackendApiClient {
  shouldFailProducts = false;
  shouldFailGetProduct = false;
  shouldNotFindProduct = false;
  shouldRejectProductId = false;
  shouldRejectOrdersAuth = false;
  shouldRejectWarrantiesAuth = false;
  shouldRejectCreateWarrantyAuth = false;
  shouldRejectCreateWarrantyForbidden = false;
  shouldRejectCreateWarrantyNotFound = false;
  shouldRejectCreateWarrantyConflict = false;
  shouldRejectCreateWarrantyInvalid = false;
  shouldRejectUpdateWarrantyAuth = false;
  shouldRejectUpdateWarrantyForbidden = false;
  shouldRejectUpdateWarrantyNotFound = false;
  shouldRejectUpdateWarrantyInvalid = false;
  shouldRejectAssignTechnicianAuth = false;
  shouldRejectAssignTechnicianForbidden = false;
  shouldRejectAssignTechnicianNotFound = false;
  shouldRejectAssignTechnicianTechnicianNotFound = false;
  shouldRejectAssignTechnicianTechnicianInactive = false;
  shouldRejectAssignTechnicianInvalid = false;
  shouldRejectCreateProductAuth = false;
  shouldRejectCreateProductForbidden = false;
  shouldRejectCreateProductInvalid = false;
  shouldRejectUpdateProductAuth = false;
  shouldRejectUpdateProductForbidden = false;
  shouldRejectUpdateProductInvalid = false;
  shouldRejectUpdateProductNotFound = false;
  shouldRejectDeleteProductAuth = false;
  shouldRejectDeleteProductForbidden = false;
  shouldRejectDeleteProductNotFound = false;
  shouldRejectDeleteProductBackend = false;
  lastOrdersToken?: string;
  lastWarrantiesToken?: string;
  lastCreateWarrantyToken?: string;
  lastCreateWarrantyInput?: CreateWarrantyClaimInput;
  lastCreateProductToken?: string;
  lastCreateProductInput?: CreateProductInput;
  lastUpdateProductToken?: string;
  lastUpdateProductId?: string;
  lastUpdateProductInput?: UpdateProductInput;
  lastDeleteProductToken?: string;
  lastDeleteProductId?: string;
  lastUpdateWarrantyToken?: string;
  lastUpdateWarrantyId?: string;
  lastUpdateWarrantyInput?: UpdateWarrantyStatusInput;
  lastAssignTechnicianToken?: string;
  lastAssignTechnicianId?: string;
  lastAssignTechnicianInput?: AssignTechnicianInput;

  constructor() {
    super('http://backend.test/api');
  }

  override async getHealth() {
    return {
      status: 'ok',
      timestamp: Date.now(),
      dbConnected: true,
    };
  }

  override async getProducts(filters: { name?: string; limit?: number }) {
    if (this.shouldFailProducts) {
      throw new BackendApiError('Bad request', 400, {
        success: false,
        errors: [{ message: 'Invalid filters' }],
      });
    }

    const data = [
      {
        id: 'prod_1',
        name: 'iPhone 13 Reacondicionado',
        description: '128GB',
        price: 699,
        stock: 4,
        condition: 'A' as const,
        category: 'celular' as const,
        primaryImageUrl: 'https://cdn.test/iphone.jpg',
      },
      {
        id: 'prod_2',
        name: 'Laptop ThinkPad X1',
        price: 899,
        stock: 0,
        condition: 'B' as const,
        category: 'laptop' as const,
        primaryImageUrl: 'https://cdn.test/thinkpad.jpg',
      },
    ];

    return {
      data: filters.name ? data.filter((product) => product.name.includes(filters.name!)) : data,
    };
  }

  override async getProduct(productId: string) {
    if (this.shouldRejectProductId) {
      throw new BackendApiError('Invalid product id', 400, {
        success: false,
        message: 'ID de producto invalido',
      });
    }

    if (this.shouldNotFindProduct) {
      throw new BackendApiError('Product not found', 404, {
        success: false,
        message: 'Producto no encontrado',
      });
    }

    if (this.shouldFailGetProduct) {
      throw new BackendApiError('Unexpected backend error', 500, {
        success: false,
        message: 'Unexpected error',
      });
    }

    return {
      data: {
        id: productId,
        name: 'iPhone 13 Reacondicionado',
        description: '128GB',
        price: 699,
        stock: 4,
        condition: 'A' as const,
        category: 'celular' as const,
        primaryImageUrl: 'https://cdn.test/iphone.jpg',
        imageUrls: ['https://cdn.test/iphone.jpg', 'https://cdn.test/iphone-back.jpg'],
      },
    };
  }

  override async createProduct(
    token: string,
    input: CreateProductInput,
    _requestId: string,
  ): Promise<{ data: CreateProductResult }> {
    this.lastCreateProductToken = token;
    this.lastCreateProductInput = input;

    if (this.shouldRejectCreateProductAuth) {
      throw new BackendApiError('Unauthorized', 401, {
        error: 'Unauthorized',
      });
    }

    if (this.shouldRejectCreateProductForbidden) {
      throw new BackendApiError('Forbidden', 403, {
        error: 'Forbidden',
      });
    }

    if (this.shouldRejectCreateProductInvalid) {
      throw new BackendApiError('Bad request', 400, {
        success: false,
        message: 'La categoría es inválida',
      });
    }

    return {
      data: {
        id: '6870f1e2a1234567890ab222',
        name: input.name,
        ...(input.description !== undefined ? { description: input.description } : {}),
        price: input.price,
        stock: input.stock ?? 0,
        condition: input.condition,
        category: input.category,
        primaryImageUrl: input.imageUrls?.[0],
        imageUrls: input.imageUrls ?? [],
      },
    };
  }

  override async updateProduct(
    token: string,
    productId: string,
    input: UpdateProductInput,
    _requestId: string,
  ): Promise<{ data: UpdateProductResult }> {
    this.lastUpdateProductToken = token;
    this.lastUpdateProductId = productId;
    this.lastUpdateProductInput = input;

    if (this.shouldRejectUpdateProductAuth) {
      throw new BackendApiError('Unauthorized', 401, {
        error: 'Unauthorized',
      });
    }

    if (this.shouldRejectUpdateProductForbidden) {
      throw new BackendApiError('Forbidden', 403, {
        error: 'Forbidden',
      });
    }

    if (this.shouldRejectUpdateProductNotFound) {
      throw new BackendApiError('Not found', 404, {
        success: false,
        message: 'Producto no encontrado',
      });
    }

    if (this.shouldRejectUpdateProductInvalid) {
      throw new BackendApiError('Bad request', 400, {
        success: false,
        message: 'El precio debe ser un valor positivo',
      });
    }

    return {
      data: {
        id: productId,
        name: input.name ?? 'iPhone 13 Reacondicionado',
        ...(input.description !== undefined ? { description: input.description } : {}),
        price: input.price ?? 699,
        stock: input.stock ?? 4,
        condition: input.condition ?? 'A',
        category: input.category ?? 'celular',
        primaryImageUrl: input.imageUrls?.[0] ?? 'https://cdn.test/iphone.jpg',
        imageUrls: input.imageUrls ?? ['https://cdn.test/iphone.jpg'],
      },
    };
  }

  override async getMyOrders(token: string, _requestId: string): Promise<{ data: OrderSummary[] }> {
    this.lastOrdersToken = token;

    if (this.shouldRejectOrdersAuth) {
      throw new BackendApiError('Unauthorized', 401, {
        error: 'Unauthorized: User ID not found',
      });
    }

    return {
      data: [
        {
          id: 'ord_1',
          totalAmount: 1598,
          status: 'paid',
          createdAt: '2026-07-01T10:00:00.000Z',
          updatedAt: '2026-07-01T10:05:00.000Z',
          stripeSessionId: 'cs_test_123',
          paymentIntentId: 'pi_test_123',
          carrier: 'DHL',
          trackingNumber: 'TRACK123',
          shippingAddress: {
            recipientName: 'Derlin Romero',
            city: 'Panama',
            country: 'PA',
          },
          items: [
            {
              id: 'item_1',
              quantity: 1,
              price: 699,
              product: {
                id: 'prod_1',
                name: 'iPhone 13 Reacondicionado',
                description: '128GB',
                price: 699,
                stock: 4,
                condition: 'A' as const,
                category: 'celular' as const,
                primaryImageUrl: 'https://cdn.test/iphone.jpg',
              },
            },
            {
              id: 'item_2',
              quantity: 1,
              price: 899,
              product: {
                id: 'prod_2',
                name: 'Laptop ThinkPad X1',
                price: 899,
                stock: 0,
                condition: 'B' as const,
                category: 'laptop' as const,
                primaryImageUrl: 'https://cdn.test/thinkpad.jpg',
              },
            },
          ],
        },
      ],
    };
  }

  override async getMyWarranties(
    token: string,
    _requestId: string,
  ): Promise<{ data: WarrantySummary[] }> {
    this.lastWarrantiesToken = token;

    if (this.shouldRejectWarrantiesAuth) {
      throw new BackendApiError('Unauthorized', 401, {
        error: 'Unauthorized: User ID not found',
      });
    }

    return {
      data: [
        {
          id: 'wr_1',
          status: 'review',
          description: '[battery] La bateria se descarga demasiado rapido',
          evidenceUrls: ['https://cdn.test/warranty-1.jpg'],
          createdAt: '2026-07-02T09:00:00.000Z',
          updatedAt: '2026-07-03T12:00:00.000Z',
          technicianId: 'tech_1',
          technicianName: 'Maria Gomez',
          order: {
            id: 'ord_1',
            totalAmount: 699,
            status: 'paid',
            createdAt: '2026-07-01T10:00:00.000Z',
            updatedAt: '2026-07-01T10:05:00.000Z',
          },
        },
      ],
    };
  }

  override async createWarrantyClaim(
    token: string,
    input: CreateWarrantyClaimInput,
    _requestId: string,
  ): Promise<{ data: CreateWarrantyClaimResult }> {
    this.lastCreateWarrantyToken = token;
    this.lastCreateWarrantyInput = input;

    if (this.shouldRejectCreateWarrantyAuth) {
      throw new BackendApiError('Unauthorized', 401, {
        error: 'Unauthorized: User ID not found',
      });
    }

    if (this.shouldRejectCreateWarrantyForbidden) {
      throw new BackendApiError('Forbidden', 403, {
        error: 'No autorizado: La orden no pertenece a este usuario',
      });
    }

    if (this.shouldRejectCreateWarrantyNotFound) {
      throw new BackendApiError('Not found', 404, {
        error: 'Orden no encontrada',
      });
    }

    if (this.shouldRejectCreateWarrantyConflict) {
      throw new BackendApiError('Conflict', 409, {
        error: 'Ya registraste una garantia para esta orden',
      });
    }

    if (this.shouldRejectCreateWarrantyInvalid) {
      throw new BackendApiError('Bad request', 400, {
        error: 'Garantía Expirada. Plazo Legal agotado',
      });
    }

    return {
      data: {
        ticketId: 'wr_new_1',
        status: 'pending',
      },
    };
  }

  override async updateWarrantyStatus(
    token: string,
    warrantyId: string,
    input: UpdateWarrantyStatusInput,
    _requestId: string,
  ): Promise<{ data: UpdateWarrantyStatusResult }> {
    this.lastUpdateWarrantyToken = token;
    this.lastUpdateWarrantyId = warrantyId;
    this.lastUpdateWarrantyInput = input;

    if (this.shouldRejectUpdateWarrantyAuth) {
      throw new BackendApiError('Unauthorized', 401, {
        error: 'Unauthorized: Token verification failed',
      });
    }

    if (this.shouldRejectUpdateWarrantyForbidden) {
      throw new BackendApiError('Forbidden', 403, {
        error: 'Forbidden: Insufficient privileges',
      });
    }

    if (this.shouldRejectUpdateWarrantyNotFound) {
      throw new BackendApiError('Not found', 404, {
        error: 'Report not found',
      });
    }

    if (this.shouldRejectUpdateWarrantyInvalid) {
      throw new BackendApiError('Bad request', 400, {
        error: 'Invalid status transition',
      });
    }

    return {
      data: {
        id: warrantyId,
        orderId: '6870f1e2a1234567890abcde',
        userId: 'user_owner_1',
        status: input.status,
        description: '[battery] La bateria no carga correctamente',
        evidenceUrls: ['https://cdn.test/evidence-1.jpg'],
        ...(input.repairNotes !== undefined ? { repairNotes: input.repairNotes } : {}),
        technicianId: 'tech_1',
        technicianName: 'Maria Gomez',
        createdAt: '2026-07-02T09:00:00.000Z',
        updatedAt: '2026-07-03T12:00:00.000Z',
        ...(input.status === 'resolved'
          ? { resolvedAt: '2026-07-03T12:00:00.000Z' }
          : {}),
      },
    };
  }

  override async assignTechnician(
    token: string,
    warrantyId: string,
    input: AssignTechnicianInput,
    _requestId: string,
  ): Promise<{ data: AssignTechnicianResult }> {
    this.lastAssignTechnicianToken = token;
    this.lastAssignTechnicianId = warrantyId;
    this.lastAssignTechnicianInput = input;

    if (this.shouldRejectAssignTechnicianAuth) {
      throw new BackendApiError('Unauthorized', 401, {
        error: 'Unauthorized: Token verification failed',
      });
    }

    if (this.shouldRejectAssignTechnicianForbidden) {
      throw new BackendApiError('Forbidden', 403, {
        error: 'Forbidden: Insufficient privileges',
      });
    }

    if (this.shouldRejectAssignTechnicianTechnicianNotFound) {
      throw new BackendApiError('Not found', 404, {
        error: 'Technician not found',
      });
    }

    if (this.shouldRejectAssignTechnicianTechnicianInactive) {
      throw new BackendApiError('Conflict', 409, {
        error: 'Technician is inactive',
      });
    }

    if (this.shouldRejectAssignTechnicianNotFound) {
      throw new BackendApiError('Not found', 404, {
        error: 'Report not found',
      });
    }

    if (this.shouldRejectAssignTechnicianInvalid) {
      throw new BackendApiError('Bad request', 400, {
        error: 'Missing technicianId',
      });
    }

    return {
      data: {
        id: warrantyId,
        orderId: '6870f1e2a1234567890abcde',
        userId: 'user_owner_1',
        status: 'review',
        description: '[battery] La bateria no carga correctamente',
        evidenceUrls: ['https://cdn.test/evidence-1.jpg'],
        technicianId: input.technicianId,
        technicianName: 'Maria Gomez',
        createdAt: '2026-07-02T09:00:00.000Z',
        updatedAt: '2026-07-03T12:00:00.000Z',
      },
    };
  }

  override async deleteProduct(
    token: string,
    productId: string,
    _requestId: string,
  ): Promise<{ data: DeleteProductResult }> {
    this.lastDeleteProductToken = token;
    this.lastDeleteProductId = productId;

    if (this.shouldRejectDeleteProductAuth) {
      throw new BackendApiError('Unauthorized', 401, {
        error: 'Unauthorized',
      });
    }

    if (this.shouldRejectDeleteProductForbidden) {
      throw new BackendApiError('Forbidden', 403, {
        error: 'Forbidden',
      });
    }

    if (this.shouldRejectDeleteProductNotFound) {
      throw new BackendApiError('Not found', 404, {
        success: false,
        message: 'Producto no encontrado',
      });
    }

    if (this.shouldRejectDeleteProductBackend) {
      throw new BackendApiError('Internal error', 500, {
        success: false,
        message: 'Unexpected error',
      });
    }

    return {
      data: {
        success: true,
        message: 'Producto eliminado correctamente',
        data: {
          id: productId,
          name: 'iPhone 13 Reacondicionado',
          description: '128GB',
          price: 699,
          stock: 4,
          condition: 'A',
          category: 'celular',
          primaryImageUrl: 'https://cdn.test/iphone.jpg',
          imageUrls: ['https://cdn.test/iphone.jpg', 'https://cdn.test/iphone-back.jpg'],
        },
      },
    };
  }
}

test('health endpoint reports backend connectivity', async () => {
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator(),
    backendApi: new FakeBackendApi(),
  });

  const response = await app.fetch(new Request('http://test.local/health'));
  assert.equal(response.status, 200);

  const body = (await response.json()) as { status: string; backend: { status: string } };
  assert.equal(body.status, 'ok');
  assert.equal(body.backend.status, 'ok');
});

test('oauth protected resource metadata is published for remote clients', async () => {
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator(),
    backendApi: new FakeBackendApi(),
  });

  const response = await app.fetch(
    new Request('http://test.local/.well-known/oauth-protected-resource'),
  );

  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    resource: string;
    authorization_servers: string[];
    scopes_supported: string[];
    resource_documentation?: string;
  };

  assert.equal(body.resource, env.MCP_PUBLIC_BASE_URL);
  assert.deepEqual(body.authorization_servers, [env.OAUTH_ISSUER_URL]);
  assert.deepEqual(body.scopes_supported, ['openid', 'profile', 'email', 'offline_access']);
  assert.equal(body.resource_documentation, env.OAUTH_RESOURCE_DOCUMENTATION_URL);
});

test('unauthenticated mcp requests advertise oauth discovery', async () => {
  const failingAuthenticator: Authenticator = {
    authenticate: async () => {
      throw new Error('Missing bearer token');
    },
  };

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: failingAuthenticator,
    backendApi: new FakeBackendApi(),
  });

  const response = await app.fetch(new Request('http://test.local/mcp'));
  assert.equal(response.status, 500);

  const header = response.headers.get('WWW-Authenticate');
  assert.ok(header?.includes('/.well-known/oauth-protected-resource'));

  const body = (await response.json()) as {
    _meta?: { 'mcp/www_authenticate'?: string[] };
  };
  assert.ok(body._meta?.['mcp/www_authenticate']?.[0]?.includes('/.well-known/oauth-protected-resource'));
});

test('mcp handshake works and exposes search_products tool', async () => {
  const backendApi = new FakeBackendApi();
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator(),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const serverVersion = client.getServerVersion();
  assert.equal(serverVersion?.name, 'SafeTech MCP Server');

  const tools = await client.listTools();
  assert.equal(tools.tools.length, 10);
  assert.deepEqual(
    tools.tools.map((tool) => tool.name).sort(),
    ['assign_technician', 'create_product', 'create_warranty_claim', 'delete_product', 'get_product', 'list_my_orders', 'list_my_warranties', 'search_products', 'update_product', 'update_warranty_status'],
  );

  const result = await client.callTool({
    name: 'search_products',
    arguments: {
      query: 'iPhone',
      limit: 5,
    },
  });

  assert.equal(result.isError, undefined);
  assert.deepEqual(result.structuredContent, {
    products: [
      {
        id: 'prod_1',
        name: 'iPhone 13 Reacondicionado',
        description: '128GB',
        price: 699,
        stock: 4,
        condition: 'A',
        category: 'celular',
        primaryImageUrl: 'https://cdn.test/iphone.jpg',
      },
    ],
    count: 1,
    appliedFilters: {
      name: 'iPhone',
      limit: 5,
    },
  });

  await transport.terminateSession();
  await client.close();
});

test('update_warranty_status updates a warranty for an admin user', async () => {
  const backendApi = new FakeBackendApi();
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('admin'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'update_warranty_status',
    arguments: {
      warrantyId: '6870f1e2a1234567890abcdf',
      status: 'resolved',
      repairNotes: 'Battery module replaced',
    },
  });

  assert.equal(result.isError, undefined);
  assert.equal(backendApi.lastUpdateWarrantyToken, 'test-token');
  assert.equal(backendApi.lastUpdateWarrantyId, '6870f1e2a1234567890abcdf');
  assert.deepEqual(backendApi.lastUpdateWarrantyInput, {
    status: 'resolved',
    repairNotes: 'Battery module replaced',
  });
  assert.deepEqual(result.structuredContent, {
    id: '6870f1e2a1234567890abcdf',
    orderId: '6870f1e2a1234567890abcde',
    userId: 'user_owner_1',
    status: 'resolved',
    description: '[battery] La bateria no carga correctamente',
    evidenceUrls: ['https://cdn.test/evidence-1.jpg'],
    repairNotes: 'Battery module replaced',
    technicianId: 'tech_1',
    technicianName: 'Maria Gomez',
    createdAt: '2026-07-02T09:00:00.000Z',
    updatedAt: '2026-07-03T12:00:00.000Z',
    resolvedAt: '2026-07-03T12:00:00.000Z',
  });

  await transport.terminateSession();
  await client.close();
});

test('create_product creates a product for an admin user', async () => {
  const backendApi = new FakeBackendApi();
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('admin'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'create_product',
    arguments: {
      name: 'MacBook Pro 14 Reacondicionado',
      description: 'M3 Pro, 18GB RAM, 512GB SSD',
      price: 1899,
      stock: 3,
      condition: 'A',
      category: 'laptop',
      imageUrls: ['https://cdn.test/macbook-front.jpg', 'https://cdn.test/macbook-side.jpg'],
    },
  });

  assert.equal(result.isError, undefined);
  assert.equal(backendApi.lastCreateProductToken, 'test-token');
  assert.deepEqual(backendApi.lastCreateProductInput, {
    name: 'MacBook Pro 14 Reacondicionado',
    description: 'M3 Pro, 18GB RAM, 512GB SSD',
    price: 1899,
    stock: 3,
    condition: 'A',
    category: 'laptop',
    imageUrls: ['https://cdn.test/macbook-front.jpg', 'https://cdn.test/macbook-side.jpg'],
  });
  assert.deepEqual(result.structuredContent, {
    id: '6870f1e2a1234567890ab222',
    name: 'MacBook Pro 14 Reacondicionado',
    description: 'M3 Pro, 18GB RAM, 512GB SSD',
    price: 1899,
    stock: 3,
    condition: 'A',
    category: 'laptop',
    primaryImageUrl: 'https://cdn.test/macbook-front.jpg',
    imageUrls: ['https://cdn.test/macbook-front.jpg', 'https://cdn.test/macbook-side.jpg'],
  });

  await transport.terminateSession();
  await client.close();
});

test('update_product updates a product for an admin user', async () => {
  const backendApi = new FakeBackendApi();
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('admin'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'update_product',
    arguments: {
      productId: '6870f1e2a1234567890ab222',
      updates: {
        price: 749,
        stock: 6,
        imageUrls: ['https://cdn.test/iphone-new.jpg'],
        reason: 'Reconteo de inventario',
      },
    },
  });

  assert.equal(result.isError, undefined);
  assert.equal(backendApi.lastUpdateProductToken, 'test-token');
  assert.equal(backendApi.lastUpdateProductId, '6870f1e2a1234567890ab222');
  assert.deepEqual(backendApi.lastUpdateProductInput, {
    price: 749,
    stock: 6,
    imageUrls: ['https://cdn.test/iphone-new.jpg'],
    reason: 'Reconteo de inventario',
  });
  assert.deepEqual(result.structuredContent, {
    id: '6870f1e2a1234567890ab222',
    name: 'iPhone 13 Reacondicionado',
    price: 749,
    stock: 6,
    condition: 'A',
    category: 'celular',
    primaryImageUrl: 'https://cdn.test/iphone-new.jpg',
    imageUrls: ['https://cdn.test/iphone-new.jpg'],
  });

  await transport.terminateSession();
  await client.close();
});

test('create_product rejects non-admin users before calling the backend', async () => {
  const backendApi = new FakeBackendApi();
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('user'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'create_product',
    arguments: {
      name: 'MacBook Pro 14 Reacondicionado',
      price: 1899,
      condition: 'A',
      category: 'laptop',
    },
  });

  assert.equal(result.isError, true);
  assert.equal(backendApi.lastCreateProductToken, undefined);
  assert.deepEqual(result.structuredContent, {
    code: 'FORBIDDEN',
    message: 'Solo un administrador puede crear productos.',
  });

  await transport.terminateSession();
  await client.close();
});

test('update_product rejects non-admin users before calling the backend', async () => {
  const backendApi = new FakeBackendApi();
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('user'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'update_product',
    arguments: {
      productId: '6870f1e2a1234567890ab222',
      updates: {
        price: 749,
      },
    },
  });

  assert.equal(result.isError, true);
  assert.equal(backendApi.lastUpdateProductToken, undefined);
  assert.deepEqual(result.structuredContent, {
    code: 'FORBIDDEN',
    message: 'Solo un administrador puede actualizar productos.',
  });

  await transport.terminateSession();
  await client.close();
});

test('create_product normalizes backend validation failures', async () => {
  const backendApi = new FakeBackendApi();
  backendApi.shouldRejectCreateProductInvalid = true;

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('admin'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'create_product',
    arguments: {
      name: 'MacBook Pro 14 Reacondicionado',
      price: 1899,
      condition: 'A',
      category: 'laptop',
    },
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    code: 'INVALID_PRODUCT_INPUT',
    message: 'La categoría es inválida',
  });

  await transport.terminateSession();
  await client.close();
});

test('update_product normalizes backend validation failures', async () => {
  const backendApi = new FakeBackendApi();
  backendApi.shouldRejectUpdateProductInvalid = true;

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('admin'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'update_product',
    arguments: {
      productId: '6870f1e2a1234567890ab222',
      updates: {
        price: 749,
      },
    },
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    code: 'INVALID_PRODUCT_INPUT',
    message: 'El precio debe ser un valor positivo',
  });

  await transport.terminateSession();
  await client.close();
});

test('update_product normalizes product not found responses', async () => {
  const backendApi = new FakeBackendApi();
  backendApi.shouldRejectUpdateProductNotFound = true;

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('admin'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'update_product',
    arguments: {
      productId: '6870f1e2a1234567890ab999',
      updates: {
        stock: 2,
      },
    },
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    code: 'PRODUCT_NOT_FOUND',
    message: 'Producto no encontrado',
  });

  await transport.terminateSession();
  await client.close();
});

test('delete_product deletes a product for an admin user', async () => {
  const backendApi = new FakeBackendApi();
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('admin'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'delete_product',
    arguments: {
      productId: '6870f1e2a1234567890ab222',
      reason: 'Producto retirado del catalogo',
    },
  });

  assert.equal(result.isError, undefined);
  assert.equal(backendApi.lastDeleteProductToken, 'test-token');
  assert.equal(backendApi.lastDeleteProductId, '6870f1e2a1234567890ab222');
  assert.deepEqual(result.structuredContent, {
    success: true,
    message: 'Producto eliminado correctamente',
    data: {
      id: '6870f1e2a1234567890ab222',
      name: 'iPhone 13 Reacondicionado',
      description: '128GB',
      price: 699,
      stock: 4,
      condition: 'A',
      category: 'celular',
      primaryImageUrl: 'https://cdn.test/iphone.jpg',
      imageUrls: ['https://cdn.test/iphone.jpg', 'https://cdn.test/iphone-back.jpg'],
    },
  });

  await transport.terminateSession();
  await client.close();
});

test('delete_product rejects non-admin users before calling the backend', async () => {
  const backendApi = new FakeBackendApi();
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('user'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'delete_product',
    arguments: {
      productId: '6870f1e2a1234567890ab222',
    },
  });

  assert.equal(result.isError, true);
  assert.equal(backendApi.lastDeleteProductToken, undefined);
  assert.deepEqual(result.structuredContent, {
    code: 'FORBIDDEN',
    message: 'Solo un administrador puede eliminar productos.',
  });

  await transport.terminateSession();
  await client.close();
});

test('delete_product normalizes product not found responses', async () => {
  const backendApi = new FakeBackendApi();
  backendApi.shouldRejectDeleteProductNotFound = true;

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('admin'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'delete_product',
    arguments: {
      productId: '6870f1e2a1234567890ab999',
    },
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    code: 'PRODUCT_NOT_FOUND',
    message: 'Producto no encontrado',
  });

  await transport.terminateSession();
  await client.close();
});

test('delete_product normalizes unexpected backend failures', async () => {
  const backendApi = new FakeBackendApi();
  backendApi.shouldRejectDeleteProductBackend = true;

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('admin'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'delete_product',
    arguments: {
      productId: '6870f1e2a1234567890ab222',
    },
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    code: 'BACKEND_500',
    message: 'No fue posible eliminar el producto en este momento.',
  });

  await transport.terminateSession();
  await client.close();
});

test('update_warranty_status rejects non-admin users before calling the backend', async () => {
  const backendApi = new FakeBackendApi();
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('user'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'update_warranty_status',
    arguments: {
      warrantyId: '6870f1e2a1234567890abcdf',
      status: 'review',
    },
  });

  assert.equal(result.isError, true);
  assert.equal(backendApi.lastUpdateWarrantyToken, undefined);
  assert.deepEqual(result.structuredContent, {
    code: 'FORBIDDEN',
    message: 'Solo un administrador puede actualizar el estado de una garantia.',
  });

  await transport.terminateSession();
  await client.close();
});

test('update_warranty_status normalizes backend validation failures', async () => {
  const backendApi = new FakeBackendApi();
  backendApi.shouldRejectUpdateWarrantyInvalid = true;

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('admin'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'update_warranty_status',
    arguments: {
      warrantyId: '6870f1e2a1234567890abcdf',
      status: 'rejected',
    },
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    code: 'INVALID_WARRANTY_UPDATE',
    message: 'Invalid status transition',
  });

  await transport.terminateSession();
  await client.close();
});

test('assign_technician assigns a technician for an admin user', async () => {
  const backendApi = new FakeBackendApi();
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('admin'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'assign_technician',
    arguments: {
      warrantyId: '6870f1e2a1234567890abcdf',
      technicianId: '6870f1e2a1234567890ab111',
    },
  });

  assert.equal(result.isError, undefined);
  assert.equal(backendApi.lastAssignTechnicianToken, 'test-token');
  assert.equal(backendApi.lastAssignTechnicianId, '6870f1e2a1234567890abcdf');
  assert.deepEqual(backendApi.lastAssignTechnicianInput, {
    technicianId: '6870f1e2a1234567890ab111',
  });
  assert.deepEqual(result.structuredContent, {
    id: '6870f1e2a1234567890abcdf',
    orderId: '6870f1e2a1234567890abcde',
    userId: 'user_owner_1',
    status: 'review',
    description: '[battery] La bateria no carga correctamente',
    evidenceUrls: ['https://cdn.test/evidence-1.jpg'],
    technicianId: '6870f1e2a1234567890ab111',
    technicianName: 'Maria Gomez',
    createdAt: '2026-07-02T09:00:00.000Z',
    updatedAt: '2026-07-03T12:00:00.000Z',
  });

  await transport.terminateSession();
  await client.close();
});

test('assign_technician rejects non-admin users before calling the backend', async () => {
  const backendApi = new FakeBackendApi();
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('user'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'assign_technician',
    arguments: {
      warrantyId: '6870f1e2a1234567890abcdf',
      technicianId: '6870f1e2a1234567890ab111',
    },
  });

  assert.equal(result.isError, true);
  assert.equal(backendApi.lastAssignTechnicianToken, undefined);
  assert.deepEqual(result.structuredContent, {
    code: 'FORBIDDEN',
    message: 'Solo un administrador puede asignar tecnicos a garantias.',
  });

  await transport.terminateSession();
  await client.close();
});

test('assign_technician normalizes a missing technician backend failure', async () => {
  const backendApi = new FakeBackendApi();
  backendApi.shouldRejectAssignTechnicianTechnicianNotFound = true;

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('admin'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'assign_technician',
    arguments: {
      warrantyId: '6870f1e2a1234567890abcdf',
      technicianId: '6870f1e2a1234567890ab111',
    },
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    code: 'TECHNICIAN_NOT_FOUND',
    message: 'No se encontro el tecnico indicado.',
  });

  await transport.terminateSession();
  await client.close();
});

test('assign_technician normalizes an inactive technician backend failure', async () => {
  const backendApi = new FakeBackendApi();
  backendApi.shouldRejectAssignTechnicianTechnicianInactive = true;

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('admin'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'assign_technician',
    arguments: {
      warrantyId: '6870f1e2a1234567890abcdf',
      technicianId: '6870f1e2a1234567890ab111',
    },
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    code: 'TECHNICIAN_INACTIVE',
    message: 'El tecnico indicado existe, pero esta inactivo.',
  });

  await transport.terminateSession();
  await client.close();
});

test('assign_technician normalizes a missing warranty backend failure', async () => {
  const backendApi = new FakeBackendApi();
  backendApi.shouldRejectAssignTechnicianNotFound = true;

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator('admin'),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'assign_technician',
    arguments: {
      warrantyId: '6870f1e2a1234567890abcdf',
      technicianId: '6870f1e2a1234567890ab111',
    },
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    code: 'WARRANTY_NOT_FOUND',
    message: 'No se encontro la garantia indicada.',
  });

  await transport.terminateSession();
  await client.close();
});

test('list_my_warranties returns normalized warranties for the authenticated user', async () => {
  const backendApi = new FakeBackendApi();
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator(),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'list_my_warranties',
    arguments: {},
  });

  assert.equal(result.isError, undefined);
  assert.equal(backendApi.lastWarrantiesToken, 'test-token');
  assert.deepEqual(result.structuredContent, {
    warranties: [
      {
        id: 'wr_1',
        status: 'review',
        description: '[battery] La bateria se descarga demasiado rapido',
        evidenceUrls: ['https://cdn.test/warranty-1.jpg'],
        createdAt: '2026-07-02T09:00:00.000Z',
        updatedAt: '2026-07-03T12:00:00.000Z',
        technicianId: 'tech_1',
        technicianName: 'Maria Gomez',
        order: {
          id: 'ord_1',
          totalAmount: 699,
          status: 'paid',
          createdAt: '2026-07-01T10:00:00.000Z',
          updatedAt: '2026-07-01T10:05:00.000Z',
        },
      },
    ],
    count: 1,
  });

  await transport.terminateSession();
  await client.close();
});

test('list_my_warranties rejects authenticated backend failures in a controlled way', async () => {
  const backendApi = new FakeBackendApi();
  backendApi.shouldRejectWarrantiesAuth = true;

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator(),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'list_my_warranties',
    arguments: {},
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    code: 'AUTH_REQUIRED',
    message: 'La sesion no es valida para consultar garantias.',
  });

  await transport.terminateSession();
  await client.close();
});

test('create_warranty_claim creates a warranty claim for the authenticated user', async () => {
  const backendApi = new FakeBackendApi();
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator(),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'create_warranty_claim',
    arguments: {
      orderId: '507f191e810c19729de860ea',
      reason: 'battery',
      description: 'La bateria se descarga demasiado rapido.',
      evidenceUrls: ['https://cdn.test/warranty-new-1.jpg'],
    },
  });

  assert.equal(result.isError, undefined);
  assert.equal(backendApi.lastCreateWarrantyToken, 'test-token');
  assert.deepEqual(backendApi.lastCreateWarrantyInput, {
    orderId: '507f191e810c19729de860ea',
    reason: 'battery',
    description: 'La bateria se descarga demasiado rapido.',
    evidenceUrls: ['https://cdn.test/warranty-new-1.jpg'],
  });
  assert.deepEqual(result.structuredContent, {
    ticketId: 'wr_new_1',
    status: 'pending',
  });

  await transport.terminateSession();
  await client.close();
});

test('create_warranty_claim rejects warranty claims for third-party orders in a controlled way', async () => {
  const backendApi = new FakeBackendApi();
  backendApi.shouldRejectCreateWarrantyForbidden = true;

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator(),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'create_warranty_claim',
    arguments: {
      orderId: '507f191e810c19729de860ea',
      reason: 'battery',
      description: 'La bateria se descarga demasiado rapido.',
      evidenceUrls: ['https://cdn.test/warranty-new-1.jpg'],
    },
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    code: 'FORBIDDEN',
    message: 'No puedes crear un reclamo sobre una orden que no te pertenece.',
  });

  await transport.terminateSession();
  await client.close();
});

test('create_warranty_claim normalizes backend validation failures in a controlled way', async () => {
  const backendApi = new FakeBackendApi();
  backendApi.shouldRejectCreateWarrantyInvalid = true;

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator(),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'create_warranty_claim',
    arguments: {
      orderId: '507f191e810c19729de860ea',
      reason: 'battery',
      description: 'La bateria se descarga demasiado rapido.',
      evidenceUrls: ['https://cdn.test/warranty-new-1.jpg'],
    },
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    code: 'INVALID_WARRANTY_CLAIM',
    message: 'Garantía Expirada. Plazo Legal agotado',
  });

  await transport.terminateSession();
  await client.close();
});

test('list_my_orders returns normalized orders for the authenticated user', async () => {
  const backendApi = new FakeBackendApi();
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator(),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'list_my_orders',
    arguments: {},
  });

  assert.equal(result.isError, undefined);
  assert.equal(backendApi.lastOrdersToken, 'test-token');
  assert.deepEqual(result.structuredContent, {
    orders: [
      {
        id: 'ord_1',
        totalAmount: 1598,
        status: 'paid',
        createdAt: '2026-07-01T10:00:00.000Z',
        updatedAt: '2026-07-01T10:05:00.000Z',
        stripeSessionId: 'cs_test_123',
        paymentIntentId: 'pi_test_123',
        carrier: 'DHL',
        trackingNumber: 'TRACK123',
        shippingAddress: {
          recipientName: 'Derlin Romero',
          city: 'Panama',
          country: 'PA',
        },
        items: [
          {
            id: 'item_1',
            quantity: 1,
            price: 699,
            product: {
              id: 'prod_1',
              name: 'iPhone 13 Reacondicionado',
              description: '128GB',
              price: 699,
              stock: 4,
              condition: 'A',
              category: 'celular',
              primaryImageUrl: 'https://cdn.test/iphone.jpg',
            },
          },
          {
            id: 'item_2',
            quantity: 1,
            price: 899,
            product: {
              id: 'prod_2',
              name: 'Laptop ThinkPad X1',
              price: 899,
              stock: 0,
              condition: 'B',
              category: 'laptop',
              primaryImageUrl: 'https://cdn.test/thinkpad.jpg',
            },
          },
        ],
      },
    ],
    count: 1,
  });

  await transport.terminateSession();
  await client.close();
});

test('list_my_orders rejects authenticated backend failures in a controlled way', async () => {
  const backendApi = new FakeBackendApi();
  backendApi.shouldRejectOrdersAuth = true;

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator(),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'list_my_orders',
    arguments: {},
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    code: 'AUTH_REQUIRED',
    message: 'La sesion no es valida para consultar pedidos.',
  });

  await transport.terminateSession();
  await client.close();
});

test('get_product returns normalized product detail', async () => {
  const backendApi = new FakeBackendApi();
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator(),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'get_product',
    arguments: {
      id: '507f1f77bcf86cd799439011',
    },
  });

  assert.equal(result.isError, undefined);
  assert.deepEqual(result.structuredContent, {
    id: '507f1f77bcf86cd799439011',
    name: 'iPhone 13 Reacondicionado',
    description: '128GB',
    price: 699,
    stock: 4,
    condition: 'A',
    category: 'celular',
    primaryImageUrl: 'https://cdn.test/iphone.jpg',
    imageUrls: ['https://cdn.test/iphone.jpg', 'https://cdn.test/iphone-back.jpg'],
  });

  await transport.terminateSession();
  await client.close();
});

test('get_product normalizes not found errors', async () => {
  const backendApi = new FakeBackendApi();
  backendApi.shouldNotFindProduct = true;

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator(),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'get_product',
    arguments: {
      id: '507f1f77bcf86cd799439099',
    },
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    code: 'PRODUCT_NOT_FOUND',
    message: 'No se encontro un producto con el identificador indicado.',
  });

  await transport.terminateSession();
  await client.close();
});

test('get_product normalizes invalid id errors', async () => {
  const backendApi = new FakeBackendApi();
  backendApi.shouldRejectProductId = true;

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator(),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'get_product',
    arguments: {
      id: 'bad-id',
    },
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    code: 'INVALID_PRODUCT_ID',
    message: 'El identificador del producto no es valido.',
  });

  await transport.terminateSession();
  await client.close();
});

test('get_product normalizes backend failures', async () => {
  const backendApi = new FakeBackendApi();
  backendApi.shouldFailGetProduct = true;

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator(),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'get_product',
    arguments: {
      id: '507f1f77bcf86cd799439011',
    },
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    code: 'BACKEND_500',
    message: 'No fue posible obtener el detalle del producto en este momento.',
  });

  await transport.terminateSession();
  await client.close();
});

test('search_products normalizes backend validation errors', async () => {
  const backendApi = new FakeBackendApi();
  backendApi.shouldFailProducts = true;

  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator(),
    backendApi,
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: async (url, init) => app.fetch(new Request(url, init)),
    authProvider: {
      token: async () => 'test-token',
    },
  });

  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );

  await client.connect(transport);

  const result = await client.callTool({
    name: 'search_products',
    arguments: {
      name: 'bad-filter',
      limit: 5,
    },
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    code: 'INVALID_BACKEND_REQUEST',
    message: 'La busqueda no pudo ejecutarse por parametros invalidos.',
  });

  await transport.terminateSession();
  await client.close();
});
