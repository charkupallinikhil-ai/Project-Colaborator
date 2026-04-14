const Task = require('../models/Task');
const Project = require('../models/Project');

const getContribution = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = await Task.find({ projectId });

    // Build stats map for all members
    const memberMap = {};
    project.members.forEach((m) => {
      memberMap[m._id.toString()] = {
        name: m.name,
        totalTasks: 0,
        approvedTasks: 0,
        approvedPoints: 0,
      };
    });

    tasks.forEach((task) => {
      const key = task.assignedTo?.toString();
      if (!memberMap[key]) {
        memberMap[key] = { name: 'Unknown', totalTasks: 0, approvedTasks: 0, approvedPoints: 0 };
      }
      memberMap[key].totalTasks += 1;
      // Only APPROVED tasks count toward contribution
      if (task.status === 'Approved' || task.isApproved) {
        memberMap[key].approvedTasks += 1;
        memberMap[key].approvedPoints += task.points || 1;
      }
    });

    const totalApprovedPoints = Object.values(memberMap).reduce(
      (sum, m) => sum + m.approvedPoints, 0
    );

    const contribution = Object.entries(memberMap).map(([, data]) => ({
      name:           data.name,
      totalTasks:     data.totalTasks,
      approvedTasks:  data.approvedTasks,
      approvedPoints: data.approvedPoints,
      // % of total approved points in project
      percent:
        totalApprovedPoints > 0
          ? Number(((data.approvedPoints / totalApprovedPoints) * 100).toFixed(1))
          : 0,
      // personal completion rate
      personalPercent:
        data.totalTasks > 0
          ? Number(((data.approvedTasks / data.totalTasks) * 100).toFixed(1))
          : 0,
    }));

    res.json({
      project:            project.name,
      totalApprovedPoints,
      totalTasks:         tasks.length,
      contribution,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getContribution };
