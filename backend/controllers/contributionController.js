const Task = require('../models/Task');
const Project = require('../models/Project');

const getContribution = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = await Task.find({ projectId });
    const participants = project.members.map((m) => ({ id: m._id.toString(), name: m.name, points: 0 }));
    const totalPoints = tasks.reduce((acc, t) => acc + (t.points || 0), 0);

    tasks.forEach((task) => {
      const member = participants.find((p) => p.id === task.assignedTo.toString());
      if (member && task.status === 'Done') member.points += task.points || 0;
    });

    const result = participants.map((item) => ({
      name: item.name,
      completedPoints: item.points,
      percent: totalPoints > 0 ? Number(((item.points / totalPoints) * 100).toFixed(1)) : 0,
    }));

    res.json({ project: project.name, totalPoints, contribution: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getContribution };
