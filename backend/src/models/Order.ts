import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
  userId: { type: String, required: true },
  total_amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'failed'],
    default: 'pending',
  },
  // Info de envio y tracking (HU-33): se completan cuando el admin despacha la orden.
  carrier: { type: String },
  trackingNumber: { type: String },
  // Legacy field — kept for back-compat with old hosted-checkout orders.
  stripe_session_id: { type: String, index: true },
  // New field — used by embedded Payment Element flow.
  payment_intent_id: { type: String, index: true },
  // Cupon aplicado en el checkout (HU-39): se guarda el codigo y el
  // descuento resultante para trazabilidad, no una referencia viva a Coupon.
  coupon_code: { type: String },
  discount_amount: { type: Number, default: 0 },
  // Snapshot de la direccion de entrega seleccionada al momento del checkout
  // (no una referencia viva a Address, para que la orden no cambie si el
  // usuario despues edita o borra esa direccion guardada).
  shippingAddress: {
    recipientName: { type: String },
    phone: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
  },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }]
}, { timestamps: true });

orderSchema.virtual('userDoc', {
  ref: 'User',
  localField: 'userId',
  foreignField: 'clerk_id',
  justOne: true
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

export const Order = model('Order', orderSchema);
