import axios from 'axios';
import type { SupportTicket } from '../types/supportTicket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const supportTicketService = {
  createTicket: async (
    data: { category: string; description: string; contactChannel: string },
    token: string,
  ): Promise<{ ticketId: string; status: string }> => {
    const response = await axios.post(`${API_URL}/support-tickets`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  getMyTickets: async (token: string): Promise<SupportTicket[]> => {
    const response = await axios.get(`${API_URL}/support-tickets/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  getAllTickets: async (token: string): Promise<SupportTicket[]> => {
    const response = await axios.get(`${API_URL}/support-tickets`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  updateTicketStatus: async (
    id: string,
    status: 'open' | 'in_review' | 'closed',
    token: string,
  ): Promise<SupportTicket> => {
    const response = await axios.patch(`${API_URL}/support-tickets/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
