import { z } from 'zod';

export const upsertInspectionSchema = z.object({
  checklist: z
    .array(
      z.object({
        aspect: z.string().min(1, 'El aspecto revisado es requerido'),
        result: z.string().min(1, 'El resultado es requerido'),
        passed: z.boolean().default(true),
      })
    )
    .min(1, 'La ficha debe incluir al menos un aspecto revisado'),
});
