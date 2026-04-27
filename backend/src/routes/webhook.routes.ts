import { Hono } from 'hono';
import { clerkWebhookController, stripeWebhookController } from '../controllers/webhook.controller';

const webhookRoutes = new Hono();

webhookRoutes.post('/clerk', clerkWebhookController);
webhookRoutes.post('/stripe', stripeWebhookController);

export default webhookRoutes;
