import express from 'express';
import pool from '../database/db.js';
import { predictRevenue, detectSeasonality, generateInsights } from '../services/aiInsights.js';

const router = express.Router();

async function getHistoricalRevenue() {
  const result = await pool.query(`
    SELECT 
      DATE_TRUNC('month', order_date) as month,
      SUM(total_amount) as revenue,
      COUNT(*) as orders
    FROM orders
    WHERE order_date >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', order_date)
    ORDER BY month ASC
  `);
  return result.rows;
}

async function getDashboardStats() {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM customers) as total_customers,
      (SELECT COUNT(*) FROM orders) as total_orders,
      (SELECT COUNT(*) FROM orders WHERE status IN ('pending','processing')) as active_orders,
      (SELECT COUNT(*) FROM tasks WHERE status IN ('pending','in_progress')) as pending_tasks
  `);
  return result.rows[0];
}

// GET /api/ai-insights/insights
router.get('/insights', async (req, res) => {
  try {
    const [rows, stats] = await Promise.all([getHistoricalRevenue(), getDashboardStats()]);

    const revenueValues = rows.map(r => parseFloat(r.revenue) || 0);
    const forecastData = predictRevenue(revenueValues);
    const seasonality = detectSeasonality(revenueValues);
    const insights = generateInsights(stats, forecastData, seasonality);

    res.json({ forecast: forecastData, seasonality, insights, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai-insights/forecast
router.get('/forecast', async (req, res) => {
  try {
    const rows = await getHistoricalRevenue();
    const revenueValues = rows.map(r => parseFloat(r.revenue) || 0);
    const forecastData = predictRevenue(revenueValues);

    // Build historical array for chart
    const historical = rows.map(r => ({
      month: new Date(r.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: parseFloat(r.revenue) || 0,
      orders: parseInt(r.orders) || 0,
      type: 'actual'
    }));

    // Build forecast array for chart
    const lastDate = rows.length > 0 ? new Date(rows[rows.length - 1].month) : new Date();
    const forecast = forecastData.forecast.map((value, i) => {
      const d = new Date(lastDate);
      d.setMonth(d.getMonth() + i + 1);
      return {
        month: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        predicted_revenue: value,
        confidence: forecastData.confidence,
        type: 'forecast'
      };
    });

    res.json({
      historical,
      forecast,
      trend: forecastData.trend,
      confidence: forecastData.confidence,
      accuracy: forecastData.confidence
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;