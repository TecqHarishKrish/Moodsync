// In-memory storage for users and sessions
const users = [];
const sessions = [];

// Generate a simple ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Find user by ID
const findUserById = (id) => users.find(user => user._id === id);

// Find user by email
const findUserByEmail = (email) => users.find(user => user.email === email);

// Create a new user
const createUser = (userData) => {
  const user = {
    _id: generateId(),
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
    sleepData: [],
    preferences: {
      wakeWindow: { start: '06:30', end: '07:30' },
      privacy: { allowCamera: false, allowMicrophone: false, allowNotifications: true },
      theme: 'system',
      ...userData.preferences
    },
    aiSettings: {
      useMoodDetection: false,
      useVoiceDetection: false,
      useAmbientSensing: true,
      learningRate: 0.1,
      ...userData.aiSettings
    },
    aiModel: {
      readinessThreshold: 0.7,
      moodWeights: {
        mood: 0.6,
        reactionTime: 0.3,
        sleepQuality: 0.1
      },
      lastTrained: null
    }
  };
  
  users.push(user);
  return user;
};

// Update user
const updateUser = (id, updates) => {
  const userIndex = users.findIndex(u => u._id === id);
  if (userIndex === -1) return null;
  
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date()
  };
  
  return users[userIndex];
};

// Add sleep data to user
const addSleepData = (userId, data) => {
  const user = findUserById(userId);
  if (!user) return null;
  
  const sleepEntry = {
    _id: generateId(),
    date: new Date(),
    ...data,
    wakeTime: data.wakeTime || new Date()
  };
  
  user.sleepData = [...(user.sleepData || []), sleepEntry];
  
  // Update AI model (simplified)
  if (data.mood || data.reactionTime || data.sleepQuality) {
    const learningRate = user.aiSettings.learningRate || 0.1;
    
    user.aiModel.moodWeights = {
      mood: (1 - learningRate) * user.aiModel.moodWeights.mood + learningRate * (data.mood || 0),
      reactionTime: (1 - learningRate) * user.aiModel.moodWeights.reactionTime + learningRate * ((data.reactionTime || 0) / 1000),
      sleepQuality: (1 - learningRate) * user.aiModel.moodWeights.sleepQuality + learningRate * (data.sleepQuality || 0)
    };
    
    user.aiModel.lastTrained = new Date();
  }
  
  return sleepEntry;
};

// Create session
const createSession = (userId) => {
  const session = {
    _id: generateId(),
    userId,
    token: generateId() + generateId(), // Simple token generation
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  };
  
  sessions.push(session);
  return session;
};

// Find session by token
const findSessionByToken = (token) => {
  return sessions.find(session => session.token === token && session.expiresAt > new Date());
};

// Remove session
const removeSession = (token) => {
  const index = sessions.findIndex(s => s.token === token);
  if (index !== -1) {
    sessions.splice(index, 1);
    return true;
  }
  return false;
};

// Add some test users if none exist
if (users.length === 0) {
  createUser({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    preferences: {
      wakeWindow: { start: '06:00', end: '07:00' },
      theme: 'dark'
    }
  });
}

module.exports = {
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  addSleepData,
  createSession,
  findSessionByToken,
  removeSession
};
