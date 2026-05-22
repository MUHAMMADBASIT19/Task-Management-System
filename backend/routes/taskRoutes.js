const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getSharedTasks,
  shareTask,
} = require('../controllers/taskController');
const {
  uploadAttachment,
  deleteAttachment,
} = require('../controllers/attachmentController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/shared').get(protect, getSharedTasks);
router.route('/:id').get(protect, getTask).put(protect, updateTask).delete(protect, deleteTask);
router.route('/:id/share').put(protect, shareTask);

// Attachments
router.route('/:id/attachments').post(protect, upload.single('file'), uploadAttachment);
router.route('/:id/attachments/:attachmentId').delete(protect, deleteAttachment);

module.exports = router;
