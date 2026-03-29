import axios from 'axios';

const API_URL = 'https://steel-crm.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Customers
export const getCustomers = () => api.get('/customers');
export const getCustomer = (id) => api.get(`/customers/${id}`);
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// Orders
export const getOrders = () => api.get('/orders');
export const getOrdersByCustomer = (customerId) => api.get(`/orders/customer/${customerId}`);
export const createOrder = (data) => api.post('/orders', data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

// Tasks
export const getTasks = () => api.get('/tasks');
export const getTasksByCustomer = (customerId) => api.get(`/tasks/customer/${customerId}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

// Reminders
export const getReminders = () => api.get('/reminders');
export const getPendingReminders = () => api.get('/reminders/pending');
export const createReminder = (data) => api.post('/reminders', data);
export const markReminderSent = (id) => api.put(`/reminders/${id}/sent`);
export const deleteReminder = (id) => api.delete(`/reminders/${id}`);

// Analytics
export const getDashboardStats = () => api.get('/analytics/dashboard');
export const getRevenueData = () => api.get('/analytics/revenue');
export const getOrdersByStatus = () => api.get('/analytics/orders-by-status');
export const getTopCustomers = () => api.get('/analytics/top-customers');

export default api;