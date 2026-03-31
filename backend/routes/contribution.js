const express = require('express');
const { getContribution } = require('../controllers/contributionController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:projectId', auth, getContribution);

module.exports = router;
