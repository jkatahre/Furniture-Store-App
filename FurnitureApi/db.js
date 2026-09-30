const mysql = require('mysql2/promise');
require('dotenv').config();

let pool = null;

function createPool() {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

async function query(sql, params) {
  if (!pool) createPool();
  try {
    return await pool.query(sql, params);
  } catch (err) {
    // Bubble up error so caller can decide on retries/backoff
    throw err;
  }
}

async function ping() {
  if (!pool) createPool();
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  query,
  ping,
};
