const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Address {
  _id: string;
  userId: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressDTO {
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

async function parseErrorOrJson(response: Response) {
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result?.message || result?.errors?.[0]?.message || 'Failed to reach addresses API');
  }
  return response.json();
}

export const addressesService = {
  async getMine(token: string): Promise<Address[]> {
    const response = await fetch(`${API_URL}/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await parseErrorOrJson(response);
    return result.data || [];
  },

  async create(data: AddressDTO, token: string): Promise<Address> {
    const response = await fetch(`${API_URL}/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const result = await parseErrorOrJson(response);
    return result.data;
  },

  async update(id: string, data: Partial<AddressDTO>, token: string): Promise<Address> {
    const response = await fetch(`${API_URL}/addresses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const result = await parseErrorOrJson(response);
    return result.data;
  },

  async delete(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/addresses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await parseErrorOrJson(response);
  },
};
