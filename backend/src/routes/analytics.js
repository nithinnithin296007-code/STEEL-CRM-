import express from 'express';
import { allAsync } from '../database/db.js';

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalCustomers = await allAsync('SELECT COUNT(*) as count FROM customers');
    const activeOrders = await allAsync("SELECT COUNT(*) as count FROM orders WHERE status != 'completed'");
    const totalRevenue = await allAsync('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders');
    const pendingTasks = await allAsync("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'");

    res.json({
      total_customers: totalCustomers[0]?.count || 0,
      active_orders: activeOrders[0]?.count || 0,
      total_revenue: parseFloat(totalRevenue[0]?.total) || 0,
      pending_tasks: pendingTasks[0]?.count || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get monthly revenue
router.get('/revenue', async (req, res) => {
  try {
    const data = await allAsync(`
      SELECT 
        DATE_TRUNC('month', order_date) as month,
        SUM(total_amount) as revenue,
        COUNT(*) as orders
      FROM orders
      GROUP BY DATE_TRUNC('month', order_date)
      ORDER BY month DESC
      LIMIT 12
    `);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order status breakdown
router.get('/orders-by-status', async (req, res) => {
  try {
    const data = await allAsync(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get top customers by revenue
router.get('/top-customers', async (req, res) => {
  try {
    const data = await allAsync(`
      SELECT 
        c.id,
        c.company_name,
        c.contact_name,
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COUNT(o.id) as order_count
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      GROUP BY c.id, c.company_name, c.contact_name
      ORDER BY total_revenue DESC
      LIMIT 10
    `);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;