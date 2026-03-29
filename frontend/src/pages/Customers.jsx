import { useState, useEffect } from 'react';
import { useStore } from '../store/store.js';
import { Trash2, Edit, Plus, X } from 'lucide-react';

export default function Customers() {
  const { customers, loadingCustomers, fetchCustomers, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    size: '',
    grade: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateCustomer(editingId, formData);
    } else {
      await addCustomer(formData);
    }
    setFormData({
      company_name: '',
      contact_name: '',
      phone: '',
      size: '',
      grade: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (customer) => {
    setFormData({
      company_name: customer.company_name,
      contact_name: customer.contact_name,
      phone: customer.phone,
      size: customer.size || '',
      grade: customer.grade || '',
    });
    setEditingId(customer.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await deleteCustomer(id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      company_name: '',
      contact_name: '',
      phone: '',
      size: '',
      grade: '',
    });
  };

  if (loadingCustomers && customers.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Customers</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Add Customer
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="empty-state">
          <h3>No customers yet</h3>
          <p>Add your first customer to get started.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Contact Name</th>
                  <th>Phone</th>
                  <th>Steel Size</th>
                  <th>Steel Grade</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td><strong>{customer.company_name}</strong></td>
                    <td>{customer.contact_name}</td>
                    <td>{customer.phone || '-'}</td>
                    <td>{customer.size || '-'}</td>
                    <td>{customer.grade || '-'}</td>
                    <td>
                      <span className={`badge badge-${customer.status === 'active' ? 'success' : 'warning'}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-small" onClick={() => handleEdit(customer)} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-small btn-danger" onClick={() => handleDelete(customer.id)} title="Delete">
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
              <h3 className="modal-header">{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
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
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Steel Size (e.g., 10mm, 12mm, 20mm)</label>
                <input
                  type="text"
                  name="size"
                  placeholder="e.g., 10mm x 10mm"
                  value={formData.size}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Steel Grade (e.g., MS, SS, TMT)</label>
                <input
                  type="text"
                  name="grade"
                  placeholder="e.g., MS, SS316, TMT 500D"
                  value={formData.grade}
                  onChange={handleInputChange}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Create'} Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}