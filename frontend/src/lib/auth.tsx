import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ClerkProvider as RealClerkProvider,
  SignIn as RealSignIn,
  SignInButton as RealSignInButton,
  SignedIn as RealSignedIn,
  SignedOut as RealSignedOut,
  SignUp as RealSignUp,
  UserButton as RealUserButton,
  useAuth as useRealAuth,
  useUser as useRealUser,
} from '@clerk/clerk-react';

type MockRole = 'user' | 'admin' | 'technician';

interface MockSession {
  userId: string;
  role: MockRole;
  email: string;
  fullName: string;
}

interface MockAuthContextValue {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  session: MockSession | null;
  getToken: () => Promise<string | null>;
  signInAs: (role: MockRole) => void;
  signOut: () => void;
}

const MOCK_AUTH_STORAGE_KEY = 'safetech-e2e-session';

const mockUsers: Record<MockRole, MockSession> = {
  user: {
    userId: 'e2e-user',
    role: 'user',
    email: 'shopper@safetech.test',
    fullName: 'Cliente Demo',
  },
  admin: {
    userId: 'e2e-admin',
    role: 'admin',
    email: 'admin@safetech.test',
    fullName: 'Admin Demo',
  },
  technician: {
    userId: 'e2e-technician',
    role: 'technician',
    email: 'tech@safetech.test',
    fullName: 'Tecnico Demo',
  },
};

const MockAuthContext = createContext<MockAuthContextValue | null>(null);

export const isMockAuthEnabled = import.meta.env.VITE_E2E_TEST_MODE === 'true';

function readStoredSession(): MockSession | null {
  if (typeof window === 'undefined') return null;

  const rawValue = window.localStorage.getItem(MOCK_AUTH_STORAGE_KEY);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as MockSession;
  } catch {
    window.localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
    return null;
  }
}

function MockClerkProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<MockSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSession(readStoredSession());
    setIsLoaded(true);
  }, []);

  const value = useMemo<MockAuthContextValue>(() => ({
    isLoaded,
    isSignedIn: Boolean(session),
    userId: session?.userId ?? null,
    session,
    getToken: async () => (session ? `mock:${session.role}:${session.userId}` : null),
    signInAs: (role: MockRole) => {
      const nextSession = mockUsers[role];
      window.localStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
    },
    signOut: () => {
      window.localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
      setSession(null);
    },
  }), [isLoaded, session]);

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
}

function useMockAuthContext() {
  const value = useContext(MockAuthContext);
  if (!value) {
    throw new Error('Mock auth context is not available. Wrap the app with ClerkProvider.');
  }
  return value;
}

function MockAuthCard({
  title,
  description,
  primaryRole = 'user',
}: {
  title: string;
  description: string;
  primaryRole?: MockRole;
}) {
  const { signInAs } = useMockAuthContext();

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 420,
        background: 'white',
        border: '1px solid var(--line)',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 24px 60px rgba(0,0,0,0.08)',
      }}
    >
      <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray)' }}>
        Modo de prueba
      </p>
      <h1 style={{ margin: '0.75rem 0 0.5rem', fontFamily: 'var(--font-display)', fontSize: '2rem', lineHeight: 1.05 }}>
        {title}
      </h1>
      <p style={{ margin: '0 0 1.5rem', color: 'var(--ink2)', lineHeight: 1.6 }}>
        {description}
      </p>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <button className="btn-primary" type="button" onClick={() => signInAs(primaryRole)} data-testid="mock-signin-primary">
          {primaryRole === 'admin' ? 'Entrar como admin' : primaryRole === 'technician' ? 'Entrar como tecnico' : 'Entrar como cliente'}
        </button>
        <button className="btn-outline" type="button" onClick={() => signInAs('admin')} data-testid="mock-signin-admin">
          Entrar como admin
        </button>
        <button className="btn-outline" type="button" onClick={() => signInAs('user')} data-testid="mock-signin-user">
          Entrar como cliente
        </button>
      </div>
    </div>
  );
}

export function ClerkProvider(props: React.ComponentProps<typeof RealClerkProvider>) {
  if (isMockAuthEnabled) {
    return <MockClerkProvider>{props.children}</MockClerkProvider>;
  }

  return <RealClerkProvider {...props} />;
}

export function useAuth() {
  if (isMockAuthEnabled) {
    const { isLoaded, isSignedIn, userId, getToken, signOut } = useMockAuthContext();
    return { isLoaded, isSignedIn, userId, getToken, signOut };
  }

  return useRealAuth();
}

export function useUser() {
  if (isMockAuthEnabled) {
    const { isLoaded, session } = useMockAuthContext();
    return {
      isLoaded,
      isSignedIn: Boolean(session),
      user: session
        ? {
            id: session.userId,
            fullName: session.fullName,
            primaryEmailAddress: { emailAddress: session.email },
            publicMetadata: { role: session.role },
          }
        : null,
    };
  }

  return useRealUser();
}

export function SignedIn({ children }: { children: React.ReactNode }) {
  if (isMockAuthEnabled) {
    const { isSignedIn } = useMockAuthContext();
    return isSignedIn ? <>{children}</> : null;
  }

  return <RealSignedIn>{children}</RealSignedIn>;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  if (isMockAuthEnabled) {
    const { isSignedIn } = useMockAuthContext();
    return !isSignedIn ? <>{children}</> : null;
  }

  return <RealSignedOut>{children}</RealSignedOut>;
}

export function SignInButton({
  children,
  mode,
}: {
  children: React.ReactElement<{ onClick?: (event: React.MouseEvent) => void }>;
  mode?: string;
}) {
  if (isMockAuthEnabled) {
    const { signInAs } = useMockAuthContext();
    if (!React.isValidElement(children)) return children;

    return React.cloneElement(children, {
      onClick: (event: React.MouseEvent) => {
        children.props.onClick?.(event);
        if (!event.defaultPrevented) {
          signInAs('user');
        }
      },
    });
  }

  return <RealSignInButton mode={mode as 'modal' | 'redirect' | undefined}>{children}</RealSignInButton>;
}

export function UserButton({ afterSignOutUrl }: { afterSignOutUrl?: string }) {
  if (isMockAuthEnabled) {
    const { session, signOut } = useMockAuthContext();

    return (
      <button
        type="button"
        className="btn-outline"
        onClick={() => {
          signOut();
          if (afterSignOutUrl) {
            window.location.href = afterSignOutUrl;
          }
        }}
        aria-label="Cerrar sesion"
      >
        {session?.fullName ?? 'Salir'}
      </button>
    );
  }

  return <RealUserButton afterSignOutUrl={afterSignOutUrl} />;
}

export function SignIn(props: React.ComponentProps<typeof RealSignIn>) {
  if (isMockAuthEnabled) {
    return (
      <MockAuthCard
        title="Accede a SafeTech"
        description="Este entorno usa autenticacion simulada para validar los flujos criticos sin depender de Clerk."
      />
    );
  }

  return <RealSignIn {...props} />;
}

export function SignUp(props: React.ComponentProps<typeof RealSignUp>) {
  if (isMockAuthEnabled) {
    return (
      <MockAuthCard
        title="Crear cuenta de prueba"
        description="Para la suite e2e reutilizamos cuentas demo controladas y asi los escenarios son deterministas."
      />
    );
  }

  return <RealSignUp {...props} />;
}
