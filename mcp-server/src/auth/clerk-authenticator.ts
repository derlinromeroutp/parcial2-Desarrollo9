import { createClerkClient, verifyToken } from '@clerk/backend';
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
  constructor(
    private readonly clerkSecretKey: string,
    private readonly logger: Logger,
  ) {}

  async authenticate(request: Request, requestId: string): Promise<AuthContext> {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthError('Missing bearer token', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.slice('Bearer '.length);
    const payload = await verifyToken(token, { secretKey: this.clerkSecretKey }).catch((error) => {
      this.logger.warn('auth.verify_failed', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new AuthError('Token verification failed', 401, 'UNAUTHORIZED');
    });

    if (!payload.sub) {
      throw new AuthError('Invalid token payload', 401, 'UNAUTHORIZED');
    }

    const role = await this.resolveRole(payload.sub, payload, requestId);
    const expiresAt = payload.exp ?? Math.floor(Date.now() / 1000) + 300;

    return {
      token,
      userId: payload.sub,
      role,
      expiresAt,
    };
  }

  private async resolveRole(
    userId: string,
    payload: Record<string, unknown>,
    requestId: string,
  ): Promise<SafeTechRole> {
    const tokenRole = normalizeRole(
      (payload.metadata as { role?: unknown } | undefined)?.role ??
        payload.role ??
        payload.org_role,
    );

    const clerk = createClerkClient({ secretKey: this.clerkSecretKey });
    const clerkUser = await clerk.users.getUser(userId).catch((error) => {
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
