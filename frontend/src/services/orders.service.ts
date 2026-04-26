import axios from 'axios';
import type { Order } from '../types/order';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const ordersService = {
  getMyOrders: async (token: string): Promise<Order[]> => {
    const response = await axios.get(`${API_URL}/orders/mine`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
  getOrderBySession: async (sessionId: string, token: string): Promise<Order> => {
    const response = await axios.get(`${API_URL}/orders/by-session/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
  getAllOrders: async (token: string): Promise<Order[]> => {
    const response = await axios.get(`${API_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
  confirmPayment: async (paymentIntentId: string, token: string): Promise<Order> => {
    const response = await axios.post(`${API_URL}/orders/confirm-payment`, { paymentIntentId }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};
