import { Hono } from 'hono';
import { createWarrantyReport, getMyWarranties, updateWarrantyStatus, getAllWarranties, assignTechnician, getAssignedWarranties, technicianUpdateWarranty } from '../controllers/warranty.controller';
import { clerkAuthMiddleware, adminAuthMiddleware, technicianAuthMiddleware } from '../middlewares/auth.middleware';
import { zValidator } from '@hono/zod-validator';
import { createWarrantySchema, updateStatusSchema } from '../validators/warranty.validator';

const warrantyRoutes = new Hono();

// Rutas de Usuario
warrantyRoutes.post('/', clerkAuthMiddleware, zValidator('json', createWarrantySchema), createWarrantyReport);
warrantyRoutes.get('/mine', clerkAuthMiddleware, getMyWarranties);

// Rutas de Técnico
warrantyRoutes.get('/assigned', technicianAuthMiddleware, getAssignedWarranties);
warrantyRoutes.patch('/:id/tech-update', technicianAuthMiddleware, technicianUpdateWarranty);

// Rutas de Administrador
warrantyRoutes.get('/', adminAuthMiddleware, getAllWarranties);
warrantyRoutes.put('/:id/status', adminAuthMiddleware, zValidator('json', updateStatusSchema), updateWarrantyStatus);
warrantyRoutes.put('/:id/assign', adminAuthMiddleware, assignTechnician);

export default warrantyRoutes;
