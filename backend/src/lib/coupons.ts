export interface CouponRules {
  active: boolean;
  validFrom: Date;
  validUntil: Date;
  minPurchase: number;
  maxUses?: number;
  usedCount: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

export interface CouponResolution {
  valid: boolean;
  reason?: string;
  discountAmount: number;
}

export const resolveCouponDiscount = (
  coupon: CouponRules | null,
  subtotal: number,
  now: Date = new Date(),
): CouponResolution => {
  if (!coupon) {
    return { valid: false, reason: 'Cupón no encontrado', discountAmount: 0 };
  }
  if (!coupon.active) {
    return { valid: false, reason: 'Cupón inactivo', discountAmount: 0 };
  }
  if (now < coupon.validFrom || now > coupon.validUntil) {
    return { valid: false, reason: 'Cupón fuera de vigencia', discountAmount: 0 };
  }
  if (subtotal < coupon.minPurchase) {
    return {
      valid: false,
      reason: `Requiere una compra minima de $${coupon.minPurchase.toFixed(2)}`,
      discountAmount: 0,
    };
  }
  if (coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, reason: 'Cupón agotado', discountAmount: 0 };
  }

  const rawDiscount = coupon.discountType === 'percentage'
    ? subtotal * (coupon.discountValue / 100)
    : coupon.discountValue;

  const discountAmount = Math.min(Math.round(rawDiscount * 100) / 100, subtotal);

  return { valid: true, discountAmount };
};
