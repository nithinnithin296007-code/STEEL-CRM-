import { useEffect } from 'react';
import { useStore } from '../store/store.js';
import { TrendingUp, Users, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { stats, loadingStats, fetchStats } = useStore();

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

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
            <h3>Active Orders</h3>
            <div className="number">{stats?.active_orders || 0}</div>
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
            <div className="number">{stats?.pending_tasks || 0}</div>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <AlertCircle size={50} style={{ color: '#2563eb', marginBottom: '20px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Welcome to Steel CRM</h3>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>
            Manage your customers, orders, tasks, and reminders all in one place.
          </p>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Use the navigation menu to get started!
          </p>
        </div>
      </div>
    </div>
  );
}