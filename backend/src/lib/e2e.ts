export type E2ERole = 'user' | 'admin' | 'technician';

export interface E2EPrincipal {
  role: E2ERole;
  userId: string;
}

export const isE2ETestMode = process.env.E2E_TEST_MODE === 'true';

export function getE2EPrincipalFromToken(token: string | undefined): E2EPrincipal | null {
  if (!isE2ETestMode || !token) return null;

  const match = token.match(/^mock:(user|admin|technician):(e2e-[a-z-]+)$/);
  if (!match) return null;

  return {
    role: match[1] as E2ERole,
    userId: match[2],
  };
}

export function isE2EPaymentIntent(paymentIntentId: string | undefined): boolean {
  return Boolean(paymentIntentId && paymentIntentId.startsWith('e2e_pi_'));
}
