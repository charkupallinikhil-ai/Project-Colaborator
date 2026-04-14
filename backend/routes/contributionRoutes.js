const express = require('express');
const router = express.Router();
const { getContribution } = require('../controllers/contributionController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/contribution/:projectId
router.get('/:projectId', protect, getContribution);

module.exports = router;
