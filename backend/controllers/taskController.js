const Task = require('../models/Task');
const Joi = require('joi');

// @desc    Get all tasks owned by user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user.id })
      .populate('owner', 'name email')
      .populate('sharedWith', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('sharedWith', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization: must be owner or collaborator
    const isOwner = task.owner.toString() === req.user.id;
    const isShared = task.sharedWith.some(user => user._id.toString() === req.user.id);

    if (!isOwner && !isShared) {
      return res.status(401).json({ message: 'User not authorized to view this task' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    status: Joi.string().valid('Pending', 'In Progress', 'Completed'),
    dueDate: Joi.date().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const task = await Task.create({
      ...req.body,
      owner: req.user.id,
      user: req.user.id, // For backward compatibility
    });
    
    const populatedTask = await Task.findById(task._id).populate('owner', 'name email');
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isOwner = task.owner.toString() === req.user.id;
    const isShared = task.sharedWith.some(id => id.toString() === req.user.id);

    if (!isOwner && !isShared) {
      return res.status(401).json({ message: 'User not authorized to update this task' });
    }

    let updateData = req.body;

    // Security check: shared users can only update status
    if (isShared && !isOwner) {
      if (req.body.title !== undefined || req.body.description !== undefined || req.body.dueDate !== undefined) {
        return res.status(403).json({ message: 'Collaborators are only authorized to update task status' });
      }
      updateData = { status: req.body.status };
    }

    const originalStatus = task.status;
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name email').populate('sharedWith', 'name email');

    // Trigger Notification for Status Update
    if (updateData.status && updateData.status !== originalStatus) {
      const Notification = require('../models/Notification');
      
      if (isOwner) {
        // Notify all collaborators
        for (const collaborator of task.sharedWith) {
          const notification = await Notification.create({
            recipient: collaborator,
            sender: req.user.id,
            task: task._id,
            type: 'status_update',
            message: `Task "${task.title}" status was updated to "${updateData.status}" by owner ${req.user.name}.`,
          });

          const io = req.app.get('io');
          if (io) {
            io.to(collaborator.toString()).emit('notification', {
              ...notification.toObject(),
              sender: { name: req.user.name },
              task: { title: task.title }
            });
          }
        }
      } else {
        // Collaborator updated status -> notify owner
        const notification = await Notification.create({
          recipient: task.owner,
          sender: req.user.id,
          task: task._id,
          type: 'status_update',
          message: `Task "${task.title}" status was updated to "${updateData.status}" by collaborator ${req.user.name}.`,
        });

        const io = req.app.get('io');
        if (io) {
          io.to(task.owner.toString()).emit('notification', {
            ...notification.toObject(),
            sender: { name: req.user.name },
            task: { title: task.title }
          });
        }
      }
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only owners can delete tasks
    if (task.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to delete this task' });
    }

    await task.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Retrieve tasks shared with the user
// @route   GET /api/tasks/shared
// @access  Private
const getSharedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ sharedWith: req.user.id })
      .populate('owner', 'name email')
      .populate('sharedWith', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Share tasks with other users
// @route   PUT /api/tasks/:id/share
// @access  Private
const shareTask = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Please provide a user email to share with' });
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only task owner can share
    if (task.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the task owner can share this task' });
    }

    // Find the target user by email
    const User = require('../models/User');
    const targetUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!targetUser) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    // Cannot share with self
    if (targetUser._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot share a task with yourself' });
    }

    // Check if task is already shared with this user
    if (task.sharedWith.includes(targetUser._id)) {
      return res.status(400).json({ message: 'Task is already shared with this user' });
    }

    // Add user ID to shared list
    task.sharedWith.push(targetUser._id);
    await task.save();

    // Create Notification
    const Notification = require('../models/Notification');
    const notification = await Notification.create({
      recipient: targetUser._id,
      sender: req.user.id,
      task: task._id,
      type: 'share',
      message: `${req.user.name} shared the task "${task.title}" with you.`,
    });

    // Real-Time Emit via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(targetUser._id.toString()).emit('notification', {
        ...notification.toObject(),
        sender: { name: req.user.name, email: req.user.email },
        task: { title: task.title }
      });
    }

    const updatedTask = await Task.findById(task._id)
      .populate('owner', 'name email')
      .populate('sharedWith', 'name email');

    res.status(200).json({ message: 'Task shared successfully', task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getSharedTasks,
  shareTask,
};
