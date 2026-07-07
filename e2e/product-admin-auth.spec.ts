import { expect, test } from '@playwright/test';
import { resetE2EState } from './helpers';

const API_URL = 'http://127.0.0.1:3001/api';

const validProductBody = {
  name: 'Producto E2E Auth',
  description: 'Producto de prueba para HU-25',
  price: 100,
  stock: 5,
  condition: 'A',
  category: 'celular',
};

test.beforeEach(async ({ request }) => {
  await resetE2EState(request);
});

test('rechaza crear un producto sin token', async ({ request }) => {
  const response = await request.post(`${API_URL}/products`, {
    data: {},
  });
  expect(response.status()).toBe(401);
});

test('rechaza crear un producto con un usuario no admin', async ({ request }) => {
  const response = await request.post(`${API_URL}/products`, {
    headers: { Authorization: 'Bearer mock:user:e2e-user' },
    data: {},
  });
  expect(response.status()).toBe(403);
});

test('rechaza editar un producto con un usuario no admin', async ({ request }) => {
  const response = await request.put(`${API_URL}/products/000000000000000000000000`, {
    headers: { Authorization: 'Bearer mock:user:e2e-user' },
    data: {},
  });
  expect(response.status()).toBe(403);
});

test('rechaza eliminar un producto con un usuario no admin', async ({ request }) => {
  const response = await request.delete(`${API_URL}/products/000000000000000000000000`, {
    headers: { Authorization: 'Bearer mock:user:e2e-user' },
  });
  expect(response.status()).toBe(403);
});

test('permite a un admin crear, editar y eliminar un producto', async ({ request }) => {
  const createResponse = await request.post(`${API_URL}/products`, {
    headers: { Authorization: 'Bearer mock:admin:e2e-admin' },
    data: validProductBody,
  });
  expect(createResponse.status()).toBe(201);
  const created = await createResponse.json();
  const productId = created.data._id;
  expect(productId).toBeTruthy();

  const updateResponse = await request.put(`${API_URL}/products/${productId}`, {
    headers: { Authorization: 'Bearer mock:admin:e2e-admin' },
    data: { price: 150 },
  });
  expect(updateResponse.status()).toBe(200);

  const deleteResponse = await request.delete(`${API_URL}/products/${productId}`, {
    headers: { Authorization: 'Bearer mock:admin:e2e-admin' },
  });
  expect(deleteResponse.status()).toBe(200);
});
