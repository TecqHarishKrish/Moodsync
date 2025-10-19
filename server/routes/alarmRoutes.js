const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getAlarms,
  getAlarm,
  createAlarm,
  updateAlarm,
  toggleAlarm,
  deleteAlarm,
  snoozeAlarm,
  dismissAlarm,
  getUpcomingAlarms
} = require('../controllers/alarmController');

const router = express.Router();

// Protect all alarm routes
router.use(protect);

// Alarm CRUD routes
router.route('/')
  .get(getAlarms)
  .post(createAlarm);

router.get('/upcoming', getUpcomingAlarms);

router.route('/:id')
  .get(getAlarm)
  .put(updateAlarm)
  .delete(deleteAlarm);

// Alarm actions
router.patch('/:id/toggle', toggleAlarm);
router.post('/:id/snooze', snoozeAlarm);
router.post('/:id/dismiss', dismissAlarm);

module.exports = router;
