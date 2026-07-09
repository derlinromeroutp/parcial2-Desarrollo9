import { Hono } from 'hono';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { WarrantyReport } from '../models/WarrantyReport';
import { Technician } from '../models/Technician';
import { User } from '../models/User';
import { Address } from '../models/Address';
import { InventoryMovement } from '../models/InventoryMovement';
import { isE2ETestMode } from '../lib/e2e';
import { clearSentEmails, getSentEmails } from '../services/email.service';

const e2eRoutes = new Hono();

e2eRoutes.use('*', async (c, next) => {
  if (!isE2ETestMode) {
    return c.json({ error: 'E2E routes are disabled' }, 404);
  }

  await next();
});

e2eRoutes.post('/reset', async (c) => {
  clearSentEmails();

  await Promise.all([
    WarrantyReport.deleteMany({}),
    OrderItem.deleteMany({}),
    Order.deleteMany({}),
    Product.deleteMany({}),
    Technician.deleteMany({}),
    User.deleteMany({}),
    Address.deleteMany({}),
    InventoryMovement.deleteMany({}),
  ]);

  await User.insertMany([
    { clerk_id: 'e2e-user', email: 'shopper@safetech.test', role: 'user' },
    { clerk_id: 'e2e-admin', email: 'admin@safetech.test', role: 'admin' },
  ]);

  const [phone, laptop] = await Product.insertMany([
    {
      name: 'iPhone 13 Reacondicionado',
      description: 'Equipo A con bateria certificada y 90 dias de garantia.',
      price: 499,
      stock: 8,
      condition: 'A',
      category: 'celular',
      image_urls: ['https://picsum.photos/seed/e2e-phone/800/600'],
    },
    {
      name: 'MacBook Air M1 Refurbished',
      description: 'Laptop revisada con 40 puntos de inspeccion.',
      price: 899,
      stock: 5,
      condition: 'A',
      category: 'laptop',
      image_urls: ['https://picsum.photos/seed/e2e-laptop/800/600'],
    },
  ]);

  const technician = await Technician.create({
    name: 'Tecnico Demo',
    email: 'tech@safetech.test',
    phone: '+507 6000-0000',
    clerkId: 'e2e-technician',
    specialties: ['pantallas', 'baterias'],
  });

  const seededOrder = await Order.create({
    userId: 'e2e-user',
    total_amount: 499,
    status: 'paid',
    payment_intent_id: 'e2e_pi_seeded_paid',
    items: [{ product: phone._id, quantity: 1, price: 499 }],
  });

  await OrderItem.create({
    order_id: seededOrder._id,
    product_id: phone._id,
    price: 499,
    quantity: 1,
  });

  await WarrantyReport.create({
    orderId: seededOrder._id,
    userId: 'e2e-user',
    description: 'La bateria pierde carga mas rapido de lo esperado.',
    evidenceUrls: ['https://picsum.photos/seed/e2e-evidence/1200/800'],
    status: 'pending',
    technicianId: technician._id.toString(),
    technicianName: technician.name,
  });

  return c.json({
    ok: true,
    productIds: {
      phone: phone._id,
      laptop: laptop._id,
    },
  });
});

// Inspeccion de correos "enviados" durante E2E_TEST_MODE (HU-34), para poder
// verificar desde los tests que se dispararon sin depender de un proveedor real.
e2eRoutes.get('/emails', (c) => {
  return c.json({ emails: getSentEmails() });
});

export default e2eRoutes;
