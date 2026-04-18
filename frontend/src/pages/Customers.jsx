import { useState, useMemo } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useStore } from '../store/store.js';
import SearchFilter from '../components/SearchFilter.jsx';
import { exportCustomersToExcel } from '../utils/export.js';

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterState, setFilterState] = useState({});
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    size: '',
    grade: '',
    status: 'active'
  });

  // Filter logic
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

      setFormData({
        company_name: '',
        contact_name: '',
        phone: '',
        size: '',
        grade: '',
        status: 'active'
      });
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
      try {
        await deleteCustomer(id);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      company_name: '',
      contact_name: '',
      phone: '',
      size: '',
      grade: '',
      status: 'active'
    });
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">👥 Customers ({filteredCustomers.length})</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => exportCustomersToExcel(customers)}
              style={{
                background: '#16a34a', color: '#fff', border: 'none',
                borderRadius: 8, padding: '8px 16px', fontSize: 13,
                cursor: 'pointer', fontWeight: 500
              }}
            >
              ⬇ Export to Excel
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary"
            >
              <Plus size={18} /> Add Customer
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <SearchFilter
          onFilter={setFilterState}
          filterOptions={{
            status: ['active', 'inactive', 'pending']
          }}
        />

        {/* ADD/EDIT FORM */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                {editingId ? '✏️ Edit Customer' : '➕ Add New Customer'}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g., Laxmi Steel Co"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Name *</label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="e.g., Rajesh Kumar"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g., 9876543210"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Steel Size</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="e.g., 10mm, 20mm"
                  />
                </div>

                <div className="form-group">
                  <label>Steel Grade</label>
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="e.g., MS, TMT, HR"
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
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
                    {editingId ? 'Update' : 'Create'} Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CUSTOMERS TABLE */}
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
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="fw-600">{customer.company_name}</td>
                    <td>{customer.contact_name}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.size || '-'}</td>
                    <td>{customer.grade || '-'}</td>
                    <td>
                      <span
                        className={`badge badge-${
                          customer.status === 'active'
                            ? 'success'
                            : customer.status === 'inactive'
                            ? 'danger'
                            : 'warning'
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="btn btn-secondary btn-small"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
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