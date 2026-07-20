export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  minPurchase: number;
  maxUses?: number;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationResult {
  valid: boolean;
  reason?: string;
  discountAmount: number;
}
