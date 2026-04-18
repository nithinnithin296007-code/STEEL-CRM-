import { useEffect, useState } from 'react';
import { useStore } from '../store/store.js';
import { TrendingUp, Users, ShoppingCart, CheckCircle, Bell, Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function EmptyState({ icon, message, action, onAction }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 16px' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 12 }}>{message}</p>
      <button
        onClick={onAction}
        style={{
          background: '#2563eb', color: '#fff', border: 'none',
          borderRadius: 8, padding: '8px 16px', fontSize: 13,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
        }}
      >
        {action} <ArrowRight size={14} />
      </button>
    </div>
  );
}

export default function Dashboard() {
  const { stats, fetchStats, orders, customers, tasks, reminders,
    fetchOrders, fetchCustomers, fetchTasks, fetchReminders } = useStore();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

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
    .slice(0, 4);
  const recentCustomers = (customers || [])
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // Global search across customers, orders, tasks
  const q = search.toLowerCase().trim();
  const searchResults = q.length < 2 ? [] : [
    ...(customers || []).filter(c =>
      c.name?.toLowerCase().includes(q) || c.phone?.includes(q)
    ).map(c => ({ type: 'Customer', label: c.name || c.phone, sub: c.phone, route: '/customers' })),
    ...(orders || []).filter(o =>
      o.customer_name?.toLowerCase().includes(q) || String(o.total_amount).includes(q)
    ).map(o => ({ type: 'Order', label: o.customer_name, sub: `₹${Number(o.total_amount).toLocaleString('en-IN')}`, route: '/orders' })),
    ...(tasks || []).filter(t =>
      t.title?.toLowerCase().includes(q)
    ).map(t => ({ type: 'Task', label: t.title, sub: t.priority, route: '/tasks' })),
  ].slice(0, 6);

  const cardStyle = {
    background: '#fff', borderRadius: 12, padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 0
  };

  const sectionTitle = (text) => (
    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>{text}</h3>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header + Search */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Good morning 👋</h2>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>Here's what needs your attention today.</p>

        {/* Search bar */}
        <div style={{ position: 'relative', maxWidth: 480 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search customers, orders, tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              border: '1px solid #e2e8f0', borderRadius: 10,
              fontSize: 14, outline: 'none', background: '#f8fafc'
            }}
          />
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '110%', left: 0, right: 0,
              background: '#fff', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              zIndex: 100, overflow: 'hidden'
            }}>
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  onClick={() => { navigate(r.route); setSearch(''); }}
                  style={{
                    padding: '10px 16px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: 10, borderBottom: '1px solid #f1f5f9'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 7px',
                    borderRadius: 6, background: '#e0e7ff', color: '#3730a3'
                  }}>{r.type}</span>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{r.label}</span>
                  <span style={{ color: '#94a3b8', fontSize: 13, marginLeft: 'auto' }}>{r.sub}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Customers', value: stats?.total_customers || 0, color: '#2563eb', bg: '#eff6ff', icon: '👥' },
          { label: 'Open Orders', value: openOrders.length, color: '#ea580c', bg: '#fff7ed', icon: '📦' },
          { label: 'Pending Tasks', value: pendingTasks.length, color: '#dc2626', bg: '#fef2f2', icon: '✅' },
        ].map((s, i) => (
          <div key={i} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 28, background: s.bg, borderRadius: 10, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Open Orders */}
        <div style={cardStyle}>
          {sectionTitle('📦 Open Orders')}
          {openOrders.length === 0 ? (
            <EmptyState icon="🛒" message="No open orders right now." action="Create an order" onAction={() => navigate('/orders')} />
          ) : (
            <div>
              {openOrders.slice(0, 4).map(o => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{o.customer_name || 'Unknown'}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{o.status}</div>
                  </div>
                  <div style={{ fontWeight: 600, color: '#ea580c' }}>₹{Number(o.total_amount || 0).toLocaleString('en-IN')}</div>
                </div>
              ))}
              {openOrders.length > 4 && (
                <button onClick={() => navigate('/orders')} style={{ marginTop: 12, background: 'none', border: 'none', color: '#2563eb', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                  View all {openOrders.length} orders →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        <div style={cardStyle}>
          {sectionTitle('✅ Pending Tasks')}
          {pendingTasks.length === 0 ? (
            <EmptyState icon="🎉" message="All caught up! No pending tasks." action="Add a task" onAction={() => navigate('/tasks')} />
          ) : (
            <div>
              {pendingTasks.slice(0, 4).map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{t.title}</div>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600,
                    background: t.priority === 'high' ? '#fef2f2' : t.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                    color: t.priority === 'high' ? '#dc2626' : t.priority === 'medium' ? '#d97706' : '#16a34a'
                  }}>{t.priority}</span>
                </div>
              ))}
              {pendingTasks.length > 4 && (
                <button onClick={() => navigate('/tasks')} style={{ marginTop: 12, background: 'none', border: 'none', color: '#2563eb', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                  View all {pendingTasks.length} tasks →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div style={cardStyle}>
          {sectionTitle('🔔 Upcoming Reminders')}
          {upcomingReminders.length === 0 ? (
            <EmptyState icon="😌" message="No reminders coming up." action="Set a reminder" onAction={() => navigate('/reminders')} />
          ) : (
            <div>
              {upcomingReminders.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{r.message}</div>
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: timeUntil(r.reminder_time) === 'Overdue' ? '#dc2626' : '#16a34a'
                  }}>{timeUntil(r.reminder_time)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Customers */}
        <div style={cardStyle}>
          {sectionTitle('👥 Recent Customers')}
          {recentCustomers.length === 0 ? (
            <EmptyState icon="👤" message="No customers added yet." action="Add a customer" onAction={() => navigate('/customers')} />
          ) : (
            <div>
              {recentCustomers.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{c.name || 'Unnamed'}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{c.phone || '—'}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{formatDate(c.created_at)}</div>
                </div>
              ))}
              <button onClick={() => navigate('/customers')} style={{ marginTop: 12, background: 'none', border: 'none', color: '#2563eb', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                View all customers →
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}