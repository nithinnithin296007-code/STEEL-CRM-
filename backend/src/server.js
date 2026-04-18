import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initializeDatabase } from './database/db.js';

import customersRouter from './routes/customers.js';
import ordersRouter from './routes/orders.js';
import tasksRouter from './routes/tasks.js';
import remindersRouter from './routes/reminders.js';
import analyticsRouter from './routes/analytics.js';
import aiInsightsRouter from './routes/aiInsights.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Helmet — secure HTTP headers
app.use(helmet());

// 2. CORS — locked to trusted origins only
app.use(cors({
  origin: ['https://steel-crm.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// 3. Request size limit — prevent large payload attacks
app.use(express.json({ limit: '10kb' }));

// 4. Rate limiting — max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Stricter limiter for write operations
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);
app.use('/api/customers', writeLimiter);
app.use('/api/orders', writeLimiter);
app.use('/api/tasks', writeLimiter);
app.use('/api/reminders', writeLimiter);

// Initialize database
initializeDatabase();

// Health check — exempt from rate limit
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai-insights', aiInsightsRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`✅ Steel CRM Backend running on port ${PORT}`);
  console.log(`🔒 Security: Helmet + Rate Limiting + Payload Protection active`);
});