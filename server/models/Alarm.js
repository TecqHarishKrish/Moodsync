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
    enum: ['default', 'gentle', 'nature', 'digital', 'classic']
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
    default: false // AI-based optimal wake time
  },
  smartWakeWindow: {
    type: Number,
    default: 30, // minutes before alarm
    min: 10,
    max: 60
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

// Method to check if alarm should trigger today
alarmSchema.methods.shouldTriggerToday = function() {
  if (!this.isEnabled) return false;
  
  const today = new Date().getDay();
  
  // If no repeat days set, it's a one-time alarm
  if (this.repeatDays.length === 0) return true;
  
  // Check if today is in repeat days
  return this.repeatDays.includes(today);
};

// Method to get next trigger time
alarmSchema.methods.getNextTriggerTime = function() {
  const now = new Date();
  const [hours, minutes] = this.time.split(':').map(Number);
  
  const nextTrigger = new Date();
  nextTrigger.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, set to tomorrow
  if (nextTrigger <= now) {
    nextTrigger.setDate(nextTrigger.getDate() + 1);
  }
  
  // If repeat days are set, find next valid day
  if (this.repeatDays.length > 0) {
    while (!this.repeatDays.includes(nextTrigger.getDay())) {
      nextTrigger.setDate(nextTrigger.getDate() + 1);
    }
  }
  
  return nextTrigger;
};

module.exports = mongoose.model('Alarm', alarmSchema);
