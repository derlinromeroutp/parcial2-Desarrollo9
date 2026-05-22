import { expect, test } from '@playwright/test';
import { resetE2EState, signInAs } from './helpers';

test.beforeEach(async ({ request }) => {
  await resetE2EState(request);
});

test('redirects a shopper to the catalog after sign in', async ({ page }) => {
  await signInAs(page, 'user');

  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole('heading', { name: 'Catálogo' })).toBeVisible();
});

test('redirects an admin to the dashboard after sign in', async ({ page }) => {
  await signInAs(page, 'admin');

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Resumen general' })).toBeVisible();
});
