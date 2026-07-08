import { Schema, model, Document, Types } from 'mongoose';

export interface IInventoryMovement extends Document {
  productId: Types.ObjectId;
  type: 'restock' | 'manual_adjustment' | 'sale';
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  performedBy: string;
  createdAt: Date;
}

const inventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    // restock: alta de producto o reposicion manual de stock (entrada)
    // manual_adjustment: correccion manual de stock por un admin (entrada o salida)
    // sale: descuento automatico de stock al confirmarse una compra (salida)
    type: { type: String, enum: ['restock', 'manual_adjustment', 'sale'], required: true },
    quantityChange: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: { type: String, required: true },
    performedBy: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const InventoryMovement = model<IInventoryMovement>('InventoryMovement', inventoryMovementSchema);
