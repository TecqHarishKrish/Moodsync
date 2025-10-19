const { findUserById } = require('../utils/memoryStorage');

// Helper function to calculate average
const average = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

// Helper function to format date
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// @desc    Process mood from image (client will handle most of this, this is a fallback)
// @route   POST /api/ai/process-mood
// @access  Private
exports.processMood = async (req, res) => {
  try {
    // In a real app, this would use TensorFlow.js on the client side
    // This is just a placeholder that returns a mock mood score
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ message: 'No image data provided' });
    }
    
    // Mock mood detection (1-5 scale)
    const moodScores = {
      happy: 5,
      neutral: 3,
      sad: 2,
      angry: 1,
      surprised: 4
    };
    
    // In a real app, you would process the image with TensorFlow.js
    // This is just a mock implementation
    const mockMood = Object.keys(moodScores)[
      Math.floor(Math.random() * Object.keys(moodScores).length)
    ];
    
    res.json({
      mood: moodScores[mockMood],
      confidence: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
      detectedMood: mockMood
    });
  } catch (error) {
    console.error('Mood processing error:', error);
    res.status(500).json({ message: 'Error processing mood' });
  }
};

// @desc    Analyze sleep patterns and provide insights
// @route   GET /api/ai/sleep-insights
// @access  Private
exports.getSleepInsights = async (req, res) => {
  try {
    const user = findUserById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { sleepData = [] } = user;
    
    if (sleepData.length === 0) {
      return res.json({
        message: 'Not enough data to generate insights',
        hasEnoughData: false
      });
    }
    
    // Calculate basic statistics
    const moods = sleepData.filter(d => d.mood).map(d => d.mood);
    const avgMood = moods.length > 0 ? average(moods).toFixed(2) : null;
    
    const reactionTimes = sleepData.filter(d => d.reactionTime).map(d => d.reactionTime);
    const avgReactionTime = reactionTimes.length > 0 ? average(reactionTimes).toFixed(0) : null;
    
    // Find best/worst days
    let bestDay = null;
    let worstDay = null;
    
    if (sleepData.length > 0) {
      bestDay = sleepData.reduce((best, current) => 
        (current.mood > (best?.mood || -Infinity) ? current : best), {});
      
      worstDay = sleepData.reduce((worst, current) => 
        (current.mood < (worst?.mood || Infinity) ? current : worst), {});
    }
    
    // Generate insights
    const insights = [];
    
    if (sleepData.length >= 3) {
      // Mood trend
      const recentMoods = sleepData.slice(-3).map(d => d.mood || 3);
      const moodTrend = recentMoods[recentMoods.length - 1] - recentMoods[0];
      
      if (moodTrend > 0.5) {
        insights.push({
          type: 'positive',
          message: 'Your mood has been improving recently!',
          icon: 'trending_up'
        });
      } else if (moodTrend < -0.5) {
        insights.push({
          type: 'warning',
          message: 'Your mood has been declining. Consider adjusting your sleep schedule.',
          icon: 'trending_down'
        });
      }
      
      // Snooze analysis
      const snoozeCounts = sleepData.map(d => d.snoozeCount || 0);
      const avgSnoozes = average(snoozeCounts);
      
      if (avgSnoozes > 2) {
        insights.push({
          type: 'suggestion',
          message: `You're hitting snooze ${avgSnoozes.toFixed(1)} times on average. Consider a more gradual wake-up time.`,
          icon: 'alarm_off'
        });
      }
    }
    
    // Default insight if none generated
    if (insights.length === 0 && sleepData.length > 0) {
      insights.push({
        type: 'info',
        message: 'Keep tracking your sleep to get personalized insights!',
        icon: 'info'
      });
    }
    
    res.json({
      hasEnoughData: true,
      stats: {
        totalNights: sleepData.length,
        averageMood: avgMood,
        averageReactionTime: avgReactionTime,
        bestDay: bestDay ? {
          date: formatDate(bestDay.wakeTime || bestDay.date),
          mood: bestDay.mood,
          reactionTime: bestDay.reactionTime
        } : null,
        worstDay: worstDay ? {
          date: formatDate(worstDay.wakeTime || worstDay.date),
          mood: worstDay.mood,
          reactionTime: worstDay.reactionTime
        } : null
      },
      insights
    });
    
  } catch (error) {
    console.error('Get sleep insights error:', error);
    res.status(500).json({ message: 'Error getting sleep insights' });
  }
};

// @desc    Get optimal wake time recommendation
// @route   GET /api/ai/optimal-wake-time
// @access  Private
exports.getOptimalWakeTime = async (req, res) => {
  try {
    const user = findUserById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { sleepData = [] } = user;
    
    if (sleepData.length < 3) {
      return res.json({
        message: 'Not enough data to determine optimal wake time',
        hasEnoughData: false
      });
    }
    
    // Simple algorithm to find best wake time based on historical data
    const validEntries = sleepData.filter(d => d.wakeTime && d.mood);
    
    if (validEntries.length < 3) {
      return res.json({
        message: 'Not enough valid wake time data',
        hasEnoughData: false
      });
    }
    
    // Group by 30-minute intervals
    const timeSlots = {};
    
    validEntries.forEach(entry => {
      const date = new Date(entry.wakeTime || entry.date);
      const hour = date.getHours();
      const minute = Math.floor(date.getMinutes() / 30) * 30; // Round to nearest 30 minutes
      const slotKey = `${hour}:${minute === 0 ? '00' : '30'}`;
      
      if (!timeSlots[slotKey]) {
        timeSlots[slotKey] = { totalMood: 0, count: 0 };
      }
      
      timeSlots[slotKey].totalMood += entry.mood || 3; // Default to neutral if not provided
      timeSlots[slotKey].count += 1;
    });
    
    // Find best time slot
    let bestSlot = null;
    let bestAvgMood = -1;
    
    Object.entries(timeSlots).forEach(([slot, { totalMood, count }]) => {
      const avgMood = totalMood / count;
      if (avgMood > bestAvgMood) {
        bestAvgMood = avgMood;
        bestSlot = slot;
      }
    });
    
    if (!bestSlot) {
      return res.json({
        message: 'Not enough data to determine optimal wake time',
        hasEnoughData: false
      });
    }
    
    // Format the recommended time for today
    const [hour, minute] = bestSlot.split(':').map(Number);
    const recTime = new Date();
    recTime.setHours(hour, minute, 0, 0);
    
    res.json({
      hasEnoughData: true,
      recommendedWakeTime: recTime.toISOString(),
      confidence: Math.min(0.9, 0.5 + (validEntries.length * 0.05)),
      sampleSize: validEntries.length,
      message: `Based on ${validEntries.length} previous wake times, your optimal wake time appears to be around ${bestSlot}.`
    });
    
  } catch (error) {
    console.error('Get optimal wake time error:', error);
    res.status(500).json({ message: 'Error calculating optimal wake time' });
  }
};
