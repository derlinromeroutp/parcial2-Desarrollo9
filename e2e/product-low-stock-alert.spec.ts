import { expect, test } from '@playwright/test';
import { resetE2EState } from './helpers';

const API_URL = 'http://127.0.0.1:3001/api';
const ADMIN_AUTH = { Authorization: 'Bearer mock:admin:e2e-admin' };
const USER_AUTH = { Authorization: 'Bearer mock:user:e2e-user' };

// resetE2EState siembra 2 productos con stock 8 y 5 (por encima del umbral por
// defecto de 5... el de stock 5 queda justo en el limite). Se agregan mas
// variantes para poder discriminar bien que cruza el umbral y que no.
const extraProducts = [
  { name: 'Producto sin stock', description: 'x', price: 100, stock: 0, condition: 'B', category: 'pc' },
  { name: 'Producto stock bajo', description: 'x', price: 80, stock: 3, condition: 'C', category: 'auriculares' },
  { name: 'Producto stock alto', description: 'x', price: 200, stock: 50, condition: 'A', category: 'tablet' },
];

test.beforeEach(async ({ request }) => {
  await resetE2EState(request);
  for (const product of extraProducts) {
    const response = await request.post(`${API_URL}/products`, { headers: ADMIN_AUTH, data: product });
    expect(response.status()).toBe(201);
  }
});

test('rechaza la consulta de stock bajo si el llamador no es admin', async ({ request }) => {
  const response = await request.get(`${API_URL}/products/low-stock`, { headers: USER_AUTH });
  expect(response.status()).toBe(403);
});

test('devuelve solo los productos con stock igual o por debajo del umbral por defecto', async ({ request }) => {
  const response = await request.get(`${API_URL}/products/low-stock`, { headers: ADMIN_AUTH });
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.threshold).toBe(5);

  const names = body.data.map((p: { name: string }) => p.name).sort();
  // stock: iPhone=8 (no), MacBook=5 (si, <=5), sin stock=0 (si), stock bajo=3 (si), stock alto=50 (no)
  expect(names).toEqual(
    ['MacBook Air M1 Refurbished', 'Producto sin stock', 'Producto stock bajo'].sort()
  );
  expect(body.data.every((p: { stock: number }) => p.stock <= 5)).toBe(true);
});

test('respeta un umbral personalizado', async ({ request }) => {
  const response = await request.get(`${API_URL}/products/low-stock?threshold=1`, { headers: ADMIN_AUTH });
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.threshold).toBe(1);
  expect(body.data).toHaveLength(1);
  expect(body.data[0].name).toBe('Producto sin stock');
});

test('rechaza un umbral invalido', async ({ request }) => {
  const response = await request.get(`${API_URL}/products/low-stock?threshold=-1`, { headers: ADMIN_AUTH });
  expect(response.status()).toBe(400);
});
