const express = require('express');
const { createTask, getTasks, updateTask, getTasksByProject, deleteTask } = require('../controllers/taskController');
const auth = require('../middleware/auth');
const { permit } = require('../middleware/roles');

const router = express.Router();

router.post('/', auth, permit('Leader', 'Teacher'), createTask);
router.get('/', auth, getTasks);
router.get('/project/:projectId', auth, getTasksByProject);
router.put('/:id', auth, updateTask); // Students can update their own tasks
router.delete('/:id', auth, permit('Leader', 'Teacher'), deleteTask);

module.exports = router;
