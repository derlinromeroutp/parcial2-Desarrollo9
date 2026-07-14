import { Schema, model, type Document } from 'mongoose';

export interface ISupportTicket extends Document {
  userId: string;
  category: string;
  description: string;
  contactChannel: string;
  status: 'open' | 'in_review' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    userId: { type: String, required: true, index: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    contactChannel: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['open', 'in_review', 'closed'],
      default: 'open',
    },
  },
  { timestamps: true },
);

export const SupportTicket = model<ISupportTicket>('SupportTicket', SupportTicketSchema);
