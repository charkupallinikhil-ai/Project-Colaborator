const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  description:    { type: String, default: '' },
  assignedTo:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Submitted', 'Approved'],
    default: 'Pending',
  },
  submissionLink: { type: String, default: '' },
  isApproved:     { type: Boolean, default: false },
  deadline:       { type: Date },
  points:         { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
