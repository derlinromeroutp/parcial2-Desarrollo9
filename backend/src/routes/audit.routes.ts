import { Hono } from 'hono';
import { getAuditLogs } from '../controllers/audit.controller';
import { adminAuthMiddleware } from '../middlewares/auth.middleware';

const auditRoutes = new Hono();

auditRoutes.get('/', adminAuthMiddleware, getAuditLogs);

export default auditRoutes;
