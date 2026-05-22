import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClerkProvider, isMockAuthEnabled, useAuth, useUser } from '../lib/auth';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const ROUTES = {
  ADMIN: '/admin',
  TECHNICIAN: '/technician',
  HOME: '/home',
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;
const AUTH_ONLY_ROUTES = ['/', '/login', '/register'];

function AuthRedirectHandler({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectAttempted = useRef(false);

  const getRoleFromClerk = useCallback((): string => {
    const metadata = user?.publicMetadata as Record<string, unknown> | undefined;
    return (metadata?.role as string) || 'user';
  }, [user]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      redirectAttempted.current = false;
      return;
    }
    if (!user) return;
    if (redirectAttempted.current) return;
    if (!AUTH_ONLY_ROUTES.includes(location.pathname)) return;

    redirectAttempted.current = true;
    const role = getRoleFromClerk();
    const targetRoute =
      role === 'admin' ? ROUTES.ADMIN :
      role === 'technician' ? ROUTES.TECHNICIAN :
      ROUTES.HOME;

    navigate(targetRoute, { replace: true });
  }, [getRoleFromClerk, isLoaded, isSignedIn, location.pathname, navigate, user]);

  return <>{children}</>;
}

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  if (isMockAuthEnabled) {
    return (
      <ClerkProvider publishableKey="mock-publishable-key">
        <AuthRedirectHandler>{children}</AuthRedirectHandler>
      </ClerkProvider>
    );
  }

  if (!PUBLISHABLE_KEY) {
    throw new Error('Missing Publishable Key: No se encontro VITE_CLERK_PUBLISHABLE_KEY en el archivo de entorno.');
  }

  if (/^pk_(test|live)_51/.test(PUBLISHABLE_KEY)) {
    throw new Error(
      'VITE_CLERK_PUBLISHABLE_KEY parece ser una key de Stripe. Usa la key de Clerk en esta variable y la de Stripe en VITE_STRIPE_PUBLISHABLE_KEY.',
    );
  }

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => {
        window.location.href = to;
      }}
      routerReplace={(to) => {
        window.location.href = to;
      }}
    >
      <AuthRedirectHandler>{children}</AuthRedirectHandler>
    </ClerkProvider>
  );
}
