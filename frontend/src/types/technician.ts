export interface Technician {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  specialties?: string[];
  active: boolean;
  clerkId?: string;
  createdAt: string;
  updatedAt: string;
}