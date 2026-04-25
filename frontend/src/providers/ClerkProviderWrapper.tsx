import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-react';
import React, { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key: No se encontró VITE_CLERK_PUBLISHABLE_KEY en el archivo de entorno.");
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const ROUTES = {
  ADMIN: '/admin',
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

  const getRoleFromClerk = useCallback((): boolean => {
    // Get role from Clerk user publicMetadata
    const metadata = user?.publicMetadata as Record<string, unknown> | undefined;
    const role = metadata?.role as string | undefined;
    
    return role === 'admin';
  }, [user]);

  const redirectByRole = useCallback(async () => {
    if (redirectAttempted.current) return;
    redirectAttempted.current = true;

    // Wait for user to be loaded
    if (!user) {
      console.log('[AuthRedirect] Waiting for user to load...');
      setTimeout(() => redirectByRole(), 500);
      return;
    }

    const isAdmin = getRoleFromClerk();
    const targetRoute = isAdmin ? ROUTES.ADMIN : ROUTES.HOME;
    
  
    
    navigate(targetRoute, { replace: true });
  }, [user, getRoleFromClerk, navigate]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }


    // Trigger redirect when user signs in
    if (isSignedIn && !redirectAttempted.current) {
    
      redirectByRole();
    }
  }, [isLoaded, isSignedIn, redirectByRole, location.pathname]);

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
