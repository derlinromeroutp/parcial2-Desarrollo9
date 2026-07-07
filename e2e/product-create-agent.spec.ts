import { expect, test } from '@playwright/test';
import { resetE2EState } from './helpers';

const API_URL = 'http://127.0.0.1:3001/api';
const ADMIN_AUTH = { Authorization: 'Bearer mock:admin:e2e-admin' };
const USER_AUTH = { Authorization: 'Bearer mock:user:e2e-user' };

const validProductBody = {
  name: 'Producto creado por agente IA',
  description: 'Producto de prueba para HU-26 (create_product)',
  price: 250,
  stock: 3,
  condition: 'B',
  category: 'auriculares',
};

test.beforeEach(async ({ request }) => {
  await resetE2EState(request);
});

test('crea un producto valido y devuelve su identificador', async ({ request }) => {
  const response = await request.post(`${API_URL}/products`, {
    headers: ADMIN_AUTH,
    data: validProductBody,
  });
  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body.success).toBe(true);
  expect(body.data._id).toBeTruthy();
  expect(body.data.name).toBe(validProductBody.name);
});

test('rechaza una categoria invalida', async ({ request }) => {
  const response = await request.post(`${API_URL}/products`, {
    headers: ADMIN_AUTH,
    data: { ...validProductBody, category: 'electrodomesticos' },
  });
  expect(response.status()).toBe(400);
});

test('rechaza una condicion invalida', async ({ request }) => {
  const response = await request.post(`${API_URL}/products`, {
    headers: ADMIN_AUTH,
    data: { ...validProductBody, condition: 'Z' },
  });
  expect(response.status()).toBe(400);
});

test('rechaza un precio negativo', async ({ request }) => {
  const response = await request.post(`${API_URL}/products`, {
    headers: ADMIN_AUTH,
    data: { ...validProductBody, price: -10 },
  });
  expect(response.status()).toBe(400);
});

test('rechaza un stock negativo', async ({ request }) => {
  const response = await request.post(`${API_URL}/products`, {
    headers: ADMIN_AUTH,
    data: { ...validProductBody, stock: -1 },
  });
  expect(response.status()).toBe(400);
});

test('rechaza la creacion si el agente no tiene rol admin', async ({ request }) => {
  const response = await request.post(`${API_URL}/products`, {
    headers: USER_AUTH,
    data: validProductBody,
  });
  expect(response.status()).toBe(403);
});
