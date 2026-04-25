import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  condition: { type: String, enum: ['A', 'B', 'C'], required: true },
  category: { type: String, enum: ['celular', 'laptop', 'pc', 'auriculares', 'tablet'], required: true },
  image_urls: [{ type: String }],
}, { timestamps: true });

export const Product = model('Product', productSchema);