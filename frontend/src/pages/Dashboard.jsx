import { useEffect } from 'react';
import { useStore } from '../store/store.js';
import { TrendingUp, Users, ShoppingCart, CheckCircle, Bell } from 'lucide-react';

function timeUntil(dateStr) {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target - now;
  if (diff < 0) return 'Overdue';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `in ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `in ${days}d`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Dashboard() {
  const { stats, loadingStats, fetchStats, orders, customers, tasks, reminders,
    fetchOrders, fetchCustomers, fetchTasks, fetchReminders } = useStore();

  useEffect(() => {
    fetchStats();
    fetchOrders();
    fetchCustomers();
    fetchTasks();
    fetchReminders();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const openOrders = (orders || []).filter(o => o.status === 'pending' || o.status === 'processing');
  const pendingTasks = (tasks || []).filter(t => t.status === 'pending' || t.status === 'in_progress');
  const upcomingReminders = (reminders || [])
    .filter(r => !r.is_sent)
    .sort((a, b) => new Date(a.reminder_time) - new Date(b.reminder_time))
    .slice(0, 5);
  const recentCustomers = (customers || [])
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  if (loadingStats) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '30px', fontSize: '24px', fontWeight: '600' }}>Dashboard</h2>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
            <Users size={30} />
          </div>
          <div className="stat-content">
            <h3>Total Customers</h3>
            <div className="number">{stats?.total_customers || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c' }}>
            <ShoppingCart size={30} />
          </div>
          <div className="stat-content">
            <h3>Open Orders</h3>
            <div className="number">{openOrders.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }}>
            <TrendingUp size={30} />
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <div className="number">₹{(stats?.total_revenue || 0).toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}>
            <CheckCircle size={30} />
          </div>
          <div className="stat-content">
            <h3>Pending Tasks</h3>
            <div className="number">{pendingTasks.length}</div>
          </div>
        </div>
      </div>

      {/* Bottom 4 sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>

        {/* Open Orders */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><ShoppingCart size={18} style={{ marginRight: 8 }} />Open Orders</h3>
          </div>
          {openOrders.length === 0 ? (
            <p style={{ color: '#94a3b8', padding: '16px 0' }}>No open orders</p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {openOrders.slice(0, 5).map(order => (
                    <tr key={order.id}>
                      <td>{order.customer_name || '—'}</td>
                      <td>₹{Number(order.total_amount || 0).toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`badge ${order.status === 'pending' ? 'badge-warning' : 'badge-primary'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><CheckCircle size={18} style={{ marginRight: 8 }} />Pending Tasks</h3>
          </div>
          {pendingTasks.length === 0 ? (
            <p style={{ color: '#94a3b8', padding: '16px 0' }}>No pending tasks</p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Priority</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTasks.slice(0, 5).map(task => (
                    <tr key={task.id}>
                      <td>{task.title}</td>
                      <td>
                        <span className={`badge ${task.priority === 'high' ? 'badge-danger' : task.priority === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>{formatDate(task.due_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Bell size={18} style={{ marginRight: 8 }} />Upcoming Reminders</h3>
          </div>
          {upcomingReminders.length === 0 ? (
            <p style={{ color: '#94a3b8', padding: '16px 0' }}>No upcoming reminders</p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Message</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingReminders.map(r => (
                    <tr key={r.id}>
                      <td>{r.message}</td>
                      <td style={{ color: timeUntil(r.reminder_time) === 'Overdue' ? '#dc2626' : '#16a34a', fontWeight: 500 }}>
                        {timeUntil(r.reminder_time)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Customers */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Users size={18} style={{ marginRight: 8 }} />Recent Customers</h3>
          </div>
          {recentCustomers.length === 0 ? (
            <p style={{ color: '#94a3b8', padding: '16px 0' }}>No customers yet</p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Added</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCustomers.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.phone || '—'}</td>
                      <td>{formatDate(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}