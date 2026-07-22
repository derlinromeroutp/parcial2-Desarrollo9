import axios from 'axios';
import type { AuditLog } from '../types/auditLog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const auditLogService = {
  getAll: async (token: string): Promise<AuditLog[]> => {
    const response = await axios.get(`${API_URL}/audit-logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
