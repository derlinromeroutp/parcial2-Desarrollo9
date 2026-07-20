import axios from 'axios';
import type { Coupon, CouponValidationResult } from '../types/coupon';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const couponService = {
  validateCoupon: async (code: string, subtotal: number, token: string): Promise<CouponValidationResult> => {
    const response = await axios.post(
      `${API_URL}/coupons/validate`,
      { code, subtotal },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  },
  getCoupons: async (token: string): Promise<Coupon[]> => {
    const response = await axios.get(`${API_URL}/coupons`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  createCoupon: async (
    data: {
      code: string;
      discountType: 'percentage' | 'fixed';
      discountValue: number;
      validFrom: string;
      validUntil: string;
      minPurchase?: number;
      maxUses?: number;
    },
    token: string,
  ): Promise<Coupon> => {
    const response = await axios.post(`${API_URL}/coupons`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  deactivateCoupon: async (id: string, token: string): Promise<Coupon> => {
    const response = await axios.patch(`${API_URL}/coupons/${id}/deactivate`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
