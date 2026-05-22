import { expect, test } from '@playwright/test';
import { resetE2EState, signInAs } from './helpers';

test.beforeEach(async ({ request }) => {
  await resetE2EState(request);
});

test('completes a checkout in e2e mode', async ({ page }) => {
  await signInAs(page, 'user');
  await page.goto('/home');

  await page.getByRole('button', { name: 'Añadir al carrito' }).first().click();
  await page.getByRole('button', { name: 'Ir a pagar' }).click();

  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByTestId('test-payment-button').click();

  await expect(page).toHaveURL(/\/success\?payment_intent=e2e_pi_/);
  await expect(page.getByText(/Pago confirmado|Orden confirmada|Compra completada/i)).toBeVisible();
});
