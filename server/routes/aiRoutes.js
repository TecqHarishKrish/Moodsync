const express = require('express');
const { protect } = require('../middleware/auth');
const { 
  processMood, 
  getSleepInsights, 
  getOptimalWakeTime 
} = require('../controllers/aiController');

const router = express.Router();

// Protect all AI routes
router.use(protect);

// Mood detection endpoint (fallback for server-side processing)
router.post('/process-mood', processMood);

// Sleep analysis endpoints
router.get('/sleep-insights', getSleepInsights);
router.get('/optimal-wake-time', getOptimalWakeTime);

module.exports = router;
