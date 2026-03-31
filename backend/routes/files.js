const express = require('express');
const multer = require('multer');
const { uploadFile, getFilesByProject } = require('../controllers/fileController');
const auth = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/', auth, upload.single('file'), uploadFile);
router.get('/:projectId', auth, getFilesByProject);

module.exports = router;
