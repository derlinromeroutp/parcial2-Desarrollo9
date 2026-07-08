import type { OAuthProtectedResourceMetadata } from '@modelcontextprotocol/server';
import type { AppEnv } from '../config/env.js';

export function buildProtectedResourceMetadata(env: AppEnv): OAuthProtectedResourceMetadata {
  const metadata: OAuthProtectedResourceMetadata = {
    resource: env.MCP_PUBLIC_BASE_URL,
    authorization_servers: [env.OAUTH_ISSUER_URL],
    scopes_supported: parseScopes(env.OAUTH_SCOPES),
  };

  if (env.OAUTH_RESOURCE_DOCUMENTATION_URL) {
    metadata.resource_documentation = env.OAUTH_RESOURCE_DOCUMENTATION_URL;
  }

  return metadata;
}

export function buildWwwAuthenticateHeader(env: AppEnv, errorDescription?: string) {
  const parts = [
    `Bearer resource_metadata="${buildProtectedResourceMetadataUrl(env)}"`,
    `scope="${parseScopes(env.OAUTH_SCOPES).join(' ')}"`,
  ];

  if (errorDescription) {
    parts.push(`error="invalid_token"`);
    parts.push(`error_description="${escapeHeaderValue(errorDescription)}"`);
  }

  return parts.join(', ');
}

export function buildProtectedResourceMetadataUrl(env: AppEnv) {
  return new URL('/.well-known/oauth-protected-resource', env.MCP_PUBLIC_BASE_URL).toString();
}

function parseScopes(value: string) {
  return value
    .split(/\s+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
}

function escapeHeaderValue(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
