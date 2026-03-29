import express from 'express';
import { allAsync } from '../database/db.js';
import { predictRevenue, detectSeasonality, generateInsights } from '../services/aiInsights.js';

const router = express.Router();

// Get AI insights
router.get('/insights', async (req, res) => {
  try {
    // Get revenue data
    const revenueRes = await allAsync(`
      SELECT 
        DATE_TRUNC('month', order_date) as month,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      GROUP BY DATE_TRUNC('month', order_date)
      ORDER BY month DESC
      LIMIT 24
    `);

    const monthlyRevenue = revenueRes.map(item => parseFloat(item.revenue)).reverse();

    // Get stats
    const statsRes = await allAsync(`
      SELECT 
        COUNT(DISTINCT id) as total_customers,
        (SELECT COUNT(*) FROM orders) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM customers
    `);

    const stats = statsRes[0];

    // Generate predictions
    const forecast = predictRevenue(monthlyRevenue);
    const seasonality = detectSeasonality(monthlyRevenue);
    const insights = generateInsights(stats, forecast, seasonality);

    res.json({
      forecast,
      seasonality,
      insights,
      stats,
      confidence: forecast.confidence,
      nextMonthsRevenue: forecast.forecast
    });
  } catch (err) {
    console.error('AI Insights error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get detailed forecast
router.get('/forecast', async (req, res) => {
  try {
    const revenueRes = await allAsync(`
      SELECT 
        DATE_TRUNC('month', order_date) as month,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
      FROM orders
      GROUP BY DATE_TRUNC('month', order_date)
      ORDER BY month DESC
      LIMIT 12
    `);

    const monthlyData = revenueRes.reverse();
    const revenues = monthlyData.map(item => parseFloat(item.revenue));

    const forecast = predictRevenue(revenues);

    // Format response with months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();

    const forecastData = forecast.forecast.map((revenue, idx) => {
      const monthIndex = (currentDate.getMonth() + idx + 1) % 12;
      return {
        month: monthNames[monthIndex],
        predicted_revenue: revenue,
        confidence: forecast.confidence
      };
    });

    res.json({
      historical: monthlyData,
      forecast: forecastData,
      trend: forecast.trend,
      accuracy: forecast.confidence
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;