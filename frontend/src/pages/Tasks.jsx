import { useState, useMemo } from 'react';
import { Trash2, Plus, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { useStore } from '../store/store.js';
import SearchFilter from '../components/SearchFilter';

const PRIORITY_COLORS = {
  high: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  medium: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  low: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
};

export default function Tasks() {
  const { tasks, customers, addTask, updateTask, deleteTask } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterState, setFilterState] = useState({});
  const [formData, setFormData] = useState({
    title: '', description: '', customer_id: '',
    assigned_to: '', priority: 'medium', due_date: '', status: 'pending'
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const searchTerm = filterState.searchTerm?.toLowerCase() || '';
      const matchesSearch = task.title?.toLowerCase().includes(searchTerm) || task.description?.toLowerCase().includes(searchTerm);
      const matchesStatus = !filterState.status || task.status === filterState.status;
      const matchesPriority = !filterState.priority || task.priority === filterState.priority;
      return matchesSearch && matchesStatus && matchesPriority;
    }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }, [tasks, filterState]);

  const reset = () => ({ title: '', description: '', customer_id: '', assigned_to: '', priority: 'medium', due_date: '', status: 'pending' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.due_date) return alert('Title and due date are required');
    try {
      if (editingId) { await updateTask(editingId, formData); setEditingId(null); }
      else await addTask(formData);
      setFormData(reset());
      setShowForm(false);
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleEdit = (task) => { setFormData(task); setEditingId(task.id); setShowForm(true); };
  const handleCancel = () => { setShowForm(false); setEditingId(null); setFormData(reset()); };
  const handleDelete = async (id) => { if (confirm('Delete this task?')) await deleteTask(id); };

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(task.id, { ...task, status: newStatus });
  };

  const isOverdue = (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed';

  const pending = filteredTasks.filter(t => t.status !== 'completed');
  const completed = filteredTasks.filter(t => t.status === 'completed');

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">✓ Tasks</h2>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {pending.length} pending · {completed.length} completed
            </div>
          </div>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus size={16} /> New Task
          </button>
        </div>

        <SearchFilter onFilter={setFilterState} filterOptions={{
          status: ['pending', 'in_progress', 'completed'],
          priority: ['high', 'medium', 'low'],
        }} />

        {/* FORM */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 440 }}>
              <div className="modal-header">{editingId ? '✏️ Edit Task' : '✅ New Task'}</div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>What needs to be done? *</label>
                  <input type="text" value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Follow up with Rajesh on payment" required autoFocus />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Priority</label>
                    <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                      <option value="high">🔴 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Due Date *</label>
                    <input type="date" value={formData.due_date}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={e => setFormData({ ...formData, due_date: e.target.value })} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Customer (optional)</label>
                  <select value={formData.customer_id} onChange={e => setFormData({ ...formData, customer_id: e.target.value })}>
                    <option value="">No customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                </div>

                {editingId && (
                  <div className="form-group">
                    <label>Status</label>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                )}

                <div className="modal-footer">
                  <button type="button" onClick={handleCancel} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'} Task</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TASK LIST */}
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks yet</h3>
            <p>Add your first task to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Pending tasks */}
            {pending.map(task => {
              const p = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
              const overdue = isOverdue(task);
              return (
                <div key={task.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 10,
                  border: `1px solid ${overdue ? '#fecaca' : '#e2e8f0'}`,
                  background: overdue ? '#fff5f5' : '#fff',
                  transition: 'all 0.15s'
                }}>
                  <button onClick={() => toggleComplete(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', flexShrink: 0 }}>
                    <Circle size={20} />
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: overdue ? '#dc2626' : '#64748b', marginTop: 2 }}>
                      {overdue ? '⚠️ Overdue · ' : ''}
                      Due {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      {task.customer_id && customers.find(c => c.id === task.customer_id) &&
                        ` · ${customers.find(c => c.id === task.customer_id).company_name}`}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: p.bg, color: p.color, border: `1px solid ${p.border}`, whiteSpace: 'nowrap' }}>
                    {task.priority}
                  </span>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => handleEdit(task)} className="btn btn-secondary btn-small" title="Edit">✏️</button>
                    <button onClick={() => handleDelete(task.id)} className="btn btn-danger btn-small" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}

            {/* Completed tasks */}
            {completed.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '8px 0 4px' }}>
                  Completed ({completed.length})
                </div>
                {completed.map(task => (
                  <div key={task.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 16px', borderRadius: 10,
                    border: '1px solid #e2e8f0', background: '#f8fafc', opacity: 0.7
                  }}>
                    <button onClick={() => toggleComplete(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: 0, display: 'flex', flexShrink: 0 }}>
                      <CheckCircle2 size={20} />
                    </button>
                    <div style={{ flex: 1, fontSize: 13, color: '#64748b', textDecoration: 'line-through' }}>{task.title}</div>
                    <button onClick={() => handleDelete(task.id)} className="btn btn-danger btn-small"><Trash2 size={14} /></button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}