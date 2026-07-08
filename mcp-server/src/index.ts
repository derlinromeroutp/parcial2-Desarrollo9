import 'dotenv/config';
import { serve } from '@hono/node-server';
import { ClerkAuthenticator } from './auth/clerk-authenticator.js';
import { loadEnv } from './config/env.js';
import { BackendApiClient } from './services/backend-api.js';
import { createApp } from './server.js';
import { createLogger } from './utils/logger.js';

const env = loadEnv();
const logger = createLogger();
const backendApi = new BackendApiClient(env.BACKEND_API_URL);
const authenticator = new ClerkAuthenticator(
  env.CLERK_SECRET_KEY,
  env.CLERK_PUBLISHABLE_KEY,
  logger,
);
const { app } = createApp({ env, logger, authenticator, backendApi });

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
    hostname: env.HOST,
  },
  (info) => {
    logger.info('server.started', {
      host: info.address,
      port: info.port,
      backendApiUrl: env.BACKEND_API_URL,
      transport: 'http',
    });
  },
);
