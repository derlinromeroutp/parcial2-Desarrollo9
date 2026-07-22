import type { InspectionChecklistItem, InspectionReport } from '../types/inspection';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const inspectionService = {
  async getByProduct(productId: string): Promise<InspectionReport | null> {
    const response = await fetch(`${API_URL}/products/${productId}/inspection`);
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result?.message || result?.errors?.[0]?.message || 'Failed to fetch inspection report');
    }
    const result = await response.json();
    return result.data ?? null;
  },

  async upsert(productId: string, checklist: InspectionChecklistItem[], token: string): Promise<InspectionReport> {
    const response = await fetch(`${API_URL}/products/${productId}/inspection`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ checklist }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result?.message || result?.errors?.[0]?.message || 'Failed to save inspection report');
    }
    const result = await response.json();
    return result.data;
  },
};
