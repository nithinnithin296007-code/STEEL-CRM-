import { useState, useEffect } from 'react';
import { useStore } from '../store/store.js';
import { Trash2, Edit, Plus, X } from 'lucide-react';

export default function Orders() {
  const { orders, customers, loadingOrders, fetchOrders, addOrder, updateOrder, deleteOrder } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    delivery_date: '',
    status: 'pending',
    notes: '',
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateOrder(editingId, formData);
    } else {
      await addOrder(formData);
    }
    setFormData({ customer_id: '', delivery_date: '', status: 'pending', notes: '' });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (order) => {
    setFormData({
      customer_id: order.customer_id,
      delivery_date: order.delivery_date,
      status: order.status,
      notes: order.notes,
    });
    setEditingId(order.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      await deleteOrder(id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ customer_id: '', delivery_date: '', status: 'pending', notes: '' });
  };

  const getStatusColor = (status) => {
    const statusMap = {
      pending: 'warning',
      processing: 'primary',
      shipped: 'primary',
      completed: 'success',
      cancelled: 'danger'
    };
    return statusMap[status] || 'secondary';
  };

  if (loadingOrders && orders.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Orders</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> New Order
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Create your first order to get started.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Amount (₹)</th>
                  <th>Status</th>
                  <th>Delivery Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td><strong>{order.id.slice(0, 8)}</strong></td>
                    <td>{order.company_name || '-'}</td>
                    <td>{order.contact_name || '-'}</td>
                    <td>{order.total_amount?.toLocaleString('en-IN') || '0'}</td>
                    <td>
                      <span className={`badge badge-${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('en-IN') : '-'}</td>
                    <td>
                      <button className="btn btn-small" onClick={() => handleEdit(order)} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-small btn-danger" onClick={() => handleDelete(order.id)} title="Delete">
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="modal-header">{editingId ? 'Edit Order' : 'Create New Order'}</h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer *</label>
                <select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.company_name} - {c.contact_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Delivery Date</label>
                <input
                  type="date"
                  name="delivery_date"
                  value={formData.delivery_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Create'} Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}