import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BarChart3, Users, ShoppingCart, CheckCircle, Bell } from 'lucide-react';
import { useStore } from './store/store.js';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Tasks from './pages/Tasks';
import Reminders from './pages/Reminders';
import './App.css';

export default function App() {
  const { fetchCustomers, fetchOrders, fetchTasks, fetchReminders, fetchStats } = useStore();

  useEffect(() => {
    fetchCustomers();
    fetchOrders();
    fetchTasks();
    fetchReminders();
    fetchStats();
  }, []);

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <h1>🏢 Steel CRM</h1>
          </div>
          <ul className="nav-links">
            <li><Link to="/"><BarChart3 size={20} /> Dashboard</Link></li>
            <li><Link to="/customers"><Users size={20} /> Customers</Link></li>
            <li><Link to="/orders"><ShoppingCart size={20} /> Orders</Link></li>
            <li><Link to="/tasks"><CheckCircle size={20} /> Tasks</Link></li>
            <li><Link to="/reminders"><Bell size={20} /> Reminders</Link></li>
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