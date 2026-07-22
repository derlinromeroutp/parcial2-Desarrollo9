import { Schema, model, Document, Types } from 'mongoose';

export interface IInspectionChecklistItem {
  aspect: string;
  result: string;
  passed: boolean;
}

export interface IInspectionReport extends Document {
  product: Types.ObjectId;
  technicianId?: string;
  technicianName?: string;
  checklist: IInspectionChecklistItem[];
  inspectedAt: Date;
}

const checklistItemSchema = new Schema<IInspectionChecklistItem>(
  {
    aspect: { type: String, required: true },
    result: { type: String, required: true },
    passed: { type: Boolean, required: true, default: true },
  },
  { _id: false }
);

const inspectionReportSchema = new Schema<IInspectionReport>(
  {
    // Un producto tiene a lo sumo una ficha vigente (HU-46); se actualiza in
    // situ (upsert) en vez de acumular historial de fichas.
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    technicianId: { type: String },
    technicianName: { type: String },
    checklist: {
      type: [checklistItemSchema],
      required: true,
      validate: {
        validator: (items: IInspectionChecklistItem[]) => items.length > 0,
        message: 'La ficha debe incluir al menos un aspecto revisado',
      },
    },
    inspectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const InspectionReport = model<IInspectionReport>('InspectionReport', inspectionReportSchema);
