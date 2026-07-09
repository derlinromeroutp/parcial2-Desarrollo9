import type { ClientSession, Types } from 'mongoose';
import { InventoryMovement } from '../models/InventoryMovement';

export interface RecordMovementParams {
  productId: Types.ObjectId | string;
  type: 'restock' | 'manual_adjustment' | 'sale';
  previousStock: number;
  newStock: number;
  reason: string;
  performedBy: string;
  session?: ClientSession;
}

export async function recordInventoryMovement(params: RecordMovementParams) {
  const { productId, type, previousStock, newStock, reason, performedBy, session } = params;

  const [movement] = await InventoryMovement.create(
    [
      {
        productId,
        type,
        quantityChange: newStock - previousStock,
        previousStock,
        newStock,
        reason,
        performedBy,
      },
    ],
    session ? { session } : undefined,
  );

  return movement;
}
