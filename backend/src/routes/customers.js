import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runAsync, allAsync, getAsync } from '../database/db.js';
import { encryptObject, decryptObject } from '../services/encryption.js';

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await allAsync('SELECT * FROM customers ORDER BY created_at DESC');
    
    // Decrypt sensitive fields
    const decryptedCustomers = customers.map(cust => decryptObject(cust));
    
    res.json(decryptedCustomers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await getAsync('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    
    // Decrypt sensitive fields
    const decryptedCustomer = decryptObject(customer);
    
    res.json(decryptedCustomer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const { company_name, contact_name, phone, size, grade } = req.body;
    const id = uuidv4();

    // Encrypt sensitive data
    const encryptedPhone = phone ? require('../services/encryption.js').encryptData(phone) : null;

    await runAsync(
      `INSERT INTO customers (id, company_name, contact_name, phone, size, grade)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, company_name, contact_name, encryptedPhone, size, grade]
    );

    res.status(201).json({ id, message: 'Customer created securely ✅' });
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { company_name, contact_name, phone, size, grade, status } = req.body;

    // Encrypt sensitive data
    const { encryptData } = require('../services/encryption.js');
    const encryptedPhone = phone ? encryptData(phone) : null;

    await runAsync(
      `UPDATE customers 
       SET company_name = $1, contact_name = $2, phone = $3, size = $4, grade = $5, status = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [company_name, contact_name, encryptedPhone, size, grade, status, req.params.id]
    );

    res.json({ message: 'Customer updated securely ✅' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    await runAsync('DELETE FROM customers WHERE id = $1', [req.params.id]);
    res.json({ message: 'Customer deleted securely ✅' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});