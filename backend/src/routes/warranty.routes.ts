import { Hono } from 'hono';
import { createWarrantyReport, getMyWarranties, updateWarrantyStatus, getAllWarranties, assignTechnician, getAssignedWarranties, technicianUpdateWarranty } from '../controllers/warranty.controller';
import { clerkAuthMiddleware, adminAuthMiddleware, technicianAuthMiddleware } from '../middlewares/auth.middleware';
import { zValidator } from '@hono/zod-validator';
import { createWarrantySchema, updateStatusSchema } from '../validators/warranty.validator';
import { assignTechnicianSchema, techUpdateWarrantySchema } from '../validators/technician.validator';

const warrantyRoutes = new Hono();

warrantyRoutes.post('/', clerkAuthMiddleware, zValidator('json', createWarrantySchema, (result, c) => {
  if (!result.success) return c.json({ success: false, errors: result.error.errors }, 400);
}), createWarrantyReport);
warrantyRoutes.get('/mine', clerkAuthMiddleware, getMyWarranties);

warrantyRoutes.get('/assigned', technicianAuthMiddleware, getAssignedWarranties);
warrantyRoutes.patch('/:id/tech-update', technicianAuthMiddleware, zValidator('json', techUpdateWarrantySchema, (result, c) => {
  if (!result.success) return c.json({ success: false, errors: result.error.errors }, 400);
}), technicianUpdateWarranty);

warrantyRoutes.get('/', adminAuthMiddleware, getAllWarranties);
warrantyRoutes.put('/:id/status', adminAuthMiddleware, zValidator('json', updateStatusSchema, (result, c) => {
  if (!result.success) return c.json({ success: false, errors: result.error.errors }, 400);
}), updateWarrantyStatus);
warrantyRoutes.put('/:id/assign', adminAuthMiddleware, zValidator('json', assignTechnicianSchema, (result, c) => {
  if (!result.success) return c.json({ success: false, errors: result.error.errors }, 400);
}), assignTechnician);

export default warrantyRoutes;
