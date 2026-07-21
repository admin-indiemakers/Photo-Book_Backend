import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './src/routes/auth.routes.js';
import productsRoutes from './src/routes/products.routes.js';
import ordersRoutes from './src/routes/orders.routes.js';
import customersRoutes from './src/routes/customers.routes.js';
import cartsRoutes from './src/routes/carts.routes.js';
import dashboardRoutes from './src/routes/dashboard.routes.js';
import templatesRoutes from './src/routes/templates.routes.js';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin || 
        origin.startsWith('http://localhost:') || 
        origin === process.env.ADMIN_FRONTEND_URL ||
        origin.includes('vercel.app')
      ) {
        callback(null, true);
      } else {
        // Return false instead of an Error so it doesn't crash with a 500
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Basic rate limiting on the login endpoint to slow down brute force attempts.
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/auth/login', loginLimiter);

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/carts', cartsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.send('<h1>PhotoBook Backend API is Running</h1>');
});

app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 PhotoLab admin API running on http://localhost:${PORT}`);
  });
}

export default app;
// Watcher trigger
