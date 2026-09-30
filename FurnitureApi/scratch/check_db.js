const db = require('../db');

async function checkTable() {
  try {
    const [rows] = await db.query('DESCRIBE users');
    console.log('Users Table Structure:');
    console.table(rows);
    
    const [users] = await db.query('SELECT * FROM users');
    console.log('\nCurrent Users in DB:');
    console.table(users);
    
    process.exit(0);
  } catch (err) {
    console.error('Error checking database:', err);
    process.exit(1);
  }
}

checkTable();
