import { useState, useMemo } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useStore } from '../store/store.js';
import SearchFilter from '../components/SearchFilter.jsx';

export default function Orders() {
  const { orders, customers, addOrder, updateOrder, deleteOrder } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterState, setFilterState] = useState({});
  const [formData, setFormData] = useState({
    customer_id: '',
    delivery_date: '',
    notes: '',
    total_amount: 0,
    status: 'pending'
  });

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const customer = customers.find(c => c.id === order.customer_id);
      const searchTerm = filterState.searchTerm?.toLowerCase() || '';
      const matchesSearch =
        (customer?.company_name?.toLowerCase().includes(searchTerm) || '') ||
        (order.id?.toLowerCase().includes(searchTerm) || '');

      const matchesStatus = !filterState.status || order.status === filterState.status;

      if (filterState.dateFrom && new Date(order.order_date) < new Date(filterState.dateFrom)) {
        return false;
      }
      if (filterState.dateTo && new Date(order.order_date) > new Date(filterState.dateTo)) {
        return false;
      }

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (filterState.sortBy === 'Oldest') {
        return new Date(a.order_date) - new Date(b.order_date);
      } else if (filterState.sortBy === 'Amount High') {
        return b.total_amount - a.total_amount;
      } else if (filterState.sortBy === 'Amount Low') {
        return a.total_amount - b.total_amount;
      }
      return new Date(b.order_date) - new Date(a.order_date); // Default: Recent
    });
  }, [orders, customers, filterState]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_id || !formData.delivery_date) {
      alert('Please fill required fields');
      return;
    }

    try {
      if (editingId) {
        await updateOrder(editingId, formData);
        setEditingId(null);
      } else {
        await addOrder(formData);
      }

      setFormData({
        customer_id: '',
        delivery_date: '',
        notes: '',
        total_amount: 0,
        status: 'pending'
      });
      setShowForm(false);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (order) => {
    setFormData(order);
    setEditingId(order.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this order?')) {
      try {
        await deleteOrder(id);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      customer_id: '',
      delivery_date: '',
      notes: '',
      total_amount: 0,
      status: 'pending'
    });
  };

  const getCustomerName = (customerId) => {
    return customers.find(c => c.id === customerId)?.company_name || 'Unknown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'confirmed':
        return 'badge-primary';
      case 'shipped':
        return 'badge-primary';
      case 'delivered':
        return 'badge-success';
      case 'cancelled':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🛒 Orders ({filteredOrders.length})</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            <Plus size={18} /> New Order
          </button>
        </div>

        {/* SEARCH & FILTER */}
        <SearchFilter
          onFilter={setFilterState}
          filterOptions={{
            status: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            dateFrom: true,
            dateTo: true,
            sortBy: ['Recent', 'Oldest', 'Amount High', 'Amount Low']
          }}
        />

        {/* ADD/EDIT FORM */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                {editingId ? '✏️ Edit Order' : '➕ New Order'}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Customer *</label>
                  <select
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Delivery Date *</label>
                  <input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Order notes..."
                    rows="3"
                  />
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
                    {editingId ? 'Update' : 'Create'} Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ORDERS TABLE */}
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders found</h3>
            <p>Create your first order to get started.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Company</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Delivery Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="fw-600">{order.id.slice(0, 8)}...</td>
                    <td>{getCustomerName(order.customer_id)}</td>
                    <td>₹{order.total_amount?.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.delivery_date).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(order)}
                          className="btn btn-secondary btn-small"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
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