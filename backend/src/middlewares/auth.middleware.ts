import { createClerkClient } from '@clerk/backend';
import { Context, Next } from 'hono';
import { User } from '../models/User';
import { Technician } from '../models/Technician';
import { getE2EPrincipalFromToken } from '../lib/e2e';

type AuthenticatedRequestContext = {
  userId: string;
  tokenType: 'session_token' | 'oauth_token' | string;
  sessionClaims?: Record<string, unknown>;
};

const getClerkClient = () =>
  createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  });

const authenticateClerkRequest = async (request: Request): Promise<AuthenticatedRequestContext> => {
  const clerk = getClerkClient();
  const authState = await clerk.authenticateRequest(request, {
    acceptsToken: ['session_token', 'oauth_token'],
  });

  if (!authState.isAuthenticated) {
    throw new Error(`Token verification failed: ${authState.reason ?? 'unknown_reason'}`);
  }

  const authObject = authState.toAuth();
  const userId = authObject?.userId;

  if (!userId) {
    throw new Error('Invalid token payload: missing userId');
  }

  return {
    userId,
    tokenType: authState.tokenType,
    sessionClaims:
      authState.tokenType === 'session_token' ? ((authObject.sessionClaims as Record<string, unknown> | undefined) ?? undefined) : undefined,
  };
};

export const clerkAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const e2ePrincipal = getE2EPrincipalFromToken(token);

  if (e2ePrincipal) {
    c.set('userId', e2ePrincipal.userId);
    c.set('authRole', e2ePrincipal.role);
    await next();
    return;
  }

  try {
    const auth = await authenticateClerkRequest(c.req.raw);
    c.set('userId', auth.userId);
    await next();
  } catch (error) {
    console.error('[Auth] Clerk Auth Error:', error);
    return c.json({ error: 'Unauthorized: Token verification failed' }, 401);
  }
};

export const adminAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const e2ePrincipal = getE2EPrincipalFromToken(token);

  if (e2ePrincipal) {
    if (e2ePrincipal.role !== 'admin') {
      return c.json({ error: 'Forbidden: Insufficient privileges' }, 403);
    }

    c.set('userId', e2ePrincipal.userId);
    c.set('authRole', e2ePrincipal.role);
    await next();
    return;
  }
  
  try {
    const auth = await authenticateClerkRequest(c.req.raw);

    // Checking role directly from local MongoDB User document explicitly
    const userDoc = await User.findOne({ clerk_id: auth.userId });
    
    // Check Clerk Metadata directly
    const clerk = getClerkClient();
    const clerkUser = await clerk.users.getUser(auth.userId).catch(() => null);
    
    // Fallback checking to Token custom claims if DB is not matching
    const tokenClaims = auth.sessionClaims as
      | {
          metadata?: { role?: unknown };
          org_role?: unknown;
          role?: unknown;
        }
      | undefined;
    const tokenRole =
      (tokenClaims?.metadata?.role as string | undefined) ||
      (tokenClaims?.org_role as string | undefined) ||
      (tokenClaims?.role as string | undefined);
    const clerkApiRole = clerkUser?.publicMetadata?.role;

    if (userDoc?.role !== 'admin' && tokenRole !== 'admin' && clerkApiRole !== 'admin') {
      return c.json({ error: 'Forbidden: Insufficient privileges' }, 403);
    }

    c.set('userId', auth.userId);
    await next();
  } catch (error) {
    console.error('[Admin Auth] Error:', error);
    return c.json({ error: 'Unauthorized: Token verification failed' }, 401);
  }
};

export const technicianAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }
  const token = authHeader.split(' ')[1];
  const e2ePrincipal = getE2EPrincipalFromToken(token);

  if (e2ePrincipal) {
    if (e2ePrincipal.role !== 'technician') {
      return c.json({ error: 'Forbidden: Not a technician' }, 403);
    }

    const tech = await Technician.findOne({ clerkId: e2ePrincipal.userId });
    if (!tech) {
      return c.json({ error: 'Forbidden: Technician record not linked to this account' }, 403);
    }

    c.set('userId', e2ePrincipal.userId);
    c.set('authRole', e2ePrincipal.role);
    c.set('technicianDocId', (tech._id as any).toString());
    await next();
    return;
  }

  try {
    const auth = await authenticateClerkRequest(c.req.raw);

    const clerk = getClerkClient();
    const clerkUser = await clerk.users.getUser(auth.userId).catch(() => null);
    const role = clerkUser?.publicMetadata?.role;

    if (role !== 'technician') {
      return c.json({ error: 'Forbidden: Not a technician' }, 403);
    }

    const tech = await Technician.findOne({ clerkId: auth.userId });
    if (!tech) {
      return c.json({ error: 'Forbidden: Technician record not linked to this Clerk account' }, 403);
    }

    c.set('userId', auth.userId);
    c.set('technicianDocId', (tech._id as any).toString());
    await next();
  } catch (error) {
    console.error('[Tech Auth] Error:', error);
    return c.json({ error: 'Unauthorized: Token verification failed' }, 401);
  }
};
