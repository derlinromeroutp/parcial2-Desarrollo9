import axios from 'axios';
import type { PriceAlert } from '../types/priceAlert';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const priceAlertService = {
  getMyPriceAlerts: async (token: string): Promise<PriceAlert[]> => {
    const { data } = await axios.get(`${API_URL}/price-alerts/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  createPriceAlert: async (productId: string, token: string): Promise<PriceAlert> => {
    const { data } = await axios.post(`${API_URL}/price-alerts`, { productId }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  deactivatePriceAlert: async (id: string, token: string): Promise<PriceAlert> => {
    const { data } = await axios.put(`${API_URL}/price-alerts/${id}/deactivate`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};
