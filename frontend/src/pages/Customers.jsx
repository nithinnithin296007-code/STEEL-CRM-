import { useState, useMemo } from 'react';
import { Edit, Trash2, Plus, MessageCircle, X } from 'lucide-react';
import { useStore } from '../store/store.js';
import SearchFilter from '../components/SearchFilter.jsx';
import { exportCustomersToExcel } from '../utils/export.js';

const TEMPLATES = [
  { label: 'Follow Up', message: (c) => `Hi ${c.contact_name}, this is a follow-up regarding your account with us at Steel CRM. Please let us know if you need anything.` },
  { label: 'Order Ready', message: (c) => `Hi ${c.contact_name}, your order is ready for delivery. Please confirm your availability. Thank you!` },
  { label: 'Payment Reminder', message: (c) => `Hi ${c.contact_name}, this is a gentle reminder regarding your pending payment. Kindly arrange at the earliest. Thank you.` },
  { label: 'New Offer', message: (c) => `Hi ${c.contact_name}, we have a new offer on steel materials that may interest you. Please contact us for details!` },
];

function WhatsAppModal({ customer, onClose }) {
  const [selected, setSelected] = useState(0);
  const [message, setMessage] = useState(TEMPLATES[0].message(customer));

  const handleTemplate = (i) => {
    setSelected(i);
    setMessage(TEMPLATES[i].message(customer));
  };

  const handleSend = () => {
    const phone = customer.phone.replace(/\D/g, '');
    const indiaPhone = phone.startsWith('91') ? phone : `91${phone}`;
    const url = `https://wa.me/${indiaPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div className="modal-header" style={{ marginBottom: 2 }}>
              💬 WhatsApp Message
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              {customer.company_name} · {customer.phone}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {/* Templates */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Quick Templates</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TEMPLATES.map((t, i) => (
              <button
                key={i}
                onClick={() => handleTemplate(i)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                  fontWeight: 500, border: '1px solid',
                  background: selected === i ? '#eff6ff' : '#f8fafc',
                  color: selected === i ? '#2563eb' : '#64748b',
                  borderColor: selected === i ? '#2563eb' : '#e2e8f0',
                  fontFamily: 'inherit'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message editor */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Message</div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            style={{
              width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
              borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
              color: '#0f172a', background: '#f8fafc', resize: 'vertical', outline: 'none'
            }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button
            onClick={handleSend}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 20px', borderRadius: 8, fontSize: 13,
              fontWeight: 600, border: 'none', cursor: 'pointer',
              background: '#25d366', color: '#fff', fontFamily: 'inherit'
            }}
          >
            <MessageCircle size={16} /> Open in WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterState, setFilterState] = useState({});
  const [whatsappCustomer, setWhatsappCustomer] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '', contact_name: '', phone: '', size: '', grade: '', status: 'active'
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const searchTerm = filterState.searchTerm?.toLowerCase() || '';
      const matchesSearch =
        (customer.company_name?.toLowerCase().includes(searchTerm) || '') ||
        (customer.contact_name?.toLowerCase().includes(searchTerm) || '') ||
        (customer.phone?.includes(searchTerm) || '');
      const matchesStatus = !filterState.status || customer.status === filterState.status;
      return matchesSearch && matchesStatus;
    });
  }, [customers, filterState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.contact_name || !formData.phone) {
      alert('Please fill all required fields');
      return;
    }
    try {
      if (editingId) {
        await updateCustomer(editingId, formData);
        setEditingId(null);
      } else {
        await addCustomer(formData);
      }
      setFormData({ company_name: '', contact_name: '', phone: '', size: '', grade: '', status: 'active' });
      setShowForm(false);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (customer) => {
    setFormData(customer);
    setEditingId(customer.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this customer?')) {
      try { await deleteCustomer(id); } catch (err) { alert('Error: ' + err.message); }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ company_name: '', contact_name: '', phone: '', size: '', grade: '', status: 'active' });
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">👥 Customers ({filteredCustomers.length})</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => exportCustomersToExcel(customers)}
              style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
              ⬇ Export
            </button>
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
              <Plus size={18} /> Add Customer
            </button>
          </div>
        </div>

        <SearchFilter onFilter={setFilterState} filterOptions={{ status: ['active', 'inactive', 'pending'] }} />

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">{editingId ? '✏️ Edit Customer' : '➕ Add New Customer'}</div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Company Name *</label>
                  <input type="text" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} placeholder="e.g., Laxmi Steel Co" required />
                </div>
                <div className="form-group">
                  <label>Contact Name *</label>
                  <input type="text" value={formData.contact_name} onChange={e => setFormData({ ...formData, contact_name: e.target.value })} placeholder="e.g., Rajesh Kumar" required />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="e.g., 9876543210" required />
                </div>
                <div className="form-group">
                  <label>Steel Size</label>
                  <input type="text" value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} placeholder="e.g., 10mm, 20mm" />
                </div>
                <div className="form-group">
                  <label>Steel Grade</label>
                  <input type="text" value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} placeholder="e.g., MS, TMT, HR" />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={handleCancel} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'} Customer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <h3>No customers found</h3>
            <p>Add your first customer to get started.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Phone</th>
                  <th>Size</th>
                  <th>Grade</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td className="fw-600">{customer.company_name}</td>
                    <td>{customer.contact_name}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.size || '-'}</td>
                    <td>{customer.grade || '-'}</td>
                    <td>
                      <span className={`badge badge-${customer.status === 'active' ? 'success' : customer.status === 'inactive' ? 'danger' : 'warning'}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => setWhatsappCustomer(customer)}
                          title="WhatsApp"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 30, height: 30, borderRadius: 7, border: 'none',
                            background: '#dcfce7', color: '#16a34a', cursor: 'pointer'
                          }}
                        >
                          <MessageCircle size={15} />
                        </button>
                        <button onClick={() => handleEdit(customer)} className="btn btn-secondary btn-small" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(customer.id)} className="btn btn-danger btn-small" title="Delete">
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

      {whatsappCustomer && (
        <WhatsAppModal customer={whatsappCustomer} onClose={() => setWhatsappCustomer(null)} />
      )}

      <style>{`.fw-600 { font-weight: 600; }`}</style>
    </>
  );
}