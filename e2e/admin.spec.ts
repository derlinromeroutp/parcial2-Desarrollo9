import { expect, test } from '@playwright/test';
import { resetE2EState, signInAs } from './helpers';

test.beforeEach(async ({ request }) => {
  await resetE2EState(request);
});

test('shows seeded orders and warranties in the admin dashboard', async ({ page }) => {
  await signInAs(page, 'admin');

  await expect(page.getByRole('heading', { name: 'Resumen general' })).toBeVisible();

  await page.getByRole('button', { name: 'Órdenes' }).click();
  await expect(page.getByText('shopper@safetech.test')).toBeVisible();
  await expect(page.getByText('$499.00')).toBeVisible();

  await page.getByRole('button', { name: 'Garantías' }).click();
  await expect(page.getByText('La bateria pierde carga mas rapido de lo esperado.')).toBeVisible();
  await expect(page.locator('td', { hasText: 'Tecnico Demo' }).first()).toBeVisible();
});
