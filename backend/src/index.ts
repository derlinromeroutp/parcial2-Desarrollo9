import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { connectDB } from './db/connection';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import healthRoutes from './routes/health.routes';
import productRoutes from './routes/product.routes';
import checkoutRoutes from './routes/checkout.routes';
import uploadRoutes from './routes/upload.routes';
import warrantyRoutes from './routes/warranty.routes';
import webhookRoutes from './routes/webhook.routes';
import orderRoutes from './routes/order.routes';
import authRoutes from './routes/auth.routes';
import technicianRoutes from './routes/technician.routes';
import addressRoutes from './routes/address.routes';
import wishlistRoutes from './routes/wishlist.routes';
import e2eRoutes from './routes/e2e.routes';
import { isE2ETestMode } from './lib/e2e';

const app = new Hono();

// Global Middlewares
app.use('/*', cors());
app.use('/*', requestIdMiddleware);
app.use('/*', requestLogger);

// Attempt to connect to DB
connectDB();

// Metrics endpoint
app.get('/api/metrics', metricsHandler);

// Register routes
app.route('/api/health', healthRoutes);
app.route('/api/products', productRoutes);
app.route('/api/checkout', checkoutRoutes);
app.route('/api/uploads', uploadRoutes);
app.route('/api/warranties', warrantyRoutes);
app.route('/api/webhooks', webhookRoutes);
app.route('/api/orders', orderRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/technicians', technicianRoutes);
app.route('/api/addresses', addressRoutes);
app.route('/api/wishlist', wishlistRoutes);
if (isE2ETestMode) {
  app.route('/api/e2e', e2eRoutes);
}

// Global error handler (must be after routes)
app.onError(errorHandler);
app.notFound(notFoundHandler);

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
