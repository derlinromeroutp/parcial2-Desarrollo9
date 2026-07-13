import { Schema, model } from 'mongoose';

const wishlistItemSchema = new Schema({
  userId: { type: String, required: true, index: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  note: { type: String, default: '' },
}, { timestamps: true });

wishlistItemSchema.index({ userId: 1, product: 1 }, { unique: true });

export const WishlistItem = model('WishlistItem', wishlistItemSchema);
