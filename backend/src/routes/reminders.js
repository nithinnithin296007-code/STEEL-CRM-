// Create reminder
router.post('/', async (req, res) => {
  try {
    const { task_id, customer_id, title, message, reminder_time, sound_type } = req.body;
    const id = uuidv4();

    if (!title || !reminder_time) {
      return res.status(400).json({ error: 'Title and reminder_time are required' });
    }

    await runAsync(
      `INSERT INTO reminders (id, task_id, customer_id, title, message, reminder_time, sound_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id, 
        task_id || null, 
        customer_id || null, 
        title, 
        message || null, 
        reminder_time, 
        sound_type || 'reminder'
      ]
    );

    res.status(201).json({ id, message: 'Reminder created successfully' });
  } catch (err) {
    console.error('Reminder creation error:', err);
    res.status(500).json({ error: err.message });
  }
});