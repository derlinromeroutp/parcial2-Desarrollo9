import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  workers: 1,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:4174',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'bun run src/index.ts',
      cwd: 'backend',
      url: 'http://127.0.0.1:3001/api/health',
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        PORT: '3001',
        MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/safetech',
        E2E_TEST_MODE: 'true',
      },
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 4174',
      cwd: 'frontend',
      url: 'http://127.0.0.1:4174',
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        VITE_API_URL: 'http://127.0.0.1:3001/api',
        VITE_BACKEND_URL: 'http://127.0.0.1:3001',
        VITE_E2E_TEST_MODE: 'true',
      },
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
