import assert from 'node:assert/strict';
import test from 'node:test';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { createApp } from './server.js';
import type { Authenticator, AuthContext } from './types.js';
import { BackendApiClient } from './services/backend-api.js';
import { createLogger } from './utils/logger.js';

const env = {
  PORT: 3100,
  HOST: '127.0.0.1',
  MCP_SERVER_NAME: 'SafeTech MCP Server',
  MCP_SERVER_VERSION: '0.1.0-test',
  BACKEND_API_URL: 'http://backend.test/api',
  CLERK_SECRET_KEY: 'test',
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

test('mcp handshake works and exposes no tools', async () => {
  const { app } = createApp({
    env,
    logger: createLogger(),
    authenticator: new FakeAuthenticator(),
    backendApi: new FakeBackendApi(),
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
  assert.deepEqual(tools.tools, []);

  await transport.terminateSession();
  await client.close();
});
