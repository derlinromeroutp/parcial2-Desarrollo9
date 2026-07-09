import { expect, test } from '@playwright/test';
import { resetE2EState } from './helpers';

const API_URL = 'http://127.0.0.1:3001/api';
const USER_AUTH = { Authorization: 'Bearer mock:user:e2e-user' };
const ADMIN_AUTH = { Authorization: 'Bearer mock:admin:e2e-admin' };

const SHOPPER_EMAIL = 'shopper@safetech.test';

async function getEmails(request: import('@playwright/test').APIRequestContext) {
  const response = await request.get(`${API_URL}/e2e/emails`);
  return (await response.json()).emails as { to: string; subject: string; html: string }[];
}

async function getSeededOrderId(request: import('@playwright/test').APIRequestContext) {
  const response = await request.get(`${API_URL}/orders/mine`, { headers: USER_AUTH });
  const orders = await response.json();
  return orders[0]._id as string;
}

async function getSeededWarrantyId(request: import('@playwright/test').APIRequestContext) {
  const response = await request.get(`${API_URL}/warranties`, { headers: ADMIN_AUTH });
  const warranties = await response.json();
  return warranties[0]._id as string;
}

test.beforeEach(async ({ request }) => {
  await resetE2EState(request);
});

test('no hay correos pendientes justo despues del reset', async ({ request }) => {
  const emails = await getEmails(request);
  expect(emails).toEqual([]);
});

test('envia un correo de confirmacion al completar una compra', async ({ request }) => {
  const products = (await (await request.get(`${API_URL}/products`)).json()).data;
  const productId = products[0]._id;

  const checkout = await (
    await request.post(`${API_URL}/checkout`, {
      headers: USER_AUTH,
      data: { items: [{ productId, quantity: 1 }] },
    })
  ).json();

  const confirmResponse = await request.post(`${API_URL}/orders/confirm-payment`, {
    headers: USER_AUTH,
    data: { paymentIntentId: checkout.paymentIntentId },
  });
  expect(confirmResponse.status()).toBe(200);

  const emails = await getEmails(request);
  const purchaseEmail = emails.find((e) => e.to === SHOPPER_EMAIL && /compra/i.test(e.subject));
  expect(purchaseEmail).toBeTruthy();
});

test('no reenvia el correo de compra si la orden ya estaba pagada', async ({ request }) => {
  const products = (await (await request.get(`${API_URL}/products`)).json()).data;
  const productId = products[0]._id;

  const checkout = await (
    await request.post(`${API_URL}/checkout`, {
      headers: USER_AUTH,
      data: { items: [{ productId, quantity: 1 }] },
    })
  ).json();

  await request.post(`${API_URL}/orders/confirm-payment`, {
    headers: USER_AUTH,
    data: { paymentIntentId: checkout.paymentIntentId },
  });
  await request.post(`${API_URL}/orders/confirm-payment`, {
    headers: USER_AUTH,
    data: { paymentIntentId: checkout.paymentIntentId },
  });

  const emails = await getEmails(request);
  const purchaseEmails = emails.filter((e) => e.to === SHOPPER_EMAIL && /compra/i.test(e.subject));
  expect(purchaseEmails).toHaveLength(1);
});

test('envia un correo al crear un reclamo de garantia', async ({ request }) => {
  // El seed ya deja una garantia registrada para la orden sembrada (409 si se
  // repite); se crea una orden pagada nueva para poder reclamar una garantia.
  const products = (await (await request.get(`${API_URL}/products`)).json()).data;
  const productId = products[0]._id;

  const checkout = await (
    await request.post(`${API_URL}/checkout`, {
      headers: USER_AUTH,
      data: { items: [{ productId, quantity: 1 }] },
    })
  ).json();
  await request.post(`${API_URL}/orders/confirm-payment`, {
    headers: USER_AUTH,
    data: { paymentIntentId: checkout.paymentIntentId },
  });

  const response = await request.post(`${API_URL}/warranties`, {
    headers: USER_AUTH,
    data: {
      orderId: checkout.orderId,
      reason: 'defecto de fabrica',
      description: 'La bateria no carga correctamente desde el segundo dia de uso.',
    },
  });
  expect(response.status()).toBe(201);

  const emails = await getEmails(request);
  const warrantyEmail = emails.find((e) => e.to === SHOPPER_EMAIL && /garant/i.test(e.subject) && /reclamo|recibimos/i.test(e.subject));
  expect(warrantyEmail).toBeTruthy();
});

test('envia un correo cuando un admin cambia el estado de una garantia', async ({ request }) => {
  const warrantyId = await getSeededWarrantyId(request);

  const response = await request.put(`${API_URL}/warranties/${warrantyId}/status`, {
    headers: ADMIN_AUTH,
    data: { status: 'review' },
  });
  expect(response.status()).toBe(200);

  const emails = await getEmails(request);
  const statusEmail = emails.find((e) => e.to === SHOPPER_EMAIL && /garant/i.test(e.subject));
  expect(statusEmail).toBeTruthy();
});

test('no envia un segundo correo si el estado de la garantia no cambia', async ({ request }) => {
  const warrantyId = await getSeededWarrantyId(request);

  const first = await request.put(`${API_URL}/warranties/${warrantyId}/status`, {
    headers: ADMIN_AUTH,
    data: { status: 'review' },
  });
  expect(first.status()).toBe(200);

  const second = await request.put(`${API_URL}/warranties/${warrantyId}/status`, {
    headers: ADMIN_AUTH,
    data: { status: 'review' },
  });
  expect(second.status()).toBe(200);

  const emails = await getEmails(request);
  const statusEmails = emails.filter((e) => e.to === SHOPPER_EMAIL && /garant/i.test(e.subject));
  expect(statusEmails).toHaveLength(1);
});

test('envia un correo cuando un admin asigna un tecnico (pending -> review)', async ({ request }) => {
  const warrantyId = await getSeededWarrantyId(request);

  const response = await request.put(`${API_URL}/warranties/${warrantyId}/assign`, {
    headers: ADMIN_AUTH,
    data: { technicianId: 'tech-1', technicianName: 'Tecnico de Prueba' },
  });
  expect(response.status()).toBe(200);
  expect((await response.json()).status).toBe('review');

  const emails = await getEmails(request);
  const statusEmail = emails.find((e) => e.to === SHOPPER_EMAIL && /garant/i.test(e.subject));
  expect(statusEmail).toBeTruthy();
});

test('envia un correo cuando un admin cambia el estado de envio de una orden', async ({ request }) => {
  const orderId = await getSeededOrderId(request);

  const response = await request.put(`${API_URL}/orders/${orderId}/shipping`, {
    headers: ADMIN_AUTH,
    data: { status: 'shipped', carrier: 'DHL' },
  });
  expect(response.status()).toBe(200);

  const emails = await getEmails(request);
  const shippingEmail = emails.find((e) => e.to === SHOPPER_EMAIL && /pedido/i.test(e.subject));
  expect(shippingEmail).toBeTruthy();
});
