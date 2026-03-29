import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runAsync, allAsync, getAsync } from '../database/db.js';

const router = express.Router();

// Get all reminders
router.get('/', async (req, res) => {
  try {
    const reminders = await allAsync(`
      SELECT r.*, t.title as task_title, c.company_name
      FROM reminders r
      LEFT JOIN tasks t ON r.task_id = t.id
      LEFT JOIN customers c ON r.customer_id = c.id
      ORDER BY r.reminder_time ASC
    `);
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending reminders
router.get('/pending', async (req, res) => {
  try {
    const reminders = await allAsync(`
      SELECT r.*, t.title as task_title, c.company_name
      FROM reminders r
      LEFT JOIN tasks t ON r.task_id = t.id
      LEFT JOIN customers c ON r.customer_id = c.id
      WHERE r.is_sent = 0 AND r.reminder_time <= datetime('now')
      ORDER BY r.reminder_time ASC
    `);
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create reminder
router.post('/', async (req, res) => {
  try {
    const { task_id, customer_id, title, message, reminder_time } = req.body;
    const id = uuidv4();

    await runAsync(
      `INSERT INTO reminders (id, task_id, customer_id, title, message, reminder_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, task_id, customer_id, title, message, reminder_time]
    );

    res.status(201).json({ id, message: 'Reminder created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark reminder as sent
router.put('/:id/sent', async (req, res) => {
  try {
    await runAsync(
      'UPDATE reminders SET is_sent = 1 WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Reminder marked as sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete reminder
router.delete('/:id', async (req, res) => {
  try {
    await runAsync('DELETE FROM reminders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Reminder deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;