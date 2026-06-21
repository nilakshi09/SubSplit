import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

import { env } from './config/env.js';
import { subscriptionRoutes } from './routes/subscriptions.js';
import { groupRoutes } from './routes/groups.js';
import { splitRoutes } from './routes/splits.js';
import { authRoutes } from './routes/auth.js';
import { balanceRoutes } from './routes/balances.js';
import { settlementRoutes } from './routes/settlements.js';
import { notificationRoutes } from './routes/notifications.js';
import { paymentRoutes } from './routes/payments.js';
import { authLimiter, apiLimiter } from './middleware/rateLimiter.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { supabaseAdmin } from './utils/supabase.js';

const app = express();

// Trust first proxy (needed for correct client IP in rate limiting behind reverse proxies)
app.set('trust proxy', 1);

// Security & parsing middleware
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    const { error } = await supabaseAdmin.from('users').select('id').limit(1);
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: error ? 'error' : 'ok',
      version: '1.0.0',
    });
  } catch {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), database: 'unknown' });
  }
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/subscriptions', apiLimiter, subscriptionRoutes);
app.use('/api/groups', apiLimiter, groupRoutes);
app.use('/api/splits', apiLimiter, splitRoutes);
app.use('/api', apiLimiter, balanceRoutes);
app.use('/api/settlements', apiLimiter, settlementRoutes);
app.use('/api/notifications', apiLimiter, notificationRoutes);
app.use('/api/payments', apiLimiter, paymentRoutes);

// Global error handler (must be last)
app.use(globalErrorHandler);

app.listen(env.PORT, () => {
  console.log(`🚀 SubSplit API running on http://localhost:${env.PORT}`);
});
