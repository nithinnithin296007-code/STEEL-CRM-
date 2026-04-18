import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { BarChart3, Users, ShoppingCart, CheckCircle, Bell, Moon, Sun, TrendingUp, Brain } from 'lucide-react';
import { useStore } from './store/store.js';
import { playNotificationSound, requestNotificationPermission, showNotification } from './utils/sound.js';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Tasks from './pages/Tasks';
import Reminders from './pages/Reminders';
import Analytics from './pages/Analytics';
import AIInsights from './pages/AIInsights';
import './App.css';

export default function App() {
  const { fetchCustomers, fetchOrders, fetchTasks, fetchReminders, fetchStats, reminders } = useStore();
  const [isDark, setIsDark] = useState(false);
  const [toast, setToast] = useState(null);
  const firedRef = useRef(new Set());

  useEffect(() => {
    fetchCustomers();
    fetchOrders();
    fetchTasks();
    fetchReminders();
    fetchStats();
    requestNotificationPermission();

    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Poll reminders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchReminders();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check for due reminders
  useEffect(() => {
    if (!reminders?.length) return;

    const now = new Date();
    reminders.forEach(r => {
      if (r.is_sent) return;
      if (firedRef.current.has(r.id)) return;

      const due = new Date(r.reminder_time);
      const diff = due - now;

      // Fire if overdue or due within next 60 seconds
      if (diff <= 60000) {
        firedRef.current.add(r.id);

        // Sound
        playNotificationSound(r.sound_type || 'reminder');

        // Browser push notification
        showNotification(`🔔 ${r.title}`, {
          body: r.message || 'You have a reminder due.',
          icon: '/favicon.svg',
        });

        // In-app toast
        setToast({ title: r.title, message: r.message });
        setTimeout(() => setToast(null), 6000);
      }
    });
  }, [reminders]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    const newTheme = !isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Badge count — pending reminders due within 24 hours
  const now = new Date();
  const badgeCount = (reminders || []).filter(r => {
    if (r.is_sent) return false;
    const due = new Date(r.reminder_time);
    return due - now <= 24 * 60 * 60 * 1000;
  }).length;

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">🏢 Steel CRM</div>
          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
              <BarChart3 size={16} /> Dashboard
            </NavLink>
            <NavLink to="/customers" className={({ isActive }) => isActive ? 'active' : ''}>
              <Users size={16} /> Customers
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => isActive ? 'active' : ''}>
              <ShoppingCart size={16} /> Orders
            </NavLink>
            <NavLink to="/tasks" className={({ isActive }) => isActive ? 'active' : ''}>
              <CheckCircle size={16} /> Tasks
            </NavLink>
            <NavLink to="/reminders" className={({ isActive }) => isActive ? 'active' : ''}>
              <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Bell size={16} /> Reminders
                {badgeCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -8, right: -10,
                    background: '#dc2626', color: '#fff',
                    borderRadius: '50%', width: 17, height: 17,
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{badgeCount}</span>
                )}
              </span>
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
              <TrendingUp size={16} /> Analytics
            </NavLink>
            <NavLink to="/ai-insights" className={({ isActive }) => isActive ? 'active' : ''}>
              <Brain size={16} /> AI Insights
            </NavLink>
            <button onClick={toggleDarkMode} className="theme-toggle">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/ai-insights" element={<AIInsights />} />
          </Routes>
        </main>

        {/* In-app toast notification */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            background: '#1e293b', color: '#fff', borderRadius: 12,
            padding: '16px 20px', maxWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column', gap: 4,
            animation: 'slideIn 0.3s ease'
          }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>🔔 {toast.title}</div>
            {toast.message && <div style={{ fontSize: 13, color: '#94a3b8' }}>{toast.message}</div>}
            <button onClick={() => setToast(null)} style={{
              position: 'absolute', top: 10, right: 12,
              background: 'none', border: 'none', color: '#94a3b8',
              cursor: 'pointer', fontSize: 16, lineHeight: 1
            }}>×</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </Router>
  );
}