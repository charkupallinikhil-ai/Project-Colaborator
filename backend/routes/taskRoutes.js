const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  approveTask,
  rejectTask,
  getTasksByProject,
  deleteTask,
} = require('../controllers/taskController');
const { protect, permit } = require('../middleware/authMiddleware');

router.use(protect);

// POST /api/tasks  — Leader & Teacher only
router.post('/', permit('Leader', 'Teacher'), createTask);

// GET /api/tasks  — all roles (backend filters by role)
router.get('/', getTasks);

// GET /api/tasks/project/:projectId
router.get('/project/:projectId', getTasksByProject);

// PUT /api/tasks/:id/approve  — Leader & Teacher only
router.put('/:id/approve', permit('Leader', 'Teacher'), approveTask);

// PUT /api/tasks/:id/reject   — Leader & Teacher only
router.put('/:id/reject', permit('Leader', 'Teacher'), rejectTask);

// PUT /api/tasks/:id  — all roles (backend enforces student restrictions)
router.put('/:id', updateTask);

// DELETE /api/tasks/:id  — Leader & Teacher only
router.delete('/:id', permit('Leader', 'Teacher'), deleteTask);

module.exports = router;
