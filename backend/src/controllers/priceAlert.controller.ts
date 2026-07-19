import { type Context } from 'hono';
import { PriceAlert } from '../models/PriceAlert';
import { WishlistItem } from '../models/WishlistItem';
import { Product } from '../models/Product';
import { isPriceAlertTriggered } from '../lib/priceAlerts';

export const createPriceAlert = async (c: Context) => {
  try {
    const userId = c.get('userId');
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const { productId } = await c.req.json();

    const inWishlist = await WishlistItem.findOne({ userId, product: productId });
    if (!inWishlist) {
      return c.json({ error: 'El producto debe estar en tu lista de deseos para activar una alerta' }, 400);
    }

    const product = await Product.findById(productId);
    if (!product) return c.json({ error: 'Producto no encontrado' }, 404);

    const existing = await PriceAlert.findOne({ userId, product: productId, active: true });
    if (existing) {
      return c.json({ error: 'Ya tienes una alerta activa para este producto' }, 409);
    }

    const alert = await PriceAlert.create({
      userId,
      product: productId,
      priceAtActivation: product.price,
    });
    const populated = await alert.populate('product');

    return c.json(populated, 201);
  } catch (error) {
    console.error('Error creating price alert:', error);
    return c.json({ error: 'Failed to create price alert' }, 500);
  }
};

export const getMyPriceAlerts = async (c: Context) => {
  try {
    const userId = c.get('userId');
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const alerts = await PriceAlert.find({ userId }).populate('product').sort({ createdAt: -1 }).lean();

    const withStatus = alerts.map((alert: any) => ({
      ...alert,
      triggered: alert.product ? isPriceAlertTriggered(alert.priceAtActivation, alert.product.price) : false,
    }));

    return c.json(withStatus);
  } catch (error) {
    console.error('Error fetching price alerts:', error);
    return c.json({ error: 'Failed to fetch price alerts' }, 500);
  }
};

export const deactivatePriceAlert = async (c: Context) => {
  try {
    const userId = c.get('userId');
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    const alert = await PriceAlert.findById(id);

    if (!alert) return c.json({ error: 'Alerta no encontrada' }, 404);
    if (alert.userId !== userId) {
      return c.json({ error: 'No autorizado: Esta alerta no te pertenece' }, 403);
    }

    alert.active = false;
    await alert.save();

    return c.json(alert);
  } catch (error) {
    console.error('Error deactivating price alert:', error);
    return c.json({ error: 'Failed to deactivate price alert' }, 500);
  }
};
