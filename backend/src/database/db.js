import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_name TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        phone TEXT,
        size TEXT,
        grade TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        grade TEXT NOT NULL,
        size TEXT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        stock_quantity INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        delivery_date DATE,
        status TEXT DEFAULT 'pending',
        total_amount DECIMAL(12,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL,
        product_id UUID NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(12,2) NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY(product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        customer_id UUID,
        assigned_to TEXT DEFAULT 'unassigned',
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID,
        customer_id UUID,
        title TEXT NOT NULL,
        message TEXT,
        reminder_time TIMESTAMP,
        sound_type TEXT DEFAULT 'reminder',
        is_sent BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE SET NULL,
        FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID,
        order_id UUID,
        activity_type TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE SET NULL
      );
    `);
    console.log('✅ Database tables ready');
  } catch (err) {
    console.error('Database error:', err.message);
  }
}

export async function runAsync(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return result;
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
}

export async function getAsync(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return result.rows[0];
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
}

export async function allAsync(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
}

export default pool;