const express = require('express');
const router = express.Router();
const {
  createProject,
  joinProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, permit } = require('../middleware/authMiddleware');

router.use(protect);

// POST /api/projects/join  — any authenticated user (typically Student)
router.post('/join', joinProject);

// POST /api/projects  — Leader & Teacher only
router.post('/', permit('Leader', 'Teacher'), createProject);

// GET /api/projects
router.get('/', getProjects);

// GET /api/projects/:id
router.get('/:id', getProjectById);

// PUT /api/projects/:id  — Leader & Teacher only
router.put('/:id', permit('Leader', 'Teacher'), updateProject);

// DELETE /api/projects/:id  — Leader & Teacher only
router.delete('/:id', permit('Leader', 'Teacher'), deleteProject);

module.exports = router;
