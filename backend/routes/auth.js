const express = require('express');
const { register, login, getUsers, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { permit } = require('../middleware/roles');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.get('/users', auth, permit('Leader', 'Teacher'), getUsers);

module.exports = router;
