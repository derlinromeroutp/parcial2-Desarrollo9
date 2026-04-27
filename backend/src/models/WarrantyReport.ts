import { Schema, model, Document, Types } from 'mongoose';

export interface IWarrantyReport extends Document {
  orderId: Types.ObjectId;
  userId: string;
  description: string;
  evidenceUrls: string[];
  status: 'pending' | 'review' | 'resolved' | 'rejected' | 'refunded';
  repairNotes?: string;
  technicianId?: string;
  technicianName?: string;
  createdAt: Date;
  resolvedAt?: Date;
  updatedAt?: Date;
}

const WarrantyReportSchema = new Schema<IWarrantyReport>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    userId: { type: String, required: true },
    description: { type: String, required: true },
    evidenceUrls: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'review', 'resolved', 'rejected', 'refunded'],
      default: 'pending'
    },
    repairNotes: { type: String },
    technicianId: { type: String },
    technicianName: { type: String },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date }
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

// Relación virtual con el usuario a través de clerk_id
WarrantyReportSchema.virtual('userDoc', {
  ref: 'User',
  localField: 'userId',
  foreignField: 'clerk_id',
  justOne: true
});

// Asegurar que los virtuales se incluyan en la serialización a JSON
WarrantyReportSchema.set('toJSON', { virtuals: true });
WarrantyReportSchema.set('toObject', { virtuals: true });

export const WarrantyReport = model<IWarrantyReport>('WarrantyReport', WarrantyReportSchema);
