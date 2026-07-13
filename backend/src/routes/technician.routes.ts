import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getTechnicians, createTechnician, deleteTechnician } from '../controllers/technician.controller';
import { adminAuthMiddleware } from '../middlewares/auth.middleware';
import { createTechnicianSchema } from '../validators/technician.validator';

const technicianRoutes = new Hono();

technicianRoutes.get('/', adminAuthMiddleware, getTechnicians);
technicianRoutes.post(
  '/',
  adminAuthMiddleware,
  zValidator('json', createTechnicianSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 400);
    }
  }),
  createTechnician,
);
technicianRoutes.delete('/:id', adminAuthMiddleware, deleteTechnician);

export default technicianRoutes;