const Project = require('../models/Project');
const User = require('../models/User');
const crypto = require('crypto');

// Generate unique 6-character alphanumeric join code
function generateJoinCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
}

const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    if (!name || !description) return res.status(400).json({ message: 'Name and description are required' });

    const leader = req.user.id;

    // Build member list — always include the creator
    let memberIds = Array.isArray(members) ? [...members] : [];
    if (!memberIds.includes(leader)) memberIds.unshift(leader);

    // Generate a unique join code
    let joinCode;
    let attempts = 0;
    do {
      joinCode = generateJoinCode();
      const exists = await Project.findOne({ joinCode });
      if (!exists) break;
      attempts++;
    } while (attempts < 10);

    const project = await Project.create({
      name,
      description,
      joinCode,
      createdBy: leader,
      leader,
      members: memberIds,
    });

    const populated = await project.populate([
      { path: 'leader', select: 'name email role' },
      { path: 'createdBy', select: 'name email role' },
      { path: 'members', select: 'name email role' },
    ]);

    return res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/projects/join  — Student joins via join code
const joinProject = async (req, res) => {
  try {
    const { joinCode } = req.body;
    if (!joinCode) return res.status(400).json({ message: 'Join code is required' });

    const project = await Project.findOne({ joinCode: joinCode.toUpperCase().trim() });
    if (!project) return res.status(404).json({ message: 'Invalid join code — no project found' });

    const userId = req.user.id;
    if (project.members.map(String).includes(userId)) {
      return res.status(400).json({ message: 'You are already a member of this project' });
    }

    project.members.push(userId);
    await project.save();

    const populated = await project.populate([
      { path: 'leader', select: 'name email role' },
      { path: 'members', select: 'name email role' },
    ]);

    return res.json({ message: 'Successfully joined the project!', project: populated });
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
    // Teacher sees all projects

    const projects = await Project.find(query)
      .populate('leader', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    return res.json(projects);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('leader', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');
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

    if (req.user.role === 'Leader' && project.leader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own projects' });
    }

    await Project.deleteOne({ _id: req.params.id });
    return res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createProject, joinProject, getProjects, getProjectById, updateProject, deleteProject };
