import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { subscriptionRoutes } from './routes/subscriptions.js';
import { groupRoutes } from './routes/groups.js';
import { authRoutes } from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/groups', groupRoutes);

app.listen(PORT, () => {
  console.log(`🚀 SubSplit API running on http://localhost:${PORT}`);
});
