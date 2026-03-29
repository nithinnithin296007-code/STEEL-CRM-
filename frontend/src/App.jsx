import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BarChart3, Users, ShoppingCart, CheckCircle, Bell, Moon, Sun } from 'lucide-react';
import { useStore } from './store/store.js';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Tasks from './pages/Tasks';
import Reminders from './pages/Reminders';
import './App.css';

export default function App() {
  const { fetchCustomers, fetchOrders, fetchTasks, fetchReminders, fetchStats } = useStore();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchOrders();
    fetchTasks();
    fetchReminders();
    fetchStats();

    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    const newTheme = !isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">🏢 Steel CRM</div>
          <ul className="nav-links">
            <li><Link to="/"><BarChart3 size={20} /> Dashboard</Link></li>
            <li><Link to="/customers"><Users size={20} /> Customers</Link></li>
            <li><Link to="/orders"><ShoppingCart size={20} /> Orders</Link></li>
            <li><Link to="/tasks"><CheckCircle size={20} /> Tasks</Link></li>
            <li><Link to="/reminders"><Bell size={20} /> Reminders</Link></li>
            <li>
              <button 
                onClick={toggleDarkMode}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px'
                }}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                {isDark ? 'Light' : 'Dark'}
              </button>
            </li>
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/reminders" element={<Reminders />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}