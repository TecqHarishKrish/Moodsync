const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password not required if using Google OAuth
    },
    minlength: 6
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values to be non-unique
  },
  avatar: {
    type: String // Store Google profile picture URL
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  preferences: {
    wakeWindow: {
      start: { type: String, default: '06:30' },
      end: { type: String, default: '07:30' }
    },
    privacy: {
      allowCamera: { type: Boolean, default: false },
      allowMicrophone: { type: Boolean, default: false },
      allowNotifications: { type: Boolean, default: true }
    },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' }
  },
  aiSettings: {
    useMoodDetection: { type: Boolean, default: false },
    useVoiceDetection: { type: Boolean, default: false },
    useAmbientSensing: { type: Boolean, default: true },
    learningRate: { type: Number, default: 0.1, min: 0.01, max: 1 }
  },
  sleepData: [{
    date: { type: Date, default: Date.now },
    wakeTime: Date,
    mood: { type: Number, min: 1, max: 5 },
    reactionTime: Number,
    snoozeCount: { type: Number, default: 0 },
    sleepQuality: { type: Number, min: 1, max: 5 },
    notes: String,
    aiConfidence: Number,
    environmentalData: {
      brightness: Number,
      noiseLevel: Number,
      temperature: Number
    }
  }],
  aiModel: {
    // Store AI model parameters for personalization
    readinessThreshold: { type: Number, default: 0.7 },
    moodWeights: {
      mood: { type: Number, default: 0.6 },
      reactionTime: { type: Number, default: 0.3 },
      sleepQuality: { type: Number, default: 0.1 }
    },
    lastTrained: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to update AI model based on new data
userSchema.methods.updateAIModel = function(newData) {
  // Simple moving average update for weights
  const learningRate = this.aiSettings.learningRate;
  
  this.aiModel.moodWeights.mood = (1 - learningRate) * this.aiModel.moodWeights.mood + 
                                 learningRate * (newData.mood || 0);
  
  this.aiModel.moodWeights.reactionTime = (1 - learningRate) * this.aiModel.moodWeights.reactionTime + 
                                        learningRate * (newData.reactionTime || 0);
  
  this.aiModel.moodWeights.sleepQuality = (1 - learningRate) * this.aiModel.moodWeights.sleepQuality + 
                                         learningRate * (newData.sleepQuality || 0);
  
  this.aiModel.lastTrained = Date.now();
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
