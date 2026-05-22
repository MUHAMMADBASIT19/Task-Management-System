const Task = require('../models/Task');
const mongoose = require('mongoose');

// @desc    Get task overview statistics
// @route   GET /api/analytics/overview
// @access  Private
const getAnalyticsOverview = async (req, res) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.user.id);
    
    // Aggregation pipeline to group tasks by status
    const stats = await Task.aggregate([
      { 
        $match: { 
          $or: [
            { owner: ownerId },
            { sharedWith: ownerId }
          ]
        } 
      },
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    const overview = {
      Pending: 0,
      'In Progress': 0,
      Completed: 0,
      Total: 0,
    };

    stats.forEach((item) => {
      if (overview[item._id] !== undefined) {
        overview[item._id] = item.count;
      }
      overview.Total += item.count;
    });

    res.status(200).json(overview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get task completion vs overdue trends
// @route   GET /api/analytics/trends
// @access  Private
const getAnalyticsTrends = async (req, res) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();

    // 1. Group completed tasks by completion date (updatedAt)
    const completedTrends = await Task.aggregate([
      {
        $match: {
          $or: [
            { owner: ownerId },
            { sharedWith: ownerId }
          ],
          status: 'Completed',
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          completedCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 15 } // Last 15 active days
    ]);

    // 2. Group overdue tasks by due date
    const overdueTrends = await Task.aggregate([
      {
        $match: {
          $or: [
            { owner: ownerId },
            { sharedWith: ownerId }
          ],
          status: { $ne: 'Completed' },
          dueDate: { $lt: now }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$dueDate" } },
          overdueCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 15 }
    ]);

    // Merge trends into a single clean list for charting
    const trendMap = {};

    completedTrends.forEach(item => {
      trendMap[item._id] = { date: item._id, completed: item.completedCount, overdue: 0 };
    });

    overdueTrends.forEach(item => {
      if (trendMap[item._id]) {
        trendMap[item._id].overdue = item.overdueCount;
      } else {
        trendMap[item._id] = { date: item._id, completed: 0, overdue: item.overdueCount };
      }
    });

    const trends = Object.values(trendMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnalyticsOverview,
  getAnalyticsTrends,
};
