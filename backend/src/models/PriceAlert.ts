import { Schema, model, type Document, type Types } from 'mongoose';

export interface IPriceAlert extends Document {
  userId: string;
  product: Types.ObjectId;
  priceAtActivation: number;
  active: boolean;
  triggeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const priceAlertSchema = new Schema<IPriceAlert>(
  {
    userId: { type: String, required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    priceAtActivation: { type: Number, required: true },
    active: { type: Boolean, default: true },
    triggeredAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Solo puede existir una alerta activa por usuario+producto a la vez. El
// filtro parcial excluye las alertas desactivadas del índice único, para que
// desactivar una alerta y luego volver a activarla para el mismo producto
// no choque con un duplicado fantasma.
priceAlertSchema.index({ userId: 1, product: 1 }, { unique: true, partialFilterExpression: { active: true } });

export const PriceAlert = model<IPriceAlert>('PriceAlert', priceAlertSchema);
