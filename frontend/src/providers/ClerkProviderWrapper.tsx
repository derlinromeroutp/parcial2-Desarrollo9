import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-react';
import React, { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key: No se encontró VITE_CLERK_PUBLISHABLE_KEY en el archivo de entorno.");
}

if (/^pk_(test|live)_51/.test(PUBLISHABLE_KEY)) {
  throw new Error(
    "VITE_CLERK_PUBLISHABLE_KEY parece ser una key de Stripe. Usa la key de Clerk en esta variable y la de Stripe en VITE_STRIPE_PUBLISHABLE_KEY.",
  );
}

const ROUTES = {
  ADMIN: '/admin',
  TECHNICIAN: '/technician',
  HOME: '/home',
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;

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

  const redirectByRole = useCallback(async () => {
    if (redirectAttempted.current) return;
    redirectAttempted.current = true;

    if (!user) {
      console.log('[AuthRedirect] Waiting for user to load...');
      setTimeout(() => redirectByRole(), 500);
      return;
    }

    const role = getRoleFromClerk();
    const targetRoute =
      role === 'admin' ? ROUTES.ADMIN :
      role === 'technician' ? ROUTES.TECHNICIAN :
      ROUTES.HOME;

    navigate(targetRoute, { replace: true });
  }, [user, getRoleFromClerk, navigate]);

  const AUTH_ONLY_ROUTES = ['/', '/login', '/register'];

  useEffect(() => {
    if (!isLoaded) return;

    // Solo redirigir desde páginas de auth, no desde cualquier ruta
    if (isSignedIn && !redirectAttempted.current && AUTH_ONLY_ROUTES.includes(location.pathname)) {
      redirectByRole();
    }
  }, [isLoaded, isSignedIn, location.pathname]);

  return <>{children}</>;
}

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
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
