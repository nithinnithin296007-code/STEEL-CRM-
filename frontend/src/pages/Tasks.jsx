import { useState, useMemo } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useStore } from '../store/store.js';
import SearchFilter from '../components/SearchFilter.jsx';

export default function Tasks() {
  const { tasks, customers, addTask, updateTask, deleteTask } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterState, setFilterState] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customer_id: '',
    assigned_to: '',
    priority: 'medium',
    due_date: '',
    status: 'pending'
  });

  // Filter logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const searchTerm = filterState.searchTerm?.toLowerCase() || '';
      const matchesSearch =
        (task.title?.toLowerCase().includes(searchTerm) || '') ||
        (task.description?.toLowerCase().includes(searchTerm) || '');

      const matchesStatus = !filterState.status || task.status === filterState.status;
      const matchesPriority = !filterState.priority || task.priority === filterState.priority;

      if (filterState.dateFrom && new Date(task.due_date) < new Date(filterState.dateFrom)) {
        return false;
      }
      if (filterState.dateTo && new Date(task.due_date) > new Date(filterState.dateTo)) {
        return false;
      }

      return matchesSearch && matchesStatus && matchesPriority;
    }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }, [tasks, filterState]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.due_date) {
      alert('Please fill required fields');
      return;
    }

    try {
      if (editingId) {
        await updateTask(editingId, formData);
        setEditingId(null);
      } else {
        await addTask(formData);
      }

      setFormData({
        title: '',
        description: '',
        customer_id: '',
        assigned_to: '',
        priority: 'medium',
        due_date: '',
        status: 'pending'
      });
      setShowForm(false);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (task) => {
    setFormData(task);
    setEditingId(task.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this task?')) {
      try {
        await deleteTask(id);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      customer_id: '',
      assigned_to: '',
      priority: 'medium',
      due_date: '',
      status: 'pending'
    });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && dueDate;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'badge-danger';
      case 'medium':
        return 'badge-warning';
      case 'low':
        return 'badge-primary';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'in_progress':
        return 'badge-primary';
      case 'completed':
        return 'badge-success';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">✓ Tasks ({filteredTasks.length})</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            <Plus size={18} /> New Task
          </button>
        </div>

        {/* SEARCH & FILTER */}
        <SearchFilter
          onFilter={setFilterState}
          filterOptions={{
            status: ['pending', 'in_progress', 'completed'],
            priority: ['high', 'medium', 'low'],
            dateFrom: true,
            dateTo: true
          }}
        />

        {/* ADD/EDIT FORM */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                {editingId ? '✏️ Edit Task' : '➕ New Task'}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Task title..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Task details..."
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Customer</label>
                  <select
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  >
                    <option value="">Select Customer (Optional)</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Assigned To</label>
                  <input
                    type="text"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    placeholder="Person name..."
                  />
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Due Date *</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update' : 'Create'} Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TASKS TABLE */}
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks found</h3>
            <p>Create your first task to get started.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id} style={{ opacity: isOverdue(task.due_date) && task.status !== 'completed' ? 0.7 : 1 }}>
                    <td className="fw-600">{task.title}</td>
                    <td>
                      <span className={`badge ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>
                      {isOverdue(task.due_date) && task.status !== 'completed' && (
                        <span style={{ color: 'var(--danger)', marginRight: '8px' }}>⚠️</span>
                      )}
                      {new Date(task.due_date).toLocaleDateString('en-IN')}
                    </td>
                    <td>{task.assigned_to || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(task)}
                          className="btn btn-secondary btn-small"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="btn btn-danger btn-small"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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