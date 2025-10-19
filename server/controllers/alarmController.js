const Alarm = require('../models/Alarm');

// @desc    Get all alarms for user
// @route   GET /api/alarms
// @access  Private
exports.getAlarms = async (req, res) => {
  try {
    const alarms = await Alarm.find({ userId: req.user._id }).sort({ time: 1 });
    res.json(alarms);
  } catch (error) {
    console.error('Get alarms error:', error);
    res.status(500).json({ message: 'Error fetching alarms' });
  }
};

// @desc    Get single alarm
// @route   GET /api/alarms/:id
// @access  Private
exports.getAlarm = async (req, res) => {
  try {
    const alarm = await Alarm.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!alarm) {
      return res.status(404).json({ message: 'Alarm not found' });
    }
    
    res.json(alarm);
  } catch (error) {
    console.error('Get alarm error:', error);
    res.status(500).json({ message: 'Error fetching alarm' });
  }
};

// @desc    Create new alarm
// @route   POST /api/alarms
// @access  Private
exports.createAlarm = async (req, res) => {
  try {
    const {
      time,
      label,
      isEnabled,
      repeatDays,
      sound,
      volume,
      snoozeEnabled,
      snoozeDuration,
      vibrate,
      gradualWake,
      smartWake,
      smartWakeWindow
    } = req.body;
    
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!time || !timeRegex.test(time)) {
      return res.status(400).json({ message: 'Invalid time format. Use HH:MM' });
    }
    
    const alarm = await Alarm.create({
      userId: req.user._id,
      time,
      label: label || 'Alarm',
      isEnabled: isEnabled !== undefined ? isEnabled : true,
      repeatDays: repeatDays || [],
      sound: sound || 'default',
      volume: volume !== undefined ? volume : 50,
      snoozeEnabled: snoozeEnabled !== undefined ? snoozeEnabled : true,
      snoozeDuration: snoozeDuration || 5,
      vibrate: vibrate !== undefined ? vibrate : true,
      gradualWake: gradualWake || false,
      smartWake: smartWake || false,
      smartWakeWindow: smartWakeWindow || 30
    });
    
    res.status(201).json(alarm);
  } catch (error) {
    console.error('Create alarm error:', error);
    res.status(500).json({ message: 'Error creating alarm' });
  }
};

// @desc    Update alarm
// @route   PUT /api/alarms/:id
// @access  Private
exports.updateAlarm = async (req, res) => {
  try {
    const alarm = await Alarm.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!alarm) {
      return res.status(404).json({ message: 'Alarm not found' });
    }
    
    // Validate time if provided
    if (req.body.time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(req.body.time)) {
        return res.status(400).json({ message: 'Invalid time format. Use HH:MM' });
      }
    }
    
    // Update fields
    const allowedUpdates = [
      'time', 'label', 'isEnabled', 'repeatDays', 'sound', 'volume',
      'snoozeEnabled', 'snoozeDuration', 'vibrate', 'gradualWake',
      'smartWake', 'smartWakeWindow'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        alarm[field] = req.body[field];
      }
    });
    
    await alarm.save();
    res.json(alarm);
  } catch (error) {
    console.error('Update alarm error:', error);
    res.status(500).json({ message: 'Error updating alarm' });
  }
};

// @desc    Toggle alarm on/off
// @route   PATCH /api/alarms/:id/toggle
// @access  Private
exports.toggleAlarm = async (req, res) => {
  try {
    const alarm = await Alarm.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!alarm) {
      return res.status(404).json({ message: 'Alarm not found' });
    }
    
    alarm.isEnabled = !alarm.isEnabled;
    await alarm.save();
    
    res.json(alarm);
  } catch (error) {
    console.error('Toggle alarm error:', error);
    res.status(500).json({ message: 'Error toggling alarm' });
  }
};

// @desc    Delete alarm
// @route   DELETE /api/alarms/:id
// @access  Private
exports.deleteAlarm = async (req, res) => {
  try {
    const alarm = await Alarm.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!alarm) {
      return res.status(404).json({ message: 'Alarm not found' });
    }
    
    await alarm.deleteOne();
    res.json({ message: 'Alarm deleted successfully' });
  } catch (error) {
    console.error('Delete alarm error:', error);
    res.status(500).json({ message: 'Error deleting alarm' });
  }
};

// @desc    Snooze alarm
// @route   POST /api/alarms/:id/snooze
// @access  Private
exports.snoozeAlarm = async (req, res) => {
  try {
    const alarm = await Alarm.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!alarm) {
      return res.status(404).json({ message: 'Alarm not found' });
    }
    
    if (!alarm.snoozeEnabled) {
      return res.status(400).json({ message: 'Snooze is disabled for this alarm' });
    }
    
    alarm.snoozeCount += 1;
    alarm.lastTriggered = new Date();
    await alarm.save();
    
    res.json({ 
      message: 'Alarm snoozed',
      snoozeUntil: new Date(Date.now() + alarm.snoozeDuration * 60000),
      snoozeCount: alarm.snoozeCount
    });
  } catch (error) {
    console.error('Snooze alarm error:', error);
    res.status(500).json({ message: 'Error snoozing alarm' });
  }
};

// @desc    Dismiss alarm
// @route   POST /api/alarms/:id/dismiss
// @access  Private
exports.dismissAlarm = async (req, res) => {
  try {
    const alarm = await Alarm.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!alarm) {
      return res.status(404).json({ message: 'Alarm not found' });
    }
    
    alarm.lastTriggered = new Date();
    alarm.snoozeCount = 0;
    
    // If it's a one-time alarm (no repeat days), disable it
    if (alarm.repeatDays.length === 0) {
      alarm.isEnabled = false;
    }
    
    await alarm.save();
    
    res.json({ message: 'Alarm dismissed', alarm });
  } catch (error) {
    console.error('Dismiss alarm error:', error);
    res.status(500).json({ message: 'Error dismissing alarm' });
  }
};

// @desc    Get upcoming alarms
// @route   GET /api/alarms/upcoming
// @access  Private
exports.getUpcomingAlarms = async (req, res) => {
  try {
    const alarms = await Alarm.find({ 
      userId: req.user._id,
      isEnabled: true 
    }).sort({ time: 1 });
    
    const upcomingAlarms = alarms.map(alarm => ({
      ...alarm.toObject(),
      nextTrigger: alarm.getNextTriggerTime()
    }));
    
    // Sort by next trigger time
    upcomingAlarms.sort((a, b) => a.nextTrigger - b.nextTrigger);
    
    res.json(upcomingAlarms);
  } catch (error) {
    console.error('Get upcoming alarms error:', error);
    res.status(500).json({ message: 'Error fetching upcoming alarms' });
  }
};
