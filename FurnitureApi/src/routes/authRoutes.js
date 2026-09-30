const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Define auth routes
router.post('/register', register);
router.post('/login', login);

// Private profile route, requires Bearer token
router.get('/profile', protect, getProfile);

// Health check for database connection
router.get('/health', (req, res) => {
  const db = require('../../db');
  db.query('SELECT 1 + 1 AS solution')
    .then(([rows]) => res.status(200).json({ success: true, message: 'Database connected!' }))
    .catch((err) => res.status(500).json({ success: false, message: 'Database connection failed!' }));
});

module.exports = router;
