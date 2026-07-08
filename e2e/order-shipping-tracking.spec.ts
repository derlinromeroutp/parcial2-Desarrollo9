import { expect, test } from '@playwright/test';
import { resetE2EState } from './helpers';

const API_URL = 'http://127.0.0.1:3001/api';
const USER_AUTH = { Authorization: 'Bearer mock:user:e2e-user' };
const ADMIN_AUTH = { Authorization: 'Bearer mock:admin:e2e-admin' };

async function getSeededOrderId(request: import('@playwright/test').APIRequestContext) {
  const response = await request.get(`${API_URL}/orders/mine`, { headers: USER_AUTH });
  const orders = await response.json();
  return orders[0]._id as string;
}

test.beforeEach(async ({ request }) => {
  await resetE2EState(request);
});

test('rechaza actualizar envio sin token', async ({ request }) => {
  const orderId = await getSeededOrderId(request);
  const response = await request.put(`${API_URL}/orders/${orderId}/shipping`, { data: { status: 'shipped' } });
  expect(response.status()).toBe(401);
});

test('rechaza actualizar envio si el usuario no es admin', async ({ request }) => {
  const orderId = await getSeededOrderId(request);
  const response = await request.put(`${API_URL}/orders/${orderId}/shipping`, {
    headers: USER_AUTH,
    data: { status: 'shipped' },
  });
  expect(response.status()).toBe(403);
});

test('un admin actualiza el estado, transportista y numero de seguimiento', async ({ request }) => {
  const orderId = await getSeededOrderId(request);

  const response = await request.put(`${API_URL}/orders/${orderId}/shipping`, {
    headers: ADMIN_AUTH,
    data: { status: 'shipped', carrier: 'DHL', trackingNumber: 'DHL123456789' },
  });
  expect(response.status()).toBe(200);
  const updated = await response.json();
  expect(updated.status).toBe('shipped');
  expect(updated.carrier).toBe('DHL');
  expect(updated.trackingNumber).toBe('DHL123456789');
});

test('el cliente ve la info de envio en su historial de pedidos', async ({ request }) => {
  const orderId = await getSeededOrderId(request);

  await request.put(`${API_URL}/orders/${orderId}/shipping`, {
    headers: ADMIN_AUTH,
    data: { status: 'processing', carrier: 'Correos de Panama', trackingNumber: 'CP-000111' },
  });

  const response = await request.get(`${API_URL}/orders/mine`, { headers: USER_AUTH });
  const orders = await response.json();
  const order = orders.find((o: { _id: string }) => o._id === orderId);

  expect(order.status).toBe('processing');
  expect(order.carrier).toBe('Correos de Panama');
  expect(order.trackingNumber).toBe('CP-000111');
});

test('soporta la transicion completa processing -> shipped -> delivered', async ({ request }) => {
  const orderId = await getSeededOrderId(request);

  for (const status of ['processing', 'shipped', 'delivered']) {
    const response = await request.put(`${API_URL}/orders/${orderId}/shipping`, {
      headers: ADMIN_AUTH,
      data: { status },
    });
    expect(response.status()).toBe(200);
    expect((await response.json()).status).toBe(status);
  }
});

test('rechaza un estado invalido', async ({ request }) => {
  const orderId = await getSeededOrderId(request);
  const response = await request.put(`${API_URL}/orders/${orderId}/shipping`, {
    headers: ADMIN_AUTH,
    data: { status: 'en-camino' },
  });
  expect(response.status()).toBe(400);
});

test('rechaza un body vacio', async ({ request }) => {
  const orderId = await getSeededOrderId(request);
  const response = await request.put(`${API_URL}/orders/${orderId}/shipping`, {
    headers: ADMIN_AUTH,
    data: {},
  });
  expect(response.status()).toBe(400);
});

test('devuelve 404 para una orden inexistente', async ({ request }) => {
  const response = await request.put(`${API_URL}/orders/000000000000000000000000/shipping`, {
    headers: ADMIN_AUTH,
    data: { status: 'shipped' },
  });
  expect(response.status()).toBe(404);
});
