import { create } from 'zustand';
import * as apiService from '../services/api.js';

export const useStore = create((set, get) => ({
  // Customers
  customers: [],
  selectedCustomer: null,
  loadingCustomers: false,

  fetchCustomers: async () => {
    set({ loadingCustomers: true });
    try {
      const response = await apiService.getCustomers();
      set({ customers: response.data, loadingCustomers: false });
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      set({ loadingCustomers: false });
    }
  },

  addCustomer: async (customerData) => {
    try {
      await apiService.createCustomer(customerData);
      get().fetchCustomers();
      return true;
    } catch (error) {
      console.error('Failed to add customer:', error);
      return false;
    }
  },

  updateCustomer: async (id, customerData) => {
    try {
      await apiService.updateCustomer(id, customerData);
      get().fetchCustomers();
      return true;
    } catch (error) {
      console.error('Failed to update customer:', error);
      return false;
    }
  },

  deleteCustomer: async (id) => {
    try {
      await apiService.deleteCustomer(id);
      get().fetchCustomers();
      return true;
    } catch (error) {
      console.error('Failed to delete customer:', error);
      return false;
    }
  },

  // Orders
  orders: [],
  loadingOrders: false,

  fetchOrders: async () => {
    set({ loadingOrders: true });
    try {
      const response = await apiService.getOrders();
      set({ orders: response.data, loadingOrders: false });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      set({ loadingOrders: false });
    }
  },

  addOrder: async (orderData) => {
    try {
      await apiService.createOrder(orderData);
      get().fetchOrders();
      return true;
    } catch (error) {
      console.error('Failed to add order:', error);
      return false;
    }
  },

  updateOrder: async (id, orderData) => {
    try {
      await apiService.updateOrder(id, orderData);
      get().fetchOrders();
      return true;
    } catch (error) {
      console.error('Failed to update order:', error);
      return false;
    }
  },

  deleteOrder: async (id) => {
    try {
      await apiService.deleteOrder(id);
      get().fetchOrders();
      return true;
    } catch (error) {
      console.error('Failed to delete order:', error);
      return false;
    }
  },

  // Tasks
  tasks: [],
  loadingTasks: false,

  fetchTasks: async () => {
    set({ loadingTasks: true });
    try {
      const response = await apiService.getTasks();
      set({ tasks: response.data, loadingTasks: false });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      set({ loadingTasks: false });
    }
  },

  addTask: async (taskData) => {
    try {
      await apiService.createTask(taskData);
      get().fetchTasks();
      return true;
    } catch (error) {
      console.error('Failed to add task:', error);
      return false;
    }
  },

  updateTask: async (id, taskData) => {
    try {
      await apiService.updateTask(id, taskData);
      get().fetchTasks();
      return true;
    } catch (error) {
      console.error('Failed to update task:', error);
      return false;
    }
  },

  deleteTask: async (id) => {
    try {
      await apiService.deleteTask(id);
      get().fetchTasks();
      return true;
    } catch (error) {
      console.error('Failed to delete task:', error);
      return false;
    }
  },

  // Reminders
  reminders: [],
  loadingReminders: false,

  fetchReminders: async () => {
    set({ loadingReminders: true });
    try {
      const response = await apiService.getReminders();
      set({ reminders: response.data, loadingReminders: false });
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
      set({ loadingReminders: false });
    }
  },

 addReminder: async (reminderData) => {
  try {
    await apiService.createReminder({
      ...reminderData,
      sound_type: reminderData.sound_type || 'reminder'
    });
    get().fetchReminders();
    return true;
  } catch (error) {
    console.error('Failed to add reminder:', error);
    return false;
  }
},

  deleteReminder: async (id) => {
    try {
      await apiService.deleteReminder(id);
      get().fetchReminders();
      return true;
    } catch (error) {
      console.error('Failed to delete reminder:', error);
      return false;
    }
  },

  // Analytics
  stats: null,
  loadingStats: false,

  fetchStats: async () => {
    set({ loadingStats: true });
    try {
      const response = await apiService.getDashboardStats();
      set({ stats: response.data, loadingStats: false });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      set({ loadingStats: false });
    }
  },
}));