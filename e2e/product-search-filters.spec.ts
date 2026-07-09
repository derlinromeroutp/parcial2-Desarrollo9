import { expect, test } from '@playwright/test';
import { resetE2EState } from './helpers';

const API_URL = 'http://127.0.0.1:3001/api';
const ADMIN_AUTH = { Authorization: 'Bearer mock:admin:e2e-admin' };

// resetE2EState ya siembra 2 productos (iPhone/celular/A/stock8/$499 y
// MacBook/laptop/A/stock5/$899). Se agregan variantes para poder ejercer
// condition, disponibilidad y rango de precio con datos que realmente
// discriminen entre si.
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

test('sin filtros devuelve el catalogo completo, sin acotar (compatibilidad con el catalogo publico)', async ({ request }) => {
  const response = await request.get(`${API_URL}/products`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data.length).toBe(2 + extraProducts.length);
});

test('filtra por categoria', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?category=pc`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data).toHaveLength(1);
  expect(body.data[0].name).toBe('PC Reacondicionada B');
});

test('filtra por condicion', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?condition=C`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data).toHaveLength(1);
  expect(body.data[0].name).toBe('Auriculares C baratos');
});

test('filtra por rango de precio', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?minPrice=400&maxPrice=750`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  const names = body.data.map((p: { name: string }) => p.name).sort();
  expect(names).toEqual(['Tablet A premium', 'iPhone 13 Reacondicionado'].sort());
});

test('filtra por disponibilidad (stock > 0)', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?available=true`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data.every((p: { stock: number }) => p.stock > 0)).toBe(true);
  expect(body.data.some((p: { name: string }) => p.name === 'PC Reacondicionada B')).toBe(false);
});

test('filtra por no disponibilidad (stock <= 0)', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?available=false`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data).toHaveLength(1);
  expect(body.data[0].name).toBe('PC Reacondicionada B');
});

test('devuelve resultados ordenados por precio ascendente cuando hay filtros', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?minPrice=0`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  const prices = body.data.map((p: { price: number }) => p.price);
  const sorted = [...prices].sort((a, b) => a - b);
  expect(prices).toEqual(sorted);
});

test('acota los resultados con limit', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?minPrice=0&limit=2`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data).toHaveLength(2);
});

test('rechaza una categoria de filtro invalida', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?category=electrodomesticos`);
  expect(response.status()).toBe(400);
});

test('rechaza un precio de filtro no numerico', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?minPrice=abc`);
  expect(response.status()).toBe(400);
});

test('filtra por nombre con coincidencia parcial', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?name=iPhone`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data.length).toBeGreaterThan(0);
  expect(body.data.every((p: { name: string }) => p.name.toLowerCase().includes('iphone'))).toBe(true);
});

test('filtra por nombre ignorando mayusculas y minusculas', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?name=IPHONE`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data.length).toBeGreaterThan(0);
  expect(body.data.every((p: { name: string }) => p.name.toLowerCase().includes('iphone'))).toBe(true);
});

test('combina filtros de nombre, categoria, condicion y rango de precio', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?name=iPhone&category=celular&condition=A&minPrice=400&maxPrice=750`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data.length).toBe(1);
  expect(body.data[0].name).toBe('iPhone 13 Reacondicionado');
});

test('devuelve lista vacia cuando el nombre no coincide con ningun producto', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?name=xyzxyz`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data).toEqual([]);
});

test('rechaza un rango de precio invalido (minPrice mayor que maxPrice)', async ({ request }) => {
  const response = await request.get(`${API_URL}/products?minPrice=500&maxPrice=100`);
  expect(response.status()).toBe(400);
});
