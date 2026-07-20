export interface SupportTicket {
  _id: string;
  userId: string;
  category: string;
  description: string;
  contactChannel: string;
  status: 'open' | 'in_review' | 'closed';
  createdAt: string;
  updatedAt: string;
}
