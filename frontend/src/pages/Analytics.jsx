import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react';
import api from '../services/api.js';

export default function Analytics() {
  const [revenueData, setRevenueData] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_customers: 0,
    active_orders: 0,
    pending_tasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const revenueRes = await api.get('/analytics/revenue');
      const formattedRevenue = revenueRes.data.map(item => ({
        month: new Date(item.month).toLocaleDateString('en-US', { year: '2-digit', month: 'short' }),
        revenue: parseFloat(item.revenue) || 0,
        orders: item.orders || 0
      })).reverse();
      setRevenueData(formattedRevenue);

      const statusRes = await api.get('/analytics/orders-by-status');
      setOrderStatus(statusRes.data);

      const customersRes = await api.get('/analytics/top-customers');
      setTopCustomers(customersRes.data.slice(0, 10));

      const statsRes = await api.get('/analytics/dashboard');
      setStats(statsRes.data);

      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const COLORS = ['#2563eb', '#16a34a', '#ea580c', '#dc2626', '#9333ea'];

  if (loading) return <div className="loading"><p>Loading analytics...</p></div>;

  return (
    <div>
      <h1 style={{ marginBottom: '30px', fontSize: '28px', fontWeight: '700' }}>📊 Analytics</h1>

      {/* Metrics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
            <DollarSign size={30} />
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <div className="number">₹{(stats.total_revenue || 0).toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }}>
            <Users size={30} />
          </div>
          <div className="stat-content">
            <h3>Customers</h3>
            <div className="number">{stats.total_customers || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
            <ShoppingCart size={30} />
          </div>
          <div className="stat-content">
            <h3>Orders</h3>
            <div className="number">{stats.active_orders || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c' }}>
            <TrendingUp size={30} />
          </div>
          <div className="stat-content">
            <h3>Tasks</h3>
            <div className="number">{stats.pending_tasks || 0}</div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📈 Monthly Revenue</h2>
        </div>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No revenue data</p>
        )}
      </div>

      {/* Two Column Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {/* Order Status Pie */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📦 Order Status</h2>
          </div>
          {orderStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={orderStatus} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="count" label={({ status, count }) => `${status}: ${count}`}>
                  {orderStatus.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>No orders yet</p>
          )}
        </div>

        {/* Orders Count Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📊 Orders Per Month</h2>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No data</p>
          )}
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">⭐ Top Customers</h2>
        </div>
        {topCustomers.length > 0 ? (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Orders</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((cust, idx) => (
                  <tr key={idx}>
                    <td>{cust.company_name}</td>
                    <td>{cust.contact_name}</td>
                    <td>{cust.order_count}</td>
                    <td>₹{(cust.total_revenue || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No customers yet</p>
        )}
      </div>
    </div>
  );
}