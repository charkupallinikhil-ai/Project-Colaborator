const express = require('express');
const { createTask, getTasks, updateTask, getTasksByProject, deleteTask } = require('../controllers/taskController');
const auth = require('../middleware/auth');
const { permit } = require('../middleware/roles');

const router = express.Router();

router.post('/', auth, permit('Leader'), createTask);
router.get('/', auth, getTasks);
router.get('/project/:projectId', auth, getTasksByProject);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, permit('Leader'), deleteTask);

module.exports = router;
