import { expect, test } from '@playwright/test';
import { resetE2EState } from './helpers';

const API_URL = 'http://127.0.0.1:3001/api';
const ADMIN_AUTH = { Authorization: 'Bearer mock:admin:e2e-admin' };
const USER_AUTH = { Authorization: 'Bearer mock:user:e2e-user' };

test.beforeEach(async ({ request }) => {
  await resetE2EState(request);
});

test('rechaza consultar el historial si el llamador no es admin', async ({ request }) => {
  const products = (await (await request.get(`${API_URL}/products`)).json()).data;
  const response = await request.get(`${API_URL}/products/${products[0]._id}/inventory-movements`, {
    headers: USER_AUTH,
  });
  expect(response.status()).toBe(403);
});

test('devuelve 404 para un producto inexistente', async ({ request }) => {
  const response = await request.get(`${API_URL}/products/000000000000000000000000/inventory-movements`, {
    headers: ADMIN_AUTH,
  });
  expect(response.status()).toBe(404);
});

test('registra un movimiento de alta al crear un producto con stock inicial', async ({ request }) => {
  const created = await (
    await request.post(`${API_URL}/products`, {
      headers: ADMIN_AUTH,
      data: { name: 'Producto Nuevo', description: 'x', price: 100, stock: 10, condition: 'A', category: 'pc' },
    })
  ).json();

  const response = await request.get(`${API_URL}/products/${created.data._id}/inventory-movements`, {
    headers: ADMIN_AUTH,
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data).toHaveLength(1);
  expect(body.data[0]).toMatchObject({
    type: 'restock',
    quantityChange: 10,
    previousStock: 0,
    newStock: 10,
    reason: 'Alta de producto',
    performedBy: 'e2e-admin',
  });
});

test('no registra movimiento al crear un producto sin stock inicial', async ({ request }) => {
  const created = await (
    await request.post(`${API_URL}/products`, {
      headers: ADMIN_AUTH,
      data: { name: 'Producto Sin Stock', description: 'x', price: 100, stock: 0, condition: 'A', category: 'pc' },
    })
  ).json();

  const response = await request.get(`${API_URL}/products/${created.data._id}/inventory-movements`, {
    headers: ADMIN_AUTH,
  });
  expect((await response.json()).data).toEqual([]);
});

test('registra un ajuste manual con motivo, usuario y fecha al editar el stock', async ({ request }) => {
  const products = (await (await request.get(`${API_URL}/products`)).json()).data;
  const product = products[0];

  const updateResponse = await request.put(`${API_URL}/products/${product._id}`, {
    headers: ADMIN_AUTH,
    data: { stock: product.stock + 20, reason: 'Reposicion de proveedor' },
  });
  expect(updateResponse.status()).toBe(200);

  const response = await request.get(`${API_URL}/products/${product._id}/inventory-movements`, {
    headers: ADMIN_AUTH,
  });
  const body = await response.json();
  expect(body.data).toHaveLength(1);
  expect(body.data[0]).toMatchObject({
    type: 'manual_adjustment',
    quantityChange: 20,
    previousStock: product.stock,
    newStock: product.stock + 20,
    reason: 'Reposicion de proveedor',
    performedBy: 'e2e-admin',
  });
  expect(body.data[0].createdAt).toBeTruthy();
});

test('usa un motivo por defecto si no se envia reason', async ({ request }) => {
  const products = (await (await request.get(`${API_URL}/products`)).json()).data;
  const product = products[0];

  await request.put(`${API_URL}/products/${product._id}`, {
    headers: ADMIN_AUTH,
    data: { stock: product.stock + 1 },
  });

  const response = await request.get(`${API_URL}/products/${product._id}/inventory-movements`, {
    headers: ADMIN_AUTH,
  });
  expect((await response.json()).data[0].reason).toBe('Ajuste manual de stock');
});

test('no registra movimiento si se edita el producto sin cambiar el stock', async ({ request }) => {
  const products = (await (await request.get(`${API_URL}/products`)).json()).data;
  const product = products[0];

  await request.put(`${API_URL}/products/${product._id}`, {
    headers: ADMIN_AUTH,
    data: { price: product.price + 5 },
  });

  const response = await request.get(`${API_URL}/products/${product._id}/inventory-movements`, {
    headers: ADMIN_AUTH,
  });
  expect((await response.json()).data).toEqual([]);
});

test('registra una venta automatica al confirmarse una compra', async ({ request }) => {
  const products = (await (await request.get(`${API_URL}/products`)).json()).data;
  const product = products[0];

  const checkout = await (
    await request.post(`${API_URL}/checkout`, {
      headers: USER_AUTH,
      data: { items: [{ productId: product._id, quantity: 2 }] },
    })
  ).json();

  await request.post(`${API_URL}/orders/confirm-payment`, {
    headers: USER_AUTH,
    data: { paymentIntentId: checkout.paymentIntentId },
  });

  const response = await request.get(`${API_URL}/products/${product._id}/inventory-movements`, {
    headers: ADMIN_AUTH,
  });
  const body = await response.json();
  const saleMovement = body.data.find((m: { type: string }) => m.type === 'sale');
  expect(saleMovement).toMatchObject({
    quantityChange: -2,
    previousStock: product.stock,
    newStock: product.stock - 2,
    performedBy: 'e2e-user',
  });
  expect(saleMovement.reason).toMatch(/venta/i);
});

test('permite consultar movimientos por producto de forma independiente', async ({ request }) => {
  const products = (await (await request.get(`${API_URL}/products`)).json()).data;
  const [productA, productB] = products;

  await request.put(`${API_URL}/products/${productA._id}`, {
    headers: ADMIN_AUTH,
    data: { stock: productA.stock + 1 },
  });

  const responseA = await request.get(`${API_URL}/products/${productA._id}/inventory-movements`, { headers: ADMIN_AUTH });
  const responseB = await request.get(`${API_URL}/products/${productB._id}/inventory-movements`, { headers: ADMIN_AUTH });

  expect((await responseA.json()).data).toHaveLength(1);
  expect((await responseB.json()).data).toEqual([]);
});
