import { expect, test } from '@playwright/test';
import { resetE2EState, signInAs } from './helpers';

test.beforeEach(async ({ request }) => {
  await resetE2EState(request);
});

test('a signed-in shopper sees their order history with item detail', async ({ page }) => {
  await signInAs(page, 'user');
  await page.goto('/orders');

  await expect(page.getByRole('heading', { name: /pedidos/i })).toBeVisible();
  await expect(page.getByText('Pagado')).toBeVisible();
  const orderHeadline = page.getByRole('heading', { name: 'iPhone 13 Reacondicionado' });
  await expect(orderHeadline).toBeVisible();

  await orderHeadline.click();

  await expect(page.getByText('Artículos del pedido')).toBeVisible();
  await expect(page.getByText(/Cantidad: 1/)).toBeVisible();
  await expect(page.getByText('Registrar garantía →')).toBeVisible();
});

test('redirects a signed-out visitor to the sign-in prompt instead of showing order history', async ({ page }) => {
  await page.goto('/orders');
  await expect(page.getByRole('heading', { name: 'Debes iniciar sesión para ver tus pedidos' })).toBeVisible();
});
