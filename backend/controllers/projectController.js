const Project = require('../models/Project');
const User = require('../models/User');

const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const leader = req.user.id;

    const project = await Project.create({ name, description, leader, members });
    return res.status(201).json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getProjects = async (req, res) => {
  try {
    const { role, id } = req.user;
    let query = {};

    if (role === 'Leader') query = { leader: id };
    else if (role === 'Student') query = { members: id };

    const projects = await Project.find(query).populate('leader', 'name email role').populate('members', 'name email');
    return res.json(projects);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('leader', 'name email role').populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role !== 'Leader' && req.user.role !== 'Teacher') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.user.role === 'Leader' && project.leader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own projects' });
    }

    const { name, description, members } = req.body;
    if (name) project.name = name;
    if (description) project.description = description;
    if (members) project.members = members;

    await project.save();
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role !== 'Leader' && req.user.role !== 'Teacher') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.user.role === 'Leader' && project.leader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own projects' });
    }

    await project.remove();
    return res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject };
