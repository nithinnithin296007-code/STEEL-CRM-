import express from 'express';

const router = express.Router();

// Get AI insights
router.get('/insights', (req, res) => {
  try {
    res.json({
      forecast: {
        trend: 'growing',
        confidence: 78,
        monthlyGrowth: 8
      },
      seasonality: { 
        pattern: 'stable', 
        seasonality: 0 
      },
      insights: [
        { 
          type: 'info', 
          title: '📊 AI Ready!', 
          message: 'Add more orders to get better predictions.' 
        }
      ],
      stats: { 
        total_customers: 0, 
        total_orders: 0,
        active_orders: 0,
        pending_tasks: 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get forecast
router.get('/forecast', (req, res) => {
  try {
    res.json({
      historical: [],
      forecast: [
        { month: 'Apr', predicted_revenue: 50000, confidence: 78 },
        { month: 'May', predicted_revenue: 54000, confidence: 78 },
        { month: 'Jun', predicted_revenue: 58000, confidence: 78 }
      ],
      trend: 'growing',
      accuracy: 78
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;