import { Schema, model } from 'mongoose';

const wishlistItemSchema = new Schema({
  userId: { type: String, required: true, index: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  note: { type: String, default: '' },
  // Precio del producto en el momento en que se agregó a la lista de deseos,
  // usado para detectar si bajó de precio desde entonces (HU-52).
  priceAtAdded: { type: Number, required: true },
}, { timestamps: true });

wishlistItemSchema.index({ userId: 1, product: 1 }, { unique: true });

export const WishlistItem = model('WishlistItem', wishlistItemSchema);
