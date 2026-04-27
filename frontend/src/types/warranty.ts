export interface IWarranty {
  _id: string;
  orderId: string | any;
  userDoc?: { email: string, role: string };
  userId: string;
  description: string;
  reason?: string;
  evidenceUrls: string[];
  status: 'pending' | 'review' | 'resolved' | 'rejected' | 'refunded';
  repairNotes?: string;
  technicianId?: string;
  technicianName?: string;
  createdAt: string;
  resolvedAt?: string;
  updatedAt?: string;
}

export interface CreateWarrantyDTO {
  orderId: string;
  reason: string;
  description: string;
  evidenceUrls: string[];
}
