import { Schema, model } from 'mongoose';

const couponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  active: { type: Boolean, default: true },
  // Monto minimo de compra (subtotal) para poder aplicar el cupon.
  minPurchase: { type: Number, default: 0 },
  // Cantidad maxima de usos totales; sin definir = ilimitado.
  maxUses: { type: Number },
  usedCount: { type: Number, default: 0 },
}, { timestamps: true });

export const Coupon = model('Coupon', couponSchema);
