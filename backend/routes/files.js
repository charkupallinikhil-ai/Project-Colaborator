const express = require('express');
const multer = require('multer');
const { uploadFile, getFilesByProject, getFilesByTask } = require('../controllers/fileController');
const auth = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/', auth, upload.single('file'), uploadFile);
router.get('/project/:projectId', auth, getFilesByProject);
router.get('/task/:taskId', auth, getFilesByTask);
router.delete('/:id', auth, deleteFile);

module.exports = router;
