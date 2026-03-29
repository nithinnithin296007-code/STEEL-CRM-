// Create reminder
router.post('/', async (req, res) => {
  try {
    const { title, reminder_time, message, sound_type } = req.body;
    
    if (!title || !reminder_time) {
      return res.status(400).json({ error: 'Title and reminder_time are required' });
    }

    const id = uuidv4();
    const task_id = null;
    const customer_id = null;

    await runAsync(
      `INSERT INTO reminders (id, task_id, customer_id, title, message, reminder_time, sound_type, is_sent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false)`,
      [id, task_id, customer_id, title, message || '', reminder_time, sound_type || 'reminder']
    );

    res.status(201).json({ id, message: 'Reminder created successfully' });
  } catch (err) {
    console.error('Reminder error:', err);
    res.status(500).json({ error: err.message });
  }
});