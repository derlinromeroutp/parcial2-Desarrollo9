import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const technicianService = {
  getTechnicians: async (token: string) => {
    const response = await axios.get(`${API_URL}/technicians`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  createTechnician: async (data: { name: string; email: string; phone?: string; specialties?: string[]; clerkId?: string }, token: string) => {
    const response = await axios.post(`${API_URL}/technicians`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  deleteTechnician: async (id: string, token: string) => {
    const response = await axios.delete(`${API_URL}/technicians/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};