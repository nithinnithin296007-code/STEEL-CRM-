import { useState, useMemo } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useStore } from '../store/store.js';
import SearchFilter from '../components/SearchFilter';
import { exportOrdersToExcel } from '../utils/export.js';

const STATUS_COLORS = {
  pending: { bg: '#fffbeb', color: '#d97706' },
  confirmed: { bg: '#eff6ff', color: '#2563eb' },
  shipped: { bg: '#f5f3ff', color: '#7c3aed' },
  delivered: { bg: '#f0fdf4', color: '#16a34a' },
  cancelled: { bg: '#fef2f2', color: '#dc2626' },
};

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

export default function Orders() {
  const { orders, customers, addOrder, updateOrder, deleteOrder } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterState, setFilterState] = useState({});
  const [formData, setFormData] = useState({
    customer_id: '', delivery_date: '', notes: '', total_amount: '', status: 'pending'
  });

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const customer = customers.find(c => c.id === order.customer_id);
      const searchTerm = filterState.searchTerm?.toLowerCase() || '';
      const matchesSearch = customer?.company_name?.toLowerCase().includes(searchTerm) || order.id?.toLowerCase().includes(searchTerm);
      const matchesStatus = !filterState.status || order.status === filterState.status;
      if (filterState.dateFrom && new Date(order.order_date) < new Date(filterState.dateFrom)) return false;
      if (filterState.dateTo && new Date(order.order_date) > new Date(filterState.dateTo)) return false;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (filterState.sortBy === 'Oldest') return new Date(a.order_date) - new Date(b.order_date);
      if (filterState.sortBy === 'Amount High') return b.total_amount - a.total_amount;
      if (filterState.sortBy === 'Amount Low') return a.total_amount - b.total_amount;
      return new Date(b.order_date) - new Date(a.order_date);
    });
  }, [orders, customers, filterState]);

  const reset = () => ({ customer_id: '', delivery_date: '', notes: '', total_amount: '', status: 'pending' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id || !formData.delivery_date) return alert('Customer and delivery date are required');
    try {
      const data = { ...formData, total_amount: parseFloat(formData.total_amount) || 0 };
      if (editingId) { await updateOrder(editingId, data); setEditingId(null); }
      else await addOrder(data);
      setFormData(reset());
      setShowForm(false);
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleEdit = (order) => {
    setFormData({ ...order, delivery_date: order.delivery_date?.slice(0, 10) || '', total_amount: order.total_amount || '' });
    setEditingId(order.id);
    setShowForm(true);
  };

  const handleCancel = () => { setShowForm(false); setEditingId(null); setFormData(reset()); };
  const handleDelete = async (id) => { if (confirm('Delete this order?')) await deleteOrder(id); };

  const getCustomerName = (id) => customers.find(c => c.id === id)?.company_name || 'Unknown';

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">🛒 Orders</h2>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {filteredOrders.length} orders · ₹{filteredOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0).toLocaleString('en-IN')} total
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => exportOrdersToExcel(orders)}
              style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
              ⬇ Export
            </button>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              <Plus size={16} /> New Order
            </button>
          </div>
        </div>

        <SearchFilter onFilter={setFilterState} filterOptions={{
          status: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
          dateFrom: true, dateTo: true,
          sortBy: ['Recent', 'Oldest', 'Amount High', 'Amount Low']
        }} />

        {/* FORM */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 440 }}>
              <div className="modal-header">{editingId ? '✏️ Edit Order' : '🛒 New Order'}</div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Customer *</label>
                  <select value={formData.customer_id} onChange={e => setFormData({ ...formData, customer_id: e.target.value })} required>
                    <option value="">Select customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Amount (₹)</label>
                    <input type="number" value={formData.total_amount}
                      onChange={e => setFormData({ ...formData, total_amount: e.target.value })}
                      placeholder="0" min="0" />
                  </div>
                  <div className="form-group">
                    <label>Delivery Date *</label>
                    <input type="date" value={formData.delivery_date}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={e => setFormData({ ...formData, delivery_date: e.target.value })} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                      <button key={s} type="button"
                        onClick={() => setFormData({ ...formData, status: s })}
                        style={{
                          padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', border: '1px solid',
                          background: formData.status === s ? STATUS_COLORS[s].bg : '#f8fafc',
                          color: formData.status === s ? STATUS_COLORS[s].color : '#94a3b8',
                          borderColor: formData.status === s ? STATUS_COLORS[s].color : '#e2e8f0',
                          fontFamily: 'inherit'
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special instructions..." rows={2}
                    style={{ resize: 'none' }} />
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={handleCancel} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'} Order</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ORDERS LIST */}
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>Create your first order to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredOrders.map(order => {
              const s = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
              const stepIndex = STATUS_STEPS.indexOf(order.status);
              return (
                <div key={order.id} style={{
                  padding: '16px 20px', borderRadius: 12,
                  border: '1px solid #e2e8f0', background: '#fff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{getCustomerName(order.customer_id)}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        Delivery: {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        {order.notes && ` · ${order.notes}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>
                        ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color }}>
                        {order.status}
                      </span>
                      <button onClick={() => handleEdit(order)} className="btn btn-secondary btn-small"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(order.id)} className="btn btn-danger btn-small"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  {/* Progress bar — only for non-cancelled */}
                  {order.status !== 'cancelled' && stepIndex >= 0 && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                      {STATUS_STEPS.map((step, i) => (
                        <div key={step} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= stepIndex ? '#2563eb' : '#e2e8f0', transition: 'background 0.3s' }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}