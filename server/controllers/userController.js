const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  findUserByEmail,
  createUser,
  updateUser,
  addSleepData: addSleepDataToStorage,
  createSession,
  findSessionByToken,
  removeSession
} = require('../utils/memoryStorage');

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user exists
    const userExists = findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = createUser({
      username,
      email,
      password: hashedPassword
    });

    // Create session
    const session = createSession(user._id);
    
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      preferences: user.preferences,
      aiSettings: user.aiSettings,
      token: session.token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = findUserByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create new session
      const session = createSession(user._id);
      
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences,
        aiSettings: user.aiSettings,
        token: session.token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = req.user; // Set by auth middleware
    
    if (user) {
      // Remove sensitive data
      const { password, ...userData } = user;
      res.json(userData);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const updates = {};
    
    if (req.body.username) updates.username = req.body.username;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.preferences) updates.preferences = { ...req.user.preferences, ...req.body.preferences };
    if (req.body.aiSettings) updates.aiSettings = { ...req.user.aiSettings, ...req.body.aiSettings };
    
    const updatedUser = updateUser(req.user._id, updates);
    
    if (updatedUser) {
      const { password, ...userData } = updatedUser;
      res.json(userData);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add sleep data
// @route   POST /api/users/sleep-data
// @access  Private
const addSleepData = async (req, res) => {
  try {
    const { wakeTime, mood, reactionTime, snoozeCount, sleepQuality, notes, environmentalData } = req.body;
    
    const sleepEntry = addSleepDataToStorage(req.user._id, {
      wakeTime: wakeTime || new Date(),
      mood,
      reactionTime,
      snoozeCount: snoozeCount || 0,
      sleepQuality,
      notes,
      environmentalData
    });
    
    if (sleepEntry) {
      res.status(201).json(sleepEntry);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Add sleep data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Private
const logoutUser = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    removeSession(token);
  }
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  addSleepData,
  logoutUser
};
