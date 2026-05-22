const express = require('express');
const router = express.Router();
const {
  getAnalyticsOverview,
  getAnalyticsTrends,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/overview', protect, getAnalyticsOverview);
router.get('/trends', protect, getAnalyticsTrends);

module.exports = router;
