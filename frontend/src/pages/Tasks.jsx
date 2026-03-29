import { useState, useEffect } from 'react';
import { useStore } from '../store/store.js';
import { Trash2, Edit, Plus, X, AlertCircle } from 'lucide-react';

export default function Tasks() {
  const { tasks, customers, loadingTasks, fetchTasks, addTask, updateTask, deleteTask } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customer_id: '',
    assigned_to: 'unassigned',
    priority: 'medium',
    due_date: '',
    status: 'pending',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateTask(editingId, formData);
    } else {
      await addTask(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      customer_id: '',
      assigned_to: 'unassigned',
      priority: 'medium',
      due_date: '',
      status: 'pending',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (task) => {
    setFormData({
      title: task.title,
      description: task.description,
      customer_id: task.customer_id,
      assigned_to: task.assigned_to,
      priority: task.priority,
      due_date: task.due_date,
      status: task.status,
    });
    setEditingId(task.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };

  const getPriorityColor = (priority) => {
    const priorityMap = {
      low: 'primary',
      medium: 'warning',
      high: 'danger'
    };
    return priorityMap[priority] || 'secondary';
  };

  const getStatusColor = (status) => {
    const statusMap = {
      pending: 'warning',
      in_progress: 'primary',
      completed: 'success',
      cancelled: 'danger'
    };
    return statusMap[status] || 'secondary';
  };

  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filterStatus);

  const overdueTasks = tasks.filter(t => {
    if (t.status === 'completed') return false;
    if (!t.due_date) return false;
    return new Date(t.due_date) < new Date();
  }).length;

  if (loadingTasks && tasks.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Tasks</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Add Task
        </button>
      </div>

      {overdueTasks > 0 && (
        <div style={{ 
          background: 'rgba(220, 38, 38, 0.1)', 
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: '6px',
          padding: '15px',
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          color: '#dc2626'
        }}>
          <AlertCircle size={20} />
          <span><strong>{overdueTasks}</strong> task{overdueTasks > 1 ? 's' : ''} overdue</span>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks found</h3>
          <p>{filterStatus === 'all' ? 'Create your first task to get started.' : 'No tasks in this status.'}</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Customer</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                  return (
                    <tr key={task.id} style={{ background: isOverdue ? 'rgba(220, 38, 38, 0.05)' : 'transparent' }}>
                      <td>
                        <strong>{task.title}</strong>
                        {task.description && (
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                            {task.description.substring(0, 50)}...
                          </div>
                        )}
                      </td>
                      <td>{task.company_name || '-'}</td>
                      <td>
                        <span className={`badge badge-${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td>{task.assigned_to || '-'}</td>
                      <td>
                        {task.due_date ? (
                          <span style={{ color: isOverdue ? '#dc2626' : 'inherit' }}>
                            {new Date(task.due_date).toLocaleDateString('en-IN')}
                            {isOverdue && ' ⚠️'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <button className="btn btn-small" onClick={() => handleEdit(task)} title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-small btn-danger" onClick={() => handleDelete(task.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="modal-header">{editingId ? 'Edit Task' : 'Create New Task'}</h3>
              <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
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
                <label>Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assigned To</label>
                <input
                  type="text"
                  name="assigned_to"
                  placeholder="Team member name"
                  value={formData.assigned_to}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
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
    </div>
  );
}