import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ShoppingCart, TrendingUp } from 'lucide-react';
import api from '../services/api.js';

export default function Analytics() {
  const [revenueData, setRevenueData] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [stats, setStats] = useState({ total_revenue: 0, total_customers: 0, active_orders: 0, pending_tasks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [revenueRes, statusRes, customersRes, statsRes] = await Promise.all([
        api.get('/analytics/revenue'),
        api.get('/analytics/orders-by-status'),
        api.get('/analytics/top-customers'),
        api.get('/analytics/dashboard'),
      ]);

      setRevenueData(revenueRes.data.map(item => ({
        month: new Date(item.month).toLocaleDateString('en-US', { year: '2-digit', month: 'short' }),
        revenue: parseFloat(item.revenue) || 0,
        orders: item.orders || 0
      })).reverse());

      setOrderStatus(statusRes.data);
      setTopCustomers(customersRes.data.slice(0, 10));
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#2563eb', '#16a34a', '#ea580c', '#dc2626', '#9333ea'];

  if (loading) return <div className="loading"><div className="spinner"></div><p>Loading...</p></div>;

  const hasRevenue = revenueData.length > 0;
  const hasOrders = orderStatus.length > 0;
  const hasCustomers = topCustomers.length > 0;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Analytics</h2>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Customers', value: stats.total_customers || 0, icon: <Users size={24} />, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Orders', value: stats.active_orders || 0, icon: <ShoppingCart size={24} />, color: '#ea580c', bg: '#fff7ed' },
          { label: 'Pending Tasks', value: stats.pending_tasks || 0, icon: <TrendingUp size={24} />, color: '#9333ea', bg: '#faf5ff' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-content">
              <h3>{s.label}</h3>
              <div className="number" style={{ color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>


      {/* Order Status — only if data exists */}
      {hasOrders && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginTop: 20 }}>
          {hasOrders && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Order Status</h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={orderStatus} cx="50%" cy="50%" outerRadius={90} dataKey="count"
                    label={({ status, count }) => `${status}: ${count}`} labelLine={false}>
                    {orderStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Top Customers — only if data exists */}
      {hasCustomers && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <h3 className="card-title">Top Customers</h3>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, i) => (
                  <tr key={i}>
                    <td style={{ color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{c.company_name}</td>
                    <td>{c.contact_name}</td>
                    <td>{c.order_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Nothing to show */}
      {!hasRevenue && !hasOrders && !hasCustomers && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="empty-state">
            <h3>No data yet</h3>
            <p>Add customers and orders to see analytics here.</p>
          </div>
        </div>
      )}
    </div>
  );
}