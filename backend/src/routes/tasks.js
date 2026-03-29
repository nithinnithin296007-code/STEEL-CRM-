import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runAsync, allAsync, getAsync } from '../database/db.js';

const router = express.Router();

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await allAsync(`
      SELECT t.*, c.company_name
      FROM tasks t
      LEFT JOIN customers c ON t.customer_id = c.id
      ORDER BY t.due_date ASC
    `);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tasks by customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const tasks = await allAsync(
      'SELECT * FROM tasks WHERE customer_id = $1 ORDER BY due_date ASC',
      [req.params.customerId]
    );
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const { title, description, customer_id, assigned_to, priority, due_date } = req.body;
    const id = uuidv4();

    await runAsync(
      `INSERT INTO tasks (id, title, description, customer_id, assigned_to, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, title, description, customer_id, assigned_to, priority, due_date]
    );

    res.status(201).json({ id, message: 'Task created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, due_date, assigned_to } = req.body;

    await runAsync(
      `UPDATE tasks 
       SET title = $1, description = $2, status = $3, priority = $4, due_date = $5, assigned_to = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [title, description, status, priority, due_date, assigned_to, req.params.id]
    );

    res.json({ message: 'Task updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    await runAsync('DELETE FROM reminders WHERE task_id = $1', [req.params.id]);
    await runAsync('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;