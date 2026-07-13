import { expect, test } from '@playwright/test';
import { resetE2EState, signInAs } from './helpers';

const API_URL = 'http://127.0.0.1:3001/api';
const USER_AUTH = { Authorization: 'Bearer mock:user:e2e-user' };

test.beforeEach(async ({ request }) => {
  await resetE2EState(request);
});

test('a shopper files a warranty claim on a fresh purchase and sees it listed as pending', async ({ page }) => {
  await signInAs(page, 'user');
  await page.goto('/home');

  await page.getByRole('button', { name: 'Añadir al carrito' }).first().click();
  await page.getByRole('button', { name: 'Ir a pagar' }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByTestId('test-payment-button').click();
  await expect(page).toHaveURL(/\/success\?payment_intent=e2e_pi_/);

  await page.goto('/orders');
  const newOrderCard = page.locator('.oc-card').first();
  await newOrderCard.click();
  await newOrderCard.getByText('Registrar garantía →').click();

  await expect(page).toHaveURL(/\/warranties\/new\?orderId=/);
  await expect(page.getByRole('heading', { name: 'Reportar garantía' })).toBeVisible();

  await page.getByRole('combobox').selectOption('Falla de fábrica');
  await page.getByRole('button', { name: 'Continuar' }).click();

  await page
    .getByPlaceholder('Describe detalladamente qué sucede con el producto...')
    .fill('El producto llego con la pantalla rota desde la caja original.');
  await page.getByRole('button', { name: 'Continuar' }).click();

  await page.getByRole('button', { name: 'Enviar ticket' }).click();

  await expect(page).toHaveURL(/\/warranties\/success$/);
  await expect(page.getByRole('heading', { name: 'Ticket creado' })).toBeVisible();

  await page.goto('/mis-garantias');
  await expect(page.getByRole('heading', { name: /garantías/i })).toBeVisible();

  // The seeded account already has one pre-existing warranty claim (from
  // resetE2EState), so scope the assertion to the card for the claim just
  // filed instead of asserting "Pendiente" globally.
  const newClaimCard = page
    .locator('.wc-card')
    .filter({ hasText: 'El producto llego con la pantalla rota desde la caja original.' });
  await expect(newClaimCard).toBeVisible();
  await expect(newClaimCard.getByText('Pendiente')).toBeVisible();
});

test('an account with no warranty claims sees the empty state on mis-garantias', async ({ page }) => {
  // The seeded warranty belongs to e2e-user, so e2e-admin has none of its own.
  await signInAs(page, 'admin');
  await page.goto('/mis-garantias');
  await expect(page.getByRole('heading', { name: 'No tienes garantías registradas' })).toBeVisible();
});

test('rejects a second warranty claim for an order that already has one', async ({ request }) => {
  const ordersRes = await request.get(`${API_URL}/orders/mine`, { headers: USER_AUTH });
  const orders = await ordersRes.json();
  const seededOrderId = orders[0]._id as string;

  const response = await request.post(`${API_URL}/warranties`, {
    headers: USER_AUTH,
    data: {
      orderId: seededOrderId,
      reason: 'Falla de fábrica',
      description: 'Otro intento de reclamo sobre la misma orden ya reportada.',
    },
  });

  expect(response.status()).toBe(409);
});

test('rejects a warranty claim for an order that does not belong to the caller', async ({ request }) => {
  const ordersRes = await request.get(`${API_URL}/orders/mine`, { headers: USER_AUTH });
  const orders = await ordersRes.json();
  const seededOrderId = orders[0]._id as string;

  const response = await request.post(`${API_URL}/warranties`, {
    headers: { Authorization: 'Bearer mock:admin:e2e-admin' },
    data: {
      orderId: seededOrderId,
      reason: 'Falla de fábrica',
      description: 'Reclamo intentado por un usuario que no es el dueno de la orden.',
    },
  });

  expect(response.status()).toBe(403);
});
