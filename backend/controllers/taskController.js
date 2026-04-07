const Task = require('../models/Task');

const createTask = async (req, res) => {
  try {
    const { title, assignedTo, projectId, status, points } = req.body;
    if (!title || !assignedTo || !projectId) return res.status(400).json({ message: 'Missing required task fields' });

    const task = await Task.create({ title, assignedTo, projectId, status: status || 'Pending', points: points || 1 });
    return res.status(201).json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getTasks = async (req, res) => {
  try {
    const { role, id } = req.user;
    let query = {};

    if (role === 'Student') query = { assignedTo: id };
    if (role === 'Leader') query = { projectId: { $exists: true } };

    const tasks = await Task.find(query).populate('assignedTo', 'name email').populate('projectId', 'name');
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

    const { title, status, points, assignedTo } = req.body;
    if (title) task.title = title;
    if (status) task.status = status;
    if (points !== undefined) task.points = points;
    if (assignedTo) task.assignedTo = assignedTo;

    await task.save();
    return res.json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId }).populate('assignedTo', 'name email').populate('projectId', 'name');
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

module.exports = { createTask, getTasks, updateTask, getTasksByProject, deleteTask };
