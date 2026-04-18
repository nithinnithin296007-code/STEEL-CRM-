import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { BarChart3, Users, ShoppingCart, CheckCircle, Bell, Moon, Sun, TrendingUp, Brain } from 'lucide-react';
import { useStore } from './store/store.js';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Tasks from './pages/Tasks';
import Reminders from './pages/Reminders';
import Analytics from './pages/Analytics';
import AIInsights from './pages/AIInsights';
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
              <Bell size={16} /> Reminders
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
              <TrendingUp size={16} /> Analytics
            </NavLink>
            <NavLink to="/ai-insights" className={({ isActive }) => isActive ? 'active' : ''}>
              <Brain size={16} /> AI Insights
            </NavLink>
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
            <Route path="/ai-insights" element={<AIInsights />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}