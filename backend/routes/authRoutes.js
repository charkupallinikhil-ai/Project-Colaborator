const express = require('express');
const router = express.Router();
const { register, login, getUsers, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/users  (requires login, any role)
router.get('/users', protect, getUsers);

// GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
