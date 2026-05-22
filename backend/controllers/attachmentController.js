const Task = require('../models/Task');
const fs = require('fs');
const path = require('path');

// @desc    Upload file attachment to a task
// @route   POST /api/tasks/:id/attachments
// @access  Private
const uploadAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization: owner or collaborator can upload
    const isOwner = task.owner.toString() === req.user.id;
    const isShared = task.sharedWith.some(id => id.toString() === req.user.id);

    if (!isOwner && !isShared) {
      return res.status(401).json({ message: 'User not authorized to modify this task' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Save attachment details to the task
    const attachment = {
      filename: req.file.originalname,
      path: `/uploads/${req.file.filename}`, // relative URL path to serve
      mimetype: req.file.mimetype,
      size: req.file.size
    };

    task.attachments.push(attachment);
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('owner', 'name email')
      .populate('sharedWith', 'name email');

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a file attachment from a task
// @route   DELETE /api/tasks/:id/attachments/:attachmentId
// @access  Private
const deleteAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only owners or collaborators can delete attachments (let's restrict to owner for highest security)
    if (task.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Only the task owner can delete attachments' });
    }

    const attachmentId = req.params.attachmentId;
    const attachment = task.attachments.id(attachmentId);

    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Remove the file from the local disk
    const filename = path.basename(attachment.path);
    const filePath = path.join(__dirname, '../../uploads', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Pull from the schema array
    task.attachments.pull(attachmentId);
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('owner', 'name email')
      .populate('sharedWith', 'name email');

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadAttachment,
  deleteAttachment,
};
