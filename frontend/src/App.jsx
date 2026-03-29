import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BarChart3, Users, ShoppingCart, CheckCircle, Bell, Moon, Sun, TrendingUp } from 'lucide-react';
import { useStore } from './store/store.js';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Tasks from './pages/Tasks';
import Reminders from './pages/Reminders';
import Analytics from './pages/Analytics';
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
          <div className="nav-links">
            <Link to="/"><BarChart3 size={20} /> Dashboard</Link>
            <Link to="/customers"><Users size={20} /> Customers</Link>
            <Link to="/orders"><ShoppingCart size={20} /> Orders</Link>
            <Link to="/tasks"><CheckCircle size={20} /> Tasks</Link>
            <Link to="/reminders"><Bell size={20} /> Reminders</Link>
            <Link to="/analytics"><TrendingUp size={20} /> Analytics</Link>
            <button 
              onClick={toggleDarkMode}
              className="theme-toggle"
            >
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}