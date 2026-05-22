import type { APIRequestContext, Page } from '@playwright/test';

export async function resetE2EState(request: APIRequestContext) {
  const response = await request.post('http://127.0.0.1:3001/api/e2e/reset');
  if (!response.ok()) {
    throw new Error(`Unable to reset e2e state: ${response.status()} ${await response.text()}`);
  }
}

export async function signInAs(page: Page, role: 'user' | 'admin') {
  await page.goto('/login');

  if (role === 'admin') {
    await page.getByTestId('mock-signin-admin').click();
    return;
  }

  await page.getByTestId('mock-signin-user').click();
}
