import { Hono } from 'hono';
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import type { AuthInfo } from '@modelcontextprotocol/server';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { logAuditEvent } from './services/audit-log.js';
import type { BackendApiClient } from './services/backend-api.js';
import type { Authenticator, AuthContext } from './types.js';
import type { AppEnv } from './config/env.js';
import type { Logger } from './utils/logger.js';
import { getRequestId } from './utils/request-context.js';
import { AuthError } from './auth/clerk-authenticator.js';

interface AppDependencies {
  env: AppEnv;
  logger: Logger;
  authenticator: Authenticator;
  backendApi: BackendApiClient;
}

export function createApp({ env, logger, authenticator, backendApi }: AppDependencies) {
  const app = new Hono();

  const handler = createMcpHandler(({ authInfo }) =>
    new McpServer({
      name: env.MCP_SERVER_NAME,
      version: env.MCP_SERVER_VERSION,
      description: buildInstructions(authInfo),
    }),
  );

  app.get('/health', async (c) => {
    const requestId = getRequestId(c.req.raw);
    const backend = await backendApi.getHealth(requestId).catch((error) => ({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    }));

    return c.json({
      status: 'ok',
      service: {
        name: env.MCP_SERVER_NAME,
        version: env.MCP_SERVER_VERSION,
      },
      backend,
      timestamp: new Date().toISOString(),
      requestId,
    });
  });

  app.all('/mcp', async (c) => {
    const request = c.req.raw;
    const requestId = getRequestId(request);
    const startedAt = Date.now();

    try {
      const auth = await authenticator.authenticate(request, requestId);
      const response = await handler.fetch(request, { authInfo: toAuthInfo(auth) });

      logAuditEvent(logger, {
        requestId,
        actor: auth.userId,
        role: auth.role,
        action: 'mcp.request',
        outcome: response.ok ? 'success' : 'error',
        durationMs: Date.now() - startedAt,
        errorCode: response.ok ? undefined : `HTTP_${response.status}`,
      });

      return response;
    } catch (error) {
      const authError = normalizeAuthError(error);

      logAuditEvent(logger, {
        requestId,
        actor: 'anonymous',
        role: 'anonymous',
        action: 'mcp.request',
        outcome: 'error',
        durationMs: Date.now() - startedAt,
        errorCode: authError.code,
      });

      return c.json(
        {
          success: false,
          error: {
            code: authError.code,
            message: authError.message,
          },
        },
        authError.status as ContentfulStatusCode,
      );
    }
  });

  return { app, handler };
}

function toAuthInfo(auth: AuthContext): AuthInfo {
  return {
    token: auth.token,
    clientId: auth.userId,
    scopes: ['mcp', `role:${auth.role}`],
    expiresAt: auth.expiresAt,
  };
}

function buildInstructions(authInfo?: AuthInfo) {
  const role = authInfo?.scopes?.find((scope) => scope.startsWith('role:'))?.replace('role:', '') ?? 'unknown';

  return `SafeTech MCP base server. Authenticated role: ${role}. This infrastructure issue does not expose business tools.`;
}

function normalizeAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }

  return new AuthError(
    error instanceof Error ? error.message : 'Unexpected authentication error',
    500,
    'INTERNAL_ERROR',
  );
}
