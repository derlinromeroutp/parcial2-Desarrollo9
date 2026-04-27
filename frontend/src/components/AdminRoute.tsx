import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

interface MeResponse {
  isAdmin: boolean;
  isTechnician: boolean;
  role: string;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { isLoaded, getToken } = useAuth();
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!isLoaded) return;

      try {
        const token = await getToken();
        if (!token) {
          setVerified(false);
          return;
        }

        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data: MeResponse = await response.json();
          setVerified(data.isAdmin);
        } else {
          setVerified(false);
        }
      } catch (error) {
        console.error('[AdminRoute] Verification error:', error);
        setVerified(false);
      }
    };

    verifyAdmin();
  }, [isLoaded, getToken]);

  if (isLoaded && verified === null) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center">
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-bounce font-black uppercase italic">
          Verificando acceso...
        </div>
      </div>
    );
  }

  if (isLoaded && verified === false) {
    return <Navigate to="/home" replace />;
  }

  if (!isLoaded || verified !== true) {
    return null;
  }

  return <>{children}</>;
}

export function ProtectedTechnicianRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, getToken } = useAuth();
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const verify = async () => {
      if (!isLoaded) return;
      try {
        const token = await getToken();
        if (!token) { setVerified(false); return; }
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data: MeResponse = await response.json();
          setVerified(data.isTechnician);
        } else {
          setVerified(false);
        }
      } catch {
        setVerified(false);
      }
    };
    verify();
  }, [isLoaded, getToken]);

  if (isLoaded && verified === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--gray)' }}>Verificando acceso…</p>
      </div>
    );
  }
  if (isLoaded && verified === false) return <Navigate to="/home" replace />;
  if (!isLoaded || verified !== true) return null;
  return <>{children}</>;
}

export function useAdminCheck() {
  const { isLoaded, getToken } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isLoaded) return;

      try {
        const token = await getToken();
        if (!token) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data: MeResponse = await response.json();
          setIsAdmin(data.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [isLoaded, getToken]);

  return { isAdmin, loading, isLoaded };
}