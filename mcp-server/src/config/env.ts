import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3100),
  HOST: z.string().default('0.0.0.0'),
  MCP_SERVER_NAME: z.string().default('SafeTech MCP Server'),
  MCP_SERVER_VERSION: z.string().default('0.1.0'),
  MCP_PUBLIC_BASE_URL: z.string().url().default('http://localhost:3100'),
  BACKEND_API_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(1),
  OAUTH_ISSUER_URL: z.string().url().default('https://clever-gator-13.clerk.accounts.dev'),
  OAUTH_SCOPES: z.string().default('openid profile email offline_access'),
  OAUTH_RESOURCE_DOCUMENTATION_URL: z.string().url().optional(),
  MCP_STDIO_USER_ID: z.string().default('local_stdio_user'),
  MCP_STDIO_ROLE: z.enum(['user', 'admin']).default('admin'),
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  return envSchema.parse(source);
}
