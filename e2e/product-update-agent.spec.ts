import { expect, test } from '@playwright/test';
import { resetE2EState } from './helpers';

const API_URL = 'http://127.0.0.1:3001/api';
const ADMIN_AUTH = { Authorization: 'Bearer mock:admin:e2e-admin' };
const USER_AUTH = { Authorization: 'Bearer mock:user:e2e-user' };

const validProductBody = {
  name: 'Producto para actualizar por agente IA',
  description: 'Producto de prueba para HU-27 (update_product)',
  price: 300,
  stock: 5,
  condition: 'B',
  category: 'tablet',
};

test.beforeEach(async ({ request }) => {
  await resetE2EState(request);
});

test('aplica un cambio parcial y preserva los campos no enviados', async ({ request }) => {
  const createResponse = await request.post(`${API_URL}/products`, {
    headers: ADMIN_AUTH,
    data: validProductBody,
  });
  expect(createResponse.status()).toBe(201);
  const { data: created } = await createResponse.json();

  const updateResponse = await request.put(`${API_URL}/products/${created._id}`, {
    headers: ADMIN_AUTH,
    data: { price: 350 },
  });
  expect(updateResponse.status()).toBe(200);

  const body = await updateResponse.json();
  expect(body.data.price).toBe(350);
  // Los campos no enviados en el payload parcial deben preservarse tal cual.
  expect(body.data.stock).toBe(validProductBody.stock);
  expect(body.data.category).toBe(validProductBody.category);
  expect(body.data.condition).toBe(validProductBody.condition);
  expect(body.data.name).toBe(validProductBody.name);
});

test('rechaza un payload de actualizacion con categoria invalida', async ({ request }) => {
  const response = await request.put(`${API_URL}/products/000000000000000000000000`, {
    headers: ADMIN_AUTH,
    data: { category: 'electrodomesticos' },
  });
  expect(response.status()).toBe(400);
});

test('rechaza un payload de actualizacion con condicion invalida', async ({ request }) => {
  const response = await request.put(`${API_URL}/products/000000000000000000000000`, {
    headers: ADMIN_AUTH,
    data: { condition: 'Z' },
  });
  expect(response.status()).toBe(400);
});

test('rechaza un payload de actualizacion con precio negativo', async ({ request }) => {
  const response = await request.put(`${API_URL}/products/000000000000000000000000`, {
    headers: ADMIN_AUTH,
    data: { price: -5 },
  });
  expect(response.status()).toBe(400);
});

test('rechaza la actualizacion si el agente no tiene rol admin', async ({ request }) => {
  const response = await request.put(`${API_URL}/products/000000000000000000000000`, {
    headers: USER_AUTH,
    data: { price: 400 },
  });
  expect(response.status()).toBe(403);
});
