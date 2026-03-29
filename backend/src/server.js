import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/db.js';

// Import routes
import customersRouter from './routes/customers.js';
import ordersRouter from './routes/orders.js';
import tasksRouter from './routes/tasks.js';
import remindersRouter from './routes/reminders.js';
import analyticsRouter from './routes/analytics.js';
import aiInsightsRouter from './routes/aiInsights.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://steel-crm.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Initialize database
initializeDatabase();

// Health check
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
  res.status(500).json({ error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`✅ Steel CRM Backend running on port ${PORT}`);
  console.log(`📊 API endpoints ready at http://localhost:${PORT}/api`);
});