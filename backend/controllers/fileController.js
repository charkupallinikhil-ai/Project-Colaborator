const File = require('../models/File');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ message: 'Missing projectId' });

    const file = await File.create({ filename: req.file.filename, projectId, uploadedBy: req.user.id });
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

module.exports = { uploadFile, getFilesByProject };
