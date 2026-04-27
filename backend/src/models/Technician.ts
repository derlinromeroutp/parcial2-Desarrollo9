import { Schema, model } from 'mongoose';

const technicianSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  specialties: [{ type: String }],
  active: { type: Boolean, default: true },
  clerkId: { type: String, sparse: true, unique: true },
}, { timestamps: true });

export const Technician = model('Technician', technicianSchema);