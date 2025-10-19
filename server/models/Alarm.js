const mongoose = require('mongoose');

const alarmSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  time: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  label: {
    type: String,
    default: 'Alarm'
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  repeatDays: {
    type: [Number], // 0-6 (Sunday-Saturday)
    default: []
  },
  sound: {
    type: String,
    default: 'default',
    enum: ['default', 'gentle', 'nature', 'digital', 'classic', 'birds', 'ocean']
  },
  volume: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  snoozeEnabled: {
    type: Boolean,
    default: true
  },
  snoozeDuration: {
    type: Number,
    default: 5, // minutes
    min: 1,
    max: 30
  },
  vibrate: {
    type: Boolean,
    default: true
  },
  gradualWake: {
    type: Boolean,
    default: false
  },
  smartWake: {
    type: Boolean,
    default: false // Uses AI to wake at optimal time
  },
  smartWakeWindow: {
    type: Number,
    default: 30, // minutes before alarm time
    min: 10,
    max: 60
  },
  challenges: {
    enabled: { type: Boolean, default: false },
    type: { 
      type: String, 
      enum: ['math', 'shake', 'scan', 'memory', 'typing'],
      default: 'math'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  },
  weather: {
    enabled: { type: Boolean, default: false },
    location: { type: String, default: '' }
  },
  lastTriggered: {
    type: Date
  },
  snoozeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Method to check if alarm should ring today
alarmSchema.methods.shouldRingToday = function() {
  if (!this.isEnabled) return false;
  
  const today = new Date().getDay();
  
  // If no repeat days set, it's a one-time alarm
  if (this.repeatDays.length === 0) {
    return true;
  }
  
  // Check if today is in repeat days
  return this.repeatDays.includes(today);
};

// Method to get next alarm time
alarmSchema.methods.getNextAlarmTime = function() {
  const now = new Date();
  const [hours, minutes] = this.time.split(':').map(Number);
  
  const alarmTime = new Date();
  alarmTime.setHours(hours, minutes, 0, 0);
  
  // If alarm time has passed today, set for tomorrow
  if (alarmTime <= now) {
    alarmTime.setDate(alarmTime.getDate() + 1);
  }
  
  return alarmTime;
};

module.exports = mongoose.model('Alarm', alarmSchema);
