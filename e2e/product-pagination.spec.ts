import { expect, test } from '@playwright/test';
import { resetE2EState } from './helpers';

const API_URL = 'http://127.0.0.1:3001/api';
const ADMIN_AUTH = { Authorization: 'Bearer mock:admin:e2e-admin' };

// resetE2EState ya siembra 2 productos (iPhone/celular/A/stock8/$499 y
// MacBook/laptop/A/stock5/$899). Se agregan variantes para tener suficiente
// volumen y poder ejercer paginacion combinada con filtros.
const extraProducts = [
  { name: 'PC Reacondicionada B', description: 'x', price: 300, stock: 0, condition: 'B', category: 'pc' },
  { name: 'Auriculares C baratos', description: 'x', price: 50, stock: 10, condition: 'C', category: 'auriculares' },
  { name: 'Tablet A premium', description: 'x', price: 700, stock: 3, condition: 'A', category: 'tablet' },
];

test.beforeEach(async ({ request }) => {
  await resetE2EState(request);
  for (const product of extraProducts) {
    const response = await request.post(`${API_URL}/products`, { headers: ADMIN_AUTH, data: product });
    expect(response.status()).toBe(201);
  }
});

test('sin page/limit no incluye metadata de paginacion (compatibilidad con el catalogo publico)', async ({ request }) => {
  const response = await request.get(`${API_URL}/products`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data.length).toBe(2 + extraProducts.length);
  expect(body.pagination).toBeUndefined();
});

test('page/limit devuelven pagina, limite y total', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?page=1&limit=2`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data).toHaveLength(2);
  expect(body.pagination).toEqual({ page: 1, limit: 2, total: 5 });
});

test('avanza a la siguiente pagina sin repetir productos', async ({ request }) => {
  const page1 = await (await request.get(`${API_URL}/products?page=1&limit=2`)).json();
  const page2 = await (await request.get(`${API_URL}/products?page=2&limit=2`)).json();

  expect(page1.data).toHaveLength(2);
  expect(page2.data).toHaveLength(2);
  expect(page2.pagination).toEqual({ page: 2, limit: 2, total: 5 });

  const idsPage1 = page1.data.map((p: { _id: string }) => p._id);
  const idsPage2 = page2.data.map((p: { _id: string }) => p._id);
  expect(idsPage1.some((id: string) => idsPage2.includes(id))).toBe(false);
});

test('la ultima pagina puede devolver menos elementos que el limite', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?page=3&limit=2`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data).toHaveLength(1);
  expect(body.pagination).toEqual({ page: 3, limit: 2, total: 5 });
});

test('una pagina fuera de rango devuelve una lista vacia con el total correcto', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?page=10&limit=2`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data).toEqual([]);
  expect(body.pagination).toEqual({ page: 10, limit: 2, total: 5 });
});

test('la paginacion se combina con filtros de busqueda', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?condition=A&page=1&limit=1`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data).toHaveLength(1);
  expect(body.data[0].condition).toBe('A');
  // 3 productos con condition A: iPhone, MacBook, Tablet A premium
  expect(body.pagination).toEqual({ page: 1, limit: 1, total: 3 });
});

test('sin page explicito, usar solo un filtro sigue defaulteando a la pagina 1', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?condition=A`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.pagination.page).toBe(1);
  expect(body.pagination.total).toBe(3);
});

test('rechaza una pagina invalida', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?page=0`);
  expect(response.status()).toBe(400);
});
