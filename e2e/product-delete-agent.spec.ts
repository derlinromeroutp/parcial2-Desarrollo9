import { expect, test } from '@playwright/test';
import { resetE2EState } from './helpers';

const API_URL = 'http://127.0.0.1:3001/api';
const ADMIN_AUTH = { Authorization: 'Bearer mock:admin:e2e-admin' };
const USER_AUTH = { Authorization: 'Bearer mock:user:e2e-user' };

const validProductBody = {
  name: 'Producto para eliminar por agente IA',
  description: 'Producto de prueba para HU-28 (delete_product)',
  price: 120,
  stock: 2,
  condition: 'C',
  category: 'pc',
};

test.beforeEach(async ({ request }) => {
  await resetE2EState(request);
});

test('rechaza la eliminacion si el agente no tiene rol admin', async ({ request }) => {
  const response = await request.delete(`${API_URL}/products/000000000000000000000000`, {
    headers: USER_AUTH,
  });
  expect(response.status()).toBe(403);
});

test('elimina un producto y confirma que ya no esta disponible en el catalogo', async ({ request }) => {
  const createResponse = await request.post(`${API_URL}/products`, {
    headers: ADMIN_AUTH,
    data: validProductBody,
  });
  expect(createResponse.status()).toBe(201);
  const { data: created } = await createResponse.json();

  const deleteResponse = await request.delete(`${API_URL}/products/${created._id}`, {
    headers: ADMIN_AUTH,
  });
  expect(deleteResponse.status()).toBe(200);
  const deleteBody = await deleteResponse.json();
  expect(deleteBody.success).toBe(true);

  // La confirmacion real de que ya no esta disponible en el catalogo:
  // una consulta posterior por ese id ya no debe encontrarlo.
  const getResponse = await request.get(`${API_URL}/products/${created._id}`);
  expect(getResponse.status()).toBe(404);
});

test('devuelve 404 al intentar eliminar un producto inexistente', async ({ request }) => {
  const response = await request.delete(`${API_URL}/products/000000000000000000000000`, {
    headers: ADMIN_AUTH,
  });
  expect(response.status()).toBe(404);
});
