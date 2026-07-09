import { expect, test } from '@playwright/test';
import { resetE2EState } from './helpers';

const API_URL = 'http://127.0.0.1:3001/api';
const USER_AUTH = { Authorization: 'Bearer mock:user:e2e-user' };
const OTHER_USER_AUTH = { Authorization: 'Bearer mock:user:e2e-other-user' };

const validAddress = {
  recipientName: 'Ana Aparicio',
  phone: '+507 6123-4567',
  street: 'Calle 50, Edificio Plaza',
  city: 'Ciudad de Panama',
  state: 'Panama',
  zipCode: '0801',
  country: 'Panama',
};

test.beforeEach(async ({ request }) => {
  await resetE2EState(request);
});

test('rechaza listar direcciones sin token', async ({ request }) => {
  const response = await request.get(`${API_URL}/addresses`);
  expect(response.status()).toBe(401);
});

test('crea una direccion valida', async ({ request }) => {
  const response = await request.post(`${API_URL}/addresses`, { headers: USER_AUTH, data: validAddress });
  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.data.recipientName).toBe(validAddress.recipientName);
  expect(body.data.userId).toBe('e2e-user');
});

test('rechaza crear una direccion con campos faltantes', async ({ request }) => {
  const response = await request.post(`${API_URL}/addresses`, {
    headers: USER_AUTH,
    data: { recipientName: 'Ana Aparicio' },
  });
  expect(response.status()).toBe(400);
});

test('lista solo las direcciones propias del usuario autenticado', async ({ request }) => {
  await request.post(`${API_URL}/addresses`, { headers: USER_AUTH, data: validAddress });
  await request.post(`${API_URL}/addresses`, {
    headers: OTHER_USER_AUTH,
    data: { ...validAddress, recipientName: 'Otro Usuario' },
  });

  const response = await request.get(`${API_URL}/addresses`, { headers: USER_AUTH });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data).toHaveLength(1);
  expect(body.data[0].recipientName).toBe('Ana Aparicio');
});

test('la primera direccion marcada default desmarca las demas', async ({ request }) => {
  const first = await (
    await request.post(`${API_URL}/addresses`, { headers: USER_AUTH, data: { ...validAddress, isDefault: true } })
  ).json();
  const second = await (
    await request.post(`${API_URL}/addresses`, {
      headers: USER_AUTH,
      data: { ...validAddress, recipientName: 'Segunda direccion', isDefault: true },
    })
  ).json();

  const list = await (await request.get(`${API_URL}/addresses`, { headers: USER_AUTH })).json();
  const byId = Object.fromEntries(list.data.map((a: { _id: string; isDefault: boolean }) => [a._id, a.isDefault]));

  expect(byId[first.data._id]).toBe(false);
  expect(byId[second.data._id]).toBe(true);
});

test('edita una direccion propia', async ({ request }) => {
  const created = await (
    await request.post(`${API_URL}/addresses`, { headers: USER_AUTH, data: validAddress })
  ).json();

  const response = await request.put(`${API_URL}/addresses/${created.data._id}`, {
    headers: USER_AUTH,
    data: { city: 'David' },
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data.city).toBe('David');
  expect(body.data.street).toBe(validAddress.street);
});

test('rechaza editar una direccion de otro usuario', async ({ request }) => {
  const created = await (
    await request.post(`${API_URL}/addresses`, { headers: USER_AUTH, data: validAddress })
  ).json();

  const response = await request.put(`${API_URL}/addresses/${created.data._id}`, {
    headers: OTHER_USER_AUTH,
    data: { city: 'David' },
  });
  expect(response.status()).toBe(404);
});

test('elimina una direccion propia', async ({ request }) => {
  const created = await (
    await request.post(`${API_URL}/addresses`, { headers: USER_AUTH, data: validAddress })
  ).json();

  const deleteResponse = await request.delete(`${API_URL}/addresses/${created.data._id}`, { headers: USER_AUTH });
  expect(deleteResponse.status()).toBe(200);

  const list = await (await request.get(`${API_URL}/addresses`, { headers: USER_AUTH })).json();
  expect(list.data).toEqual([]);
});

test('rechaza eliminar una direccion de otro usuario', async ({ request }) => {
  const created = await (
    await request.post(`${API_URL}/addresses`, { headers: USER_AUTH, data: validAddress })
  ).json();

  const response = await request.delete(`${API_URL}/addresses/${created.data._id}`, { headers: OTHER_USER_AUTH });
  expect(response.status()).toBe(404);
});

test('el checkout acepta una direccion guardada y la snapshotea en la orden', async ({ request }) => {
  const address = await (
    await request.post(`${API_URL}/addresses`, { headers: USER_AUTH, data: validAddress })
  ).json();

  const productsResponse = await request.get(`${API_URL}/products`);
  const products = (await productsResponse.json()).data;
  const productId = products[0]._id;

  const checkoutResponse = await request.post(`${API_URL}/checkout`, {
    headers: USER_AUTH,
    data: { items: [{ productId, quantity: 1 }], addressId: address.data._id },
  });
  expect(checkoutResponse.status()).toBe(200);
  const checkoutBody = await checkoutResponse.json();

  const ordersResponse = await request.get(`${API_URL}/orders/mine`, { headers: USER_AUTH });
  const orders = await ordersResponse.json();
  const order = orders.find((o: { _id: string }) => o._id === checkoutBody.orderId);
  expect(order.shippingAddress?.city).toBe(validAddress.city);
});

test('el checkout rechaza un addressId que no pertenece al usuario', async ({ request }) => {
  const address = await (
    await request.post(`${API_URL}/addresses`, { headers: USER_AUTH, data: validAddress })
  ).json();

  const productsResponse = await request.get(`${API_URL}/products`);
  const products = (await productsResponse.json()).data;
  const productId = products[0]._id;

  const checkoutResponse = await request.post(`${API_URL}/checkout`, {
    headers: OTHER_USER_AUTH,
    data: { items: [{ productId, quantity: 1 }], addressId: address.data._id },
  });
  expect(checkoutResponse.status()).toBe(400);
});
