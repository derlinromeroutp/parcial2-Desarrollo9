import type { CreateWarrantyDTO, IWarranty } from '../types/warranty';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const warrantyService = {
  async uploadEvidence(file: File, token: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMsg = result?.error || 'Failed to upload evidence';
      throw new Error(errorMsg);
    }

    return result;
  },

  async createWarranty(data: CreateWarrantyDTO, token: string): Promise<IWarranty> {
    const response = await fetch(`${API_URL}/warranties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMsg = result?.error || 'Failed to create warranty report';
      throw new Error(errorMsg);
    }

    return result;
  },

  async getMyWarranties(token: string): Promise<IWarranty[]> {
    const response = await fetch(`${API_URL}/warranties/mine`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch warranties');
    return response.json();
  },

  async getAllWarranties(token: string): Promise<IWarranty[]> {
    const response = await fetch(`${API_URL}/warranties`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch all warranties');
    return response.json();
  },

  async updateWarrantyStatus(id: string, status: string, token: string, repairNotes?: string): Promise<IWarranty> {
    const response = await fetch(`${API_URL}/warranties/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status, repairNotes }),
    });

    if (!response.ok) throw new Error('Failed to update warranty status');
    return response.json();
  },

  async assignTechnician(id: string, technicianId: string, technicianName: string, token: string): Promise<IWarranty> {
    const response = await fetch(`${API_URL}/warranties/${id}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ technicianId, technicianName }),
    });

    if (!response.ok) throw new Error('Failed to assign technician');
    return response.json();
  },

  async getAssignedWarranties(token: string): Promise<IWarranty[]> {
    const response = await fetch(`${API_URL}/warranties/assigned`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch assigned warranties');
    return response.json();
  },

  async technicianUpdate(id: string, data: { status?: string; repairNotes?: string }, token: string): Promise<IWarranty> {
    const response = await fetch(`${API_URL}/warranties/${id}/tech-update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update warranty');
    return response.json();
  },
};