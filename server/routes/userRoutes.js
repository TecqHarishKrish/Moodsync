const express = require('express');
const { protect } = require('../middleware/auth');
const { 
  registerUser, 
  authUser, 
  getUserProfile, 
  updateUserProfile,
  addSleepData
} = require('../controllers/userController');

const router = express.Router();

// Public routes
router.post('/', registerUser);
router.post('/login', authUser);

// Protected routes
router.use(protect);

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

router.post('/sleep-data', addSleepData);

module.exports = router;
