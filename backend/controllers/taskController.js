const Task = require('../models/Task');
const Project = require('../models/Project');

const populate = [
  { path: 'assignedTo', select: 'name email role' },
  { path: 'projectId', select: 'name joinCode members' },
];

const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, projectId, deadline, points } = req.body;
    if (!title || !assignedTo || !projectId)
      return res.status(400).json({ message: 'title, assignedTo and projectId are required' });

    // Validate project exists
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Validate assignedTo is a member of the project
    const isMember = project.members.map(String).includes(String(assignedTo));
    if (!isMember)
      return res.status(400).json({ message: 'Assigned user is not a member of this project' });

    const task = await Task.create({
      title,
      description: description || '',
      assignedTo,
      projectId,
      status: 'Pending',
      deadline: deadline || null,
      points: points || 1,
    });

    const populated = await task.populate(populate);
    return res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getTasks = async (req, res) => {
  try {
    const { role, id } = req.user;
    const query = role === 'Student' ? { assignedTo: id } : {};

    const tasks = await Task.find(query)
      .populate(populate)
      .sort({ createdAt: -1 });

    return res.json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { role, id } = req.user;
    const { title, description, status, points, assignedTo, deadline, submissionLink } = req.body;

    if (role === 'Student') {
      // Students can only update their own tasks
      if (String(task.assignedTo) !== id)
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });

      // Allowed status transitions for students
      const allowed = { 'Pending': 'In Progress', 'In Progress': 'In Progress' };
      if (status && !['In Progress'].includes(status))
        return res.status(403).json({ message: 'Students can only move tasks to "In Progress"' });

      if (status) task.status = status;

      // Students can submit a submission link — changes status to Submitted
      if (submissionLink !== undefined) {
        task.submissionLink = submissionLink;
        if (submissionLink.trim()) task.status = 'Submitted';
      }
    } else {
      // Leader / Teacher — full control
      if (title)                       task.title = title;
      if (description !== undefined)   task.description = description;
      if (deadline !== undefined)      task.deadline = deadline;
      if (points !== undefined)        task.points = points;
      if (assignedTo)                  task.assignedTo = assignedTo;
      if (submissionLink !== undefined) task.submissionLink = submissionLink;

      // Handle approval/rejection via status
      if (status === 'Approved') {
        task.status = 'Approved';
        task.isApproved = true;
      } else if (status === 'In Progress') {
        // Rejection — send back to In Progress
        task.status = 'In Progress';
        task.isApproved = false;
      } else if (status) {
        task.status = status;
      }
    }

    await task.save();
    const populated = await task.populate(populate);
    return res.json(populated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// PUT /tasks/:id/approve  — Leader/Teacher only
const approveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.status !== 'Submitted')
      return res.status(400).json({ message: 'Only submitted tasks can be approved' });

    task.status = 'Approved';
    task.isApproved = true;
    await task.save();
    const populated = await task.populate(populate);
    return res.json(populated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// PUT /tasks/:id/reject  — Leader/Teacher only
const rejectTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!['Submitted', 'Approved'].includes(task.status))
      return res.status(400).json({ message: 'Only submitted or approved tasks can be rejected' });

    task.status = 'In Progress';
    task.isApproved = false;
    await task.save();
    const populated = await task.populate(populate);
    return res.json(populated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId }).populate(populate);
    return res.json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await Task.deleteOne({ _id: req.params.id });
    return res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createTask, getTasks, updateTask, approveTask, rejectTask, getTasksByProject, deleteTask };
