const File = require('../models/File');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { projectId, taskId } = req.body;
    if (!projectId) return res.status(400).json({ message: 'Missing projectId' });

    const file = await File.create({ 
      filename: req.file.filename, 
      projectId, 
      taskId: taskId || null, 
      uploadedBy: req.user.id 
    });
    return res.status(201).json(file);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Upload error' });
  }
};

const getFilesByProject = async (req, res) => {
  try {
    const files = await File.find({ projectId: req.params.projectId }).populate('uploadedBy', 'name email');
    return res.json(files);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getFilesByTask = async (req, res) => {
  try {
    const files = await File.find({ taskId: req.params.taskId }).populate('uploadedBy', 'name email');
    return res.json(files);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    const { role, id } = req.user;
    const isUploader = String(file.uploadedBy) === id;
    const isLeaderOrTeacher = role === 'Leader' || role === 'Teacher';

    if (!isUploader && !isLeaderOrTeacher) {
      return res.status(403).json({ message: 'You can only delete your own files or be a leader/teacher' });
    }

    // Optionally, delete the actual file from disk
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../uploads', file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await File.findByIdAndDelete(req.params.id);
    return res.json({ message: 'File deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { uploadFile, getFilesByProject, getFilesByTask, deleteFile };
