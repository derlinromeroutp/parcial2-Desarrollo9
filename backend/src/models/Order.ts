import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
  userId: { type: String, required: true },
  total_amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'shipped', 'failed'], default: 'pending' },
  // Legacy field — kept for back-compat with old hosted-checkout orders.
  stripe_session_id: { type: String, index: true },
  // New field — used by embedded Payment Element flow.
  payment_intent_id: { type: String, index: true },
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
