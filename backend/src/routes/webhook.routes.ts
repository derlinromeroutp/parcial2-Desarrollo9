import { Hono } from 'hono';
import { clerkWebhookController } from '../controllers/webhook.controller';

const webhookRoutes = new Hono();

webhookRoutes.post('/clerk', clerkWebhookController);

export default webhookRoutes;
