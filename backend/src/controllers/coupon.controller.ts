import { Context } from 'hono';
import { Coupon } from '../models/Coupon';
import { resolveCouponDiscount } from '../lib/coupons';

export const createCoupon = async (c: Context) => {
  try {
    const data = c.req.valid('json' as any) as {
      code: string;
      discountType: 'percentage' | 'fixed';
      discountValue: number;
      validFrom: string;
      validUntil: string;
      minPurchase?: number;
      maxUses?: number;
    };

    const code = data.code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code });
    if (existing) {
      return c.json({ error: 'Ya existe un cupón con ese código' }, 409);
    }

    const coupon = await Coupon.create({
      code,
      discountType: data.discountType,
      discountValue: data.discountValue,
      validFrom: new Date(data.validFrom),
      validUntil: new Date(data.validUntil),
      minPurchase: data.minPurchase ?? 0,
      maxUses: data.maxUses,
    });

    return c.json(coupon, 201);
  } catch (error: any) {
    console.error('[Coupon] Error creating coupon:', error);
    return c.json({ error: error.message }, 400);
  }
};

export const getAllCoupons = async (c: Context) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return c.json(coupons);
  } catch (error: any) {
    console.error('[Coupon] Error fetching coupons:', error);
    return c.json({ error: 'Failed to fetch coupons' }, 500);
  }
};

export const deactivateCoupon = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const coupon = await Coupon.findByIdAndUpdate(id, { active: false }, { new: true });

    if (!coupon) {
      return c.json({ error: 'Cupón no encontrado' }, 404);
    }

    return c.json(coupon);
  } catch (error: any) {
    console.error('[Coupon] Error deactivating coupon:', error);
    return c.json({ error: 'Failed to deactivate coupon' }, 500);
  }
};

export const validateCoupon = async (c: Context) => {
  try {
    const { code, subtotal } = c.req.valid('json' as any) as { code: string; subtotal: number };

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
    const resolution = resolveCouponDiscount(coupon as any, subtotal);

    return c.json(resolution);
  } catch (error: any) {
    console.error('[Coupon] Error validating coupon:', error);
    return c.json({ error: 'Failed to validate coupon' }, 500);
  }
};
