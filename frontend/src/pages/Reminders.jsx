import { useState, useEffect } from 'react';
import { useStore } from '../store/store.js';
import { Trash2, Plus, X, Bell, AlertCircle, Volume2 } from 'lucide-react';
import { playNotificationSound, showNotification, requestNotificationPermission } from '../utils/sound.js';

export default function Reminders() {
  const { reminders, tasks, customers, loadingReminders, fetchReminders, addReminder, deleteReminder } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [formData, setFormData] = useState({
    task_id: '',
    customer_id: '',
    title: '',
    message: '',
    reminder_time: '',
    sound_type: 'reminder',
  });

  useEffect(() => {
    fetchReminders();
    requestNotificationPermission();
    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkReminders = () => {
    reminders.forEach(reminder => {
      if (!reminder.is_sent && new Date(reminder.reminder_time) <= new Date()) {
        if (soundEnabled) {
          playNotificationSound(reminder.sound_type || 'reminder');
        }
        showNotification(`📌 ${reminder.title}`, {
          body: reminder.message || 'Reminder time!',
          icon: '🏢',
        });
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addReminder(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      task_id: '',
      customer_id: '',
      title: '',
      message: '',
      reminder_time: '',
      sound_type: 'reminder',
    });
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      await deleteReminder(id);
    }
  };

  const testSound = (soundType) => {
    playNotificationSound(soundType);
  };

  const isPending = (reminder) => {
    return !reminder.is_sent && new Date(reminder.reminder_time) <= new Date();
  };

  const isUpcoming = (reminder) => {
    return !reminder.is_sent && new Date(reminder.reminder_time) > new Date();
  };

  const pendingReminders = reminders.filter(isPending);
  const upcomingReminders = reminders.filter(isUpcoming);
  const sentReminders = reminders.filter(r => r.is_sent);

  if (loadingReminders && reminders.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading reminders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Reminders</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              className={`btn btn-small ${soundEnabled ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Sound ON' : 'Sound OFF'}
            >
              <Volume2 size={18} /> {soundEnabled ? 'Sound ON' : 'Sound OFF'}
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={20} /> Add Reminder
            </button>
          </div>
        </div>
      </div>

      {pendingReminders.length > 0 && (
        <div style={{ 
          background: 'rgba(220, 38, 38, 0.1)', 
          border: '2px solid #dc2626',
          borderRadius: '6px',
          padding: '15px',
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          color: '#dc2626'
        }}>
          <Bell size={20} />
          <div>
            <strong>{pendingReminders.length}</strong> pending reminder{pendingReminders.length > 1 ? 's' : ''} - Action needed!
          </div>
        </div>
      )}

      {/* Pending Reminders */}
      {pendingReminders.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#dc2626' }}>⚠️ Pending Reminders</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Task</th>
                  <th>Customer</th>
                  <th>Message</th>
                  <th>Reminder Time</th>
                  <th>Sound Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingReminders.map(reminder => (
                  <tr key={reminder.id} style={{ background: 'rgba(220, 38, 38, 0.05)' }}>
                    <td><strong>{reminder.title}</strong></td>
                    <td>{reminder.task_title || '-'}</td>
                    <td>{reminder.company_name || '-'}</td>
                    <td>{reminder.message ? reminder.message.substring(0, 30) : '-'}</td>
                    <td>{new Date(reminder.reminder_time).toLocaleString('en-IN')}</td>
                    <td>
                      <span className="badge badge-primary">
                        {reminder.sound_type || 'reminder'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-small btn-danger" onClick={() => handleDelete(reminder.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#2563eb' }}>📅 Upcoming Reminders</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Task</th>
                  <th>Customer</th>
                  <th>Message</th>
                  <th>Reminder Time</th>
                  <th>Sound Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingReminders.map(reminder => (
                  <tr key={reminder.id}>
                    <td><strong>{reminder.title}</strong></td>
                    <td>{reminder.task_title || '-'}</td>
                    <td>{reminder.company_name || '-'}</td>
                    <td>{reminder.message ? reminder.message.substring(0, 30) : '-'}</td>
                    <td>{new Date(reminder.reminder_time).toLocaleString('en-IN')}</td>
                    <td>
                      <span className="badge badge-primary">
                        {reminder.sound_type || 'reminder'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-small btn-danger" onClick={() => handleDelete(reminder.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sent Reminders */}
      {sentReminders.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '15px', color: '#16a34a' }}>✓ Sent Reminders</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Task</th>
                  <th>Customer</th>
                  <th>Message</th>
                  <th>Reminder Time</th>
                  <th>Sound Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sentReminders.slice(0, 5).map(reminder => (
                  <tr key={reminder.id} style={{ opacity: 0.6 }}>
                    <td><strong>{reminder.title}</strong></td>
                    <td>{reminder.task_title || '-'}</td>
                    <td>{reminder.company_name || '-'}</td>
                    <td>{reminder.message ? reminder.message.substring(0, 30) : '-'}</td>
                    <td>{new Date(reminder.reminder_time).toLocaleString('en-IN')}</td>
                    <td>
                      <span className="badge badge-success">
                        {reminder.sound_type || 'reminder'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-small btn-danger" onClick={() => handleDelete(reminder.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sentReminders.length > 5 && (
            <p style={{ marginTop: '10px', color: '#64748b', fontSize: '12px' }}>
              ... and {sentReminders.length - 5} more sent reminders
            </p>
          )}
        </div>
      )}

      {reminders.length === 0 && (
        <div className="empty-state">
          <h3>No reminders yet</h3>
          <p>Create your first reminder to never miss important tasks.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="modal-header">Create New Reminder</h3>
              <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Reminder Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Follow up with client"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Task</label>
                <select
                  name="task_id"
                  value={formData.task_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select a task</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Customer</label>
                <select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select a customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="message"
                  placeholder="Add reminder details..."
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Sound Type</label>
                <select
                  name="sound_type"
                  value={formData.sound_type}
                  onChange={handleInputChange}
                >
                  <option value="reminder">Reminder (Double Beep)</option>
                  <option value="success">Success (Ascending)</option>
                  <option value="alert">Alert (High Pitch)</option>
                </select>
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <button 
                    type="button"
                    className="btn btn-small btn-secondary"
                    onClick={() => testSound(formData.sound_type)}
                  >
                    🔊 Test Sound
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Reminder Time *</label>
                <input
                  type="datetime-local"
                  name="reminder_time"
                  value={formData.reminder_time}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}