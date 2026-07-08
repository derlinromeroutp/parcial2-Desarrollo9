import assert from 'node:assert/strict';
import test from 'node:test';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { createApp } from './server.js';
import type { Authenticator, AuthContext } from './types.js';
import { BackendApiClient, BackendApiError } from './services/backend-api.js';
import { createLogger } from './utils/logger.js';

const env = {
  PORT: 3100,
  HOST: '127.0.0.1',
  MCP_SERVER_NAME: 'SafeTech MCP Server',
  MCP_SERVER_VERSION: '0.1.0-test',
  MCP_PUBLIC_BASE_URL: 'https://mcp.test',
  BACKEND_API_URL: 'http://backend.test/api',
  CLERK_SECRET_KEY: 'test',
  OAUTH_ISSUER_URL: 'https://clever-gator-13.clerk.accounts.dev',
  OAUTH_SCOPES: 'openid profile email offline_access',
  OAUTH_RESOURCE_DOCUMENTATION_URL: 'https://docs.test/mcp',
  MCP_STDIO_USER_ID: 'local_stdio_user',
  MCP_STDIO_ROLE: 'admin' as const,
};

class FakeAuthenticator implements Authenticator {
  async authenticate(): Promise<AuthContext> {
    return {
      token: 'test-token',
      userId: 'user_test',
      role: 'admin',
      expiresAt: Math.floor(Date.now() / 1000) + 60,
    };
  }
}

class FakeBackendApi extends BackendApiClient {
  shouldFailProducts = false;

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
  assert.equal(tools.tools.length, 1);
  assert.equal(tools.tools[0]?.name, 'search_products');

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
