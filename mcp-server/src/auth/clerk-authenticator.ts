import { createClerkClient } from '@clerk/backend';
import type { Authenticator, AuthContext, SafeTechRole } from '../types.js';
import type { Logger } from '../utils/logger.js';

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
  }
}

export class ClerkAuthenticator implements Authenticator {
  private readonly clerk;

  constructor(
    private readonly clerkSecretKey: string,
    clerkPublishableKey: string,
    private readonly logger: Logger,
  ) {
    this.clerk = createClerkClient({
      secretKey: this.clerkSecretKey,
      publishableKey: clerkPublishableKey,
    });
  }

  async authenticate(request: Request, requestId: string): Promise<AuthContext> {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthError('Missing bearer token', 401, 'UNAUTHORIZED');
    }

    const authState = await this.clerk.authenticateRequest(request, {
      acceptsToken: ['session_token', 'oauth_token'],
    }).catch((error) => {
      this.logger.warn('auth.verify_failed', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new AuthError('Token verification failed', 401, 'UNAUTHORIZED');
    });

    if (!authState.isAuthenticated) {
      this.logger.warn('auth.verify_failed', {
        requestId,
        error: authState.message,
        reason: authState.reason,
        tokenType: authState.tokenType,
      });

      throw new AuthError('Token verification failed', 401, 'UNAUTHORIZED');
    }

    const authObject = authState.toAuth();
    const token = await authObject.getToken();
    const userId = extractUserId(authObject);

    if (!userId || !token) {
      throw new AuthError('Invalid token payload', 401, 'UNAUTHORIZED');
    }

    const role = await this.resolveRole(userId, authObject, requestId);
    const expiresAt = extractExpiry(authObject);

    return {
      token,
      userId,
      role,
      expiresAt,
    };
  }

  private async resolveRole(
    userId: string,
    authObject: Record<string, unknown>,
    requestId: string,
  ): Promise<SafeTechRole> {
    const tokenRole = normalizeRole(
      (authObject.sessionClaims as { metadata?: { role?: unknown } } | undefined)?.metadata?.role ??
        authObject.orgRole ??
        authObject.org_role ??
        authObject.role,
    );

    const clerkUser = await this.clerk.users.getUser(userId).catch((error) => {
      this.logger.warn('auth.clerk_role_lookup_failed', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });

      return null;
    });

    const clerkRole = normalizeRole((clerkUser?.publicMetadata as { role?: unknown } | undefined)?.role);

    return clerkRole ?? tokenRole ?? 'user';
  }
}

function normalizeRole(value: unknown): SafeTechRole | null {
  if (value === 'admin') {
    return 'admin';
  }

  if (value === 'user') {
    return 'user';
  }

  return null;
}

function extractUserId(authObject: Record<string, unknown>) {
  const userId = authObject.userId;

  if (typeof userId === 'string' && userId.length > 0) {
    return userId;
  }

  return null;
}

function extractExpiry(authObject: Record<string, unknown>) {
  const sessionClaims = authObject.sessionClaims as { exp?: unknown } | undefined;
  if (typeof sessionClaims?.exp === 'number') {
    return sessionClaims.exp;
  }

  return Math.floor(Date.now() / 1000) + 300;
}
