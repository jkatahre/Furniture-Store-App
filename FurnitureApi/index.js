const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const db = require('./db');
require('dotenv').config();

// Refuse to start without a strong JWT secret — a weak or missing one lets anyone forge login tokens
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET is missing or too short (min 32 chars). Set it in .env — see .env.example.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Only allow the frontend origins listed in CORS_ORIGIN (comma-separated)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:8100')
  .split(',')
  .map((o) => o.trim());

// Middleware
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./src/routes/authRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Database initialization: Ensure users table exists with retries
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const initDb = async () => {
  const maxAttempts = 6;
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      attempt += 1;
      console.log(`DB init: attempt ${attempt}/${maxAttempts}`);

      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await db.query(createUsersTable);

      const createCartTable = `
        CREATE TABLE IF NOT EXISTS cart (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `;
      await db.query(createCartTable);

      const createOrdersTable = `
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          total_amount DECIMAL(10, 2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `;
      await db.query(createOrdersTable);

      const createOrderItemsTable = `
        CREATE TABLE IF NOT EXISTS order_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
      `;
      await db.query(createOrderItemsTable);

      // Create Products Table and seed if empty
      const createProductsTable = `
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          stock INT DEFAULT 0,
          image_url VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await db.query(createProductsTable);

      try {
        const [countRows] = await db.query('SELECT COUNT(*) AS cnt FROM products');
        const cnt = (countRows && countRows[0] && countRows[0].cnt) || 0;
        if (cnt === 0) {
          console.log('Seeding products table from products.json');
          const prodData = await fs.readFile('./products.json', 'utf8');
          const products = JSON.parse(prodData);
          for (const p of products) {
            await db.query('INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)', [p.name, p.description || null, p.price || 0, p.stock || 0, p.image_url || null]);
          }
          console.log(`Seeded ${products.length} products.`);
        }
      } catch (seedErr) {
        console.warn('Product seeding skipped or failed:', seedErr && seedErr.code ? seedErr.code : seedErr.message || seedErr);
      }

      console.log('Database initialized: All tables ready.');
      return;
    } catch (error) {
      console.error(`DB init attempt ${attempt} failed:`, error.code || error.message);
      if (attempt >= maxAttempts) {
        console.error('Max DB init attempts reached — continuing without DB.');
        return;
      }
      // wait before retrying
      await sleep(3000);
    }
  }
};
initDb();

// API: Get all products
app.get('/getProducts', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    return res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data: rows
    });
  } catch (error) {
    console.warn('DB unavailable, falling back to products.json:', error.code || error.message);
    try {
      const data = await fs.readFile('./products.json', 'utf8');
      const products = JSON.parse(data);
      return res.status(200).json({
        success: true,
        message: 'Products fetched from fallback',
        data: products
      });
    } catch (fsErr) {
      console.error('Failed to read fallback products:', fsErr);
      return res.status(500).json({
        success: false,
        message: 'Unable to fetch products'
      });
    }
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Furniture API is running...');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
