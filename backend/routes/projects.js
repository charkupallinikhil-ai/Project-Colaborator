const express = require('express');
const { createProject, getProjects, getProjectById, updateProject, deleteProject } = require('../controllers/projectController');
const auth = require('../middleware/auth');
const { permit } = require('../middleware/roles');

const router = express.Router();

router.post('/', auth, permit('Leader', 'Teacher'), createProject);
router.get('/', auth, getProjects);
router.get('/:id', auth, getProjectById);
router.put('/:id', auth, permit('Leader', 'Teacher'), updateProject);
router.delete('/:id', auth, permit('Leader', 'Teacher'), deleteProject);

module.exports = router;
