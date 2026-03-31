import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { useStore } from '../store/store.js';
import api from '../services/api.js';

export default function Customers() {
  const { customers, setCustomers } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    size: '',
    grade: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      company_name: '',
      contact_name: '',
      phone: '',
      size: '',
      grade: ''
    });
    setShowModal(true);
  };

  const handleEditClick = (customer) => {
    setEditingId(customer.id);
    setFormData({
      company_name: customer.company_name,
      contact_name: customer.contact_name,
      phone: customer.phone || '',
      size: customer.size,
      grade: customer.grade
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      
      await fetchCustomers();
      setShowModal(false);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    try {
      await api.delete(`/customers/${id}`);
      await fetchCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>👥 Customers</h1>
        <button 
          onClick={handleAddClick}
          className="btn btn-primary"
        >
          <Plus size={20} /> Add Customer
        </button>
      </div>

      {customers.length > 0 ? (
        <div className="card">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Contact Name</th>
                  <th>Phone 🔒</th>
                  <th>Steel Size</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td style={{ fontWeight: '600' }}>{customer.company_name}</td>
                    <td>{customer.contact_name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🔐 {customer.phone || '—'}</span>
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#16a34a', 
                          fontWeight: '600',
                          background: 'rgba(22, 163, 74, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          Encrypted
                        </span>
                      </div>
                    </td>
                    <td>{customer.size || '—'}</td>
                    <td>{customer.grade || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEditClick(customer)}
                          className="btn btn-secondary btn-small"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="btn btn-danger btn-small"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No customers yet</h3>
          <p>Create your first customer to get started</p>
          <button 
            onClick={handleAddClick}
            className="btn btn-primary"
            style={{ marginTop: '15px' }}
          >
            Add Customer
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {editingId ? '✏️ Edit Customer' : '➕ Add Customer'}
              
              {/* Security Badge */}
              <div style={{ 
                marginTop: '10px',
                fontSize: '12px',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                🔐 Data will be encrypted
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="ABC Steel Co"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Name *</label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                  placeholder="Rajesh Kumar"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number 🔐 (Encrypted)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                />
                <small style={{ color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>
                  This will be encrypted for security
                </small>
              </div>

              <div className="form-group">
                <label>Steel Size</label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                >
                  <option value="">Select Size</option>
                  <option value="5mm">5mm</option>
                  <option value="8mm">8mm</option>
                  <option value="10mm">10mm</option>
                  <option value="12mm">12mm</option>
                  <option value="16mm">16mm</option>
                  <option value="20mm">20mm</option>
                  <option value="25mm">25mm</option>
                </select>
              </div>

              <div className="form-group">
                <label>Steel Grade</label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                >
                  <option value="">Select Grade</option>
                  <option value="MS">MS (Mild Steel)</option>
                  <option value="HS">HS (High Strength)</option>
                  <option value="CR">CR (Cold Rolled)</option>
                  <option value="SS">SS (Stainless Steel)</option>
                  <option value="TMT">TMT (Thermo Mechanically Treated)</option>
                </select>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingId ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}