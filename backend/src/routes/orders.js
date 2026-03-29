import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runAsync, allAsync, getAsync } from '../database/db.js';

const router = express.Router();

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await allAsync(`
      SELECT o.*, c.company_name, c.contact_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.order_date DESC
    `);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get orders by customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const orders = await allAsync(
      'SELECT * FROM orders WHERE customer_id = $1 ORDER BY order_date DESC',
      [req.params.customerId]
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const { customer_id, delivery_date, notes, items } = req.body;
    const order_id = uuidv4();

    let total_amount = 0;

    await runAsync(
      `INSERT INTO orders (id, customer_id, delivery_date, notes, total_amount)
       VALUES ($1, $2, $3, $4, $5)`,
      [order_id, customer_id, delivery_date, notes, 0]
    );

    if (items && items.length > 0) {
      for (const item of items) {
        const item_id = uuidv4();
        const total_price = item.quantity * item.unit_price;
        total_amount += total_price;

        await runAsync(
          `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [item_id, order_id, item.product_id, item.quantity, item.unit_price, total_price]
        );
      }
    }

    await runAsync(
      'UPDATE orders SET total_amount = $1 WHERE id = $2',
      [total_amount, order_id]
    );

    res.status(201).json({ id: order_id, message: 'Order created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status
router.put('/:id', async (req, res) => {
  try {
    const { status, delivery_date, notes } = req.body;

    await runAsync(
      `UPDATE orders 
       SET status = $1, delivery_date = $2, notes = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [status, delivery_date, notes, req.params.id]
    );

    res.json({ message: 'Order updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    await runAsync('DELETE FROM order_items WHERE order_id = $1', [req.params.id]);
    await runAsync('DELETE FROM orders WHERE id = $1', [req.params.id]);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;