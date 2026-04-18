import { useState, useMemo } from 'react';
import { Edit, Trash2, Plus, Volume2, VolumeX } from 'lucide-react';
import { useStore } from '../store/store.js';
import SearchFilter from '../components/SearchFilter';
import { playNotificationSound } from '../utils/sound.js';

export default function Reminders() {
  const { reminders, tasks, customers, addReminder, deleteReminder } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [filterState, setFilterState] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const resetForm = {
    customer_id: '',
    title: '',
    message: '',
    reminder_time: '',
    reminder_date: '',
    reminder_hour: '09:00',
    sound_type: 'reminder'
  };

  const [formData, setFormData] = useState(resetForm);

  // Filter logic
  const filteredReminders = useMemo(() => {
    return reminders.filter(reminder => {
      const searchTerm = filterState.searchTerm?.toLowerCase() || '';
      const matchesSearch =
        (reminder.title?.toLowerCase().includes(searchTerm) || '') ||
        (reminder.message?.toLowerCase().includes(searchTerm) || '');

      const matchesStatus = !filterState.status || (filterState.status === 'pending' ? !reminder.is_sent : reminder.is_sent);

      if (filterState.dateFrom && new Date(reminder.reminder_time) < new Date(filterState.dateFrom)) {
        return false;
      }
      if (filterState.dateTo && new Date(reminder.reminder_time) > new Date(filterState.dateTo)) {
        return false;
      }

      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.reminder_time) - new Date(a.reminder_time));
  }, [reminders, filterState]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.reminder_time) {
      alert('Please fill required fields');
      return;
    }

    try {
      await addReminder(formData);
      setFormData(resetForm);
      setShowForm(false);
      
      if (soundEnabled) {
        playNotificationSound('success');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this reminder?')) {
      try {
        await deleteReminder(id);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData(resetForm);
  };

  const playSound = (soundType) => {
    if (soundEnabled) {
      playNotificationSound(soundType || 'reminder');
    }
  };

  const getTaskTitle = (taskId) => {
    return tasks.find(t => t.id === taskId)?.title || 'N/A';
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🔔 Reminders ({filteredReminders.length})</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`btn ${soundEnabled ? 'btn-primary' : 'btn-secondary'}`}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              {soundEnabled ? 'Sound ON' : 'Sound OFF'}
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary"
            >
              <Plus size={18} /> Add Reminder
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <SearchFilter
          onFilter={setFilterState}
          filterOptions={{
            status: ['pending', 'sent'],
            dateFrom: true,
            dateTo: true
          }}
        />

        {showForm && (
          <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 420 }}>
              <div className="modal-header">🔔 New Reminder</div>
              <form onSubmit={handleSubmit}>

                <div className="form-group">
                  <label>What to remind? *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Collect payment from Rajesh"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>When? *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <input
                      type="date"
                      value={formData.reminder_date || ''}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value, reminder_time: `${e.target.value}T${formData.reminder_hour || '09:00'}` })}
                      required
                      style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }}
                    />
                    <select
                      value={formData.reminder_hour || '09:00'}
                      onChange={(e) => setFormData({ ...formData, reminder_hour: e.target.value, reminder_time: `${formData.reminder_date || ''}T${e.target.value}` })}
                      style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }}
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const h = String(i).padStart(2, '0');
                        const label = i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`;
                        return <option key={h} value={`${h}:00`}>{label}</option>;
                      })}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Customer (optional)</label>
                  <select
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }}
                  >
                    <option value="">No customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name}</option>
                    ))}
                  </select>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={handleCancel} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Reminder</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* REMINDERS TABLE */}
        {filteredReminders.length === 0 ? (
          <div className="empty-state">
            <h3>No reminders found</h3>
            <p>Create your first reminder to get started.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Task</th>
                  <th>Reminder Time</th>
                  <th>Status</th>
                  <th>Sound</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReminders.map((reminder) => (
                  <tr key={reminder.id}>
                    <td className="fw-600">{reminder.title}</td>
                    <td>{reminder.task_id ? getTaskTitle(reminder.task_id) : '-'}</td>
                    <td>{new Date(reminder.reminder_time).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${reminder.is_sent ? 'badge-success' : 'badge-warning'}`}>
                        {reminder.is_sent ? 'Sent' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => playSound(reminder.sound_type)}
                        className="btn btn-secondary btn-small"
                        title="Play Sound"
                      >
                        🔊 {reminder.sound_type}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(reminder.id)}
                        className="btn btn-danger btn-small"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .fw-600 {
          font-weight: 600;
        }
      `}</style>
    </>
  );
}