export type SafeTechRole = 'user' | 'admin';

export interface AuthContext {
  token: string;
  userId: string;
  role: SafeTechRole;
  expiresAt: number;
}

export interface Authenticator {
  authenticate(request: Request, requestId: string): Promise<AuthContext>;
}

export interface BackendHealth {
  status: string;
  timestamp: number;
  dbConnected: boolean;
}
