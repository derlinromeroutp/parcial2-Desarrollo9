import 'dotenv/config';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { buildServer } from './bootstrap.js';
import { loadEnv } from './config/env.js';
import { BackendApiClient } from './services/backend-api.js';
import { createLogger } from './utils/logger.js';

const env = loadEnv();
const logger = createLogger();
const backendApi = new BackendApiClient(env.BACKEND_API_URL);

serveStdio(
  () =>
    buildServer({
      env,
      logger,
      backendApi,
      authInfo: {
        token: 'stdio-local-session',
        clientId: env.MCP_STDIO_USER_ID,
        scopes: ['mcp', `role:${env.MCP_STDIO_ROLE}`],
        expiresAt: Math.floor(Date.now() / 1000) + 60 * 60,
      },
    }),
  {
    onerror: (error) => {
      logger.error('stdio.server_error', {
        error: error.message,
      });
    },
  },
);
