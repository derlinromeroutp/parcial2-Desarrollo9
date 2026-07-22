import { Schema, model } from 'mongoose';

const auditLogSchema = new Schema(
  {
    userId: { type: String, required: true },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  // Un log de auditoria es un hecho puntual; solo interesa cuando ocurrio,
  // no una fecha de "actualizacion" (los registros nunca se editan).
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = model('AuditLog', auditLogSchema);
