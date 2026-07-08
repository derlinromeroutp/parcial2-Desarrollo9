import { McpServer } from '@modelcontextprotocol/server';
import type { AuthInfo } from '@modelcontextprotocol/server';
import type { AppEnv } from './config/env.js';
import type { BackendApiClient } from './services/backend-api.js';
import { registerSearchProductsTool } from './tools/public/search-products.tool.js';
import { registerGetProductTool } from './tools/public/get-product.tool.js';
import { registerListMyOrdersTool } from './tools/user/list-my-orders.tool.js';
import type { Logger } from './utils/logger.js';

interface ServerDependencies {
  env: AppEnv;
  logger: Logger;
  backendApi: BackendApiClient;
  authInfo?: AuthInfo;
}

export function buildServer({ env, logger, backendApi, authInfo }: ServerDependencies) {
  const server = new McpServer({
    name: env.MCP_SERVER_NAME,
    version: env.MCP_SERVER_VERSION,
    description: buildInstructions(authInfo),
  });

  registerSearchProductsTool(server, { env, logger, backendApi });
  registerGetProductTool(server, { env, logger, backendApi });
  registerListMyOrdersTool(server, { env, logger, backendApi });

  return server;
}

export function buildInstructions(authInfo?: AuthInfo) {
  const role = authInfo?.scopes?.find((scope) => scope.startsWith('role:'))?.replace('role:', '') ?? 'unknown';

  return `SafeTech MCP server. Authenticated role: ${role}.`;
}
