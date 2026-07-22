import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  condition: { type: String, enum: ['A', 'B', 'C'], required: true },
  category: { type: String, enum: ['celular', 'laptop', 'pc', 'auriculares', 'tablet'], required: true },
  image_urls: [{ type: String }],
  // Porcentaje de salud de bateria (HU-47). Solo aplica a productos con
  // bateria; se deja sin definir en vez de 0 para no sugerir un dato falso.
  battery_health: { type: Number, min: 0, max: 100 },
}, { timestamps: true });

export const Product = model('Product', productSchema);