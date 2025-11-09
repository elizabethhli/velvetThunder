import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_PATH = path.join(__dirname, 'storage.json');

// Timezone for NYC/Toronto (Eastern Time)
const TIMEZONE = 'America/New_York';

// Helper function to get current date in Eastern Time
function getTodayInEasternTime() {
  const now = new Date();
  return now.toLocaleDateString('sv-SE', { timeZone: TIMEZONE }); // Returns YYYY-MM-DD format
}

// Helper function to create a date string for any date in Eastern Time
function getDateInEasternTime(date) {
  return date.toLocaleDateString('sv-SE', { timeZone: TIMEZONE }); // Returns YYYY-MM-DD format
}

// Celebration GIFs for milestones
const CELEBRATION_GIFS = {
  7: 'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif',
  14: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
  21: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
  30: 'https://media.giphy.com/media/3oz8xAFtqoOUUrsh7W/giphy.gif',
};

// Initialize storage
function initStorage() {
  if (!fs.existsSync(STORAGE_PATH)) {
    const initialData = {
      completedDates: [],
      cycleStartDate: getTodayInEasternTime(),
      isPaused: false,
      lastMilestone: 0,
    };
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(initialData, null, 2));
  }
}

// Read tracker data
export function getTracker() {
  initStorage();
  const data = fs.readFileSync(STORAGE_PATH, 'utf8');
  return JSON.parse(data);
}

// Save tracker data
function saveTracker(data) {
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(data, null, 2));
}

// Mark a date as complete
export function markComplete(dateStr, username) {
  const tracker = getTracker();
  
  // Check if already completed
  if (tracker.completedDates.includes(dateStr)) {
    return { message: `This day was already marked as complete!`, alreadyDone: true };
  }

  // Add to completed dates
  tracker.completedDates.push(dateStr);
  tracker.completedDates.sort();
  
  // Set cycle start date to the earliest completed date
  const earliestDate = tracker.completedDates[0]; // First item after sorting
  tracker.cycleStartDate = earliestDate;
  
  saveTracker(tracker);

  const stats = getStats();
  let milestone = null;

  // Check for milestone achievements
  const milestoneDay = checkMilestone(stats.totalCompleted, tracker.lastMilestone);
  if (milestoneDay) {
    tracker.lastMilestone = milestoneDay;
    saveTracker(tracker);
    milestone = getMilestoneMessage(milestoneDay);
  }

  return {
    message: `Cleaning marked as done by ${username}! 🎉 Current streak: ${stats.currentStreak} days`,
    stats,
    milestone
  };
}

// Calculate current stats
export function getStats() {
  const tracker = getTracker();
  const sortedDates = tracker.completedDates.sort();
  
  // Simple streak calculation: count consecutive days from the end of completed dates
  let currentStreak = 0;
  
  if (sortedDates.length === 0) {
    currentStreak = 0;
  } else if (sortedDates.length === 1) {
    currentStreak = 1;
  } else {
    // Start from the most recent date and count backwards
    currentStreak = 1; // The most recent date counts as 1
    
    // Check backwards through the sorted dates
    for (let i = sortedDates.length - 1; i > 0; i--) {
      const currentDateStr = sortedDates[i];
      const previousDateStr = sortedDates[i - 1];
      
      // Simple string-based consecutive check (no timezone issues!)
      // Parse the date strings directly
      const currentDateParts = currentDateStr.split('-').map(Number);
      const previousDateParts = previousDateStr.split('-').map(Number);
      
      // Create date objects for comparison (using local midnight to avoid timezone issues)
      const currentDate = new Date(currentDateParts[0], currentDateParts[1] - 1, currentDateParts[2]);
      const previousDate = new Date(previousDateParts[0], previousDateParts[1] - 1, previousDateParts[2]);
      
      const dayDifference = (currentDate - previousDate) / (1000 * 60 * 60 * 24);
      
      if (dayDifference === 1) {
        // Consecutive day found
        currentStreak++;
      } else {
        // Gap found, stop counting
        break;
      }
    }
  }
  
  console.log('Streak calculation:', {
    sortedDates,
    calculatedStreak: currentStreak
  });

  return {
    currentStreak,
    totalCompleted: tracker.completedDates.length,
    cycleStartDate: tracker.completedDates.length === 0 ? null : tracker.cycleStartDate,
    isPaused: tracker.isPaused,
    completedDates: tracker.completedDates,
  };
}

// Check if we hit a milestone
function checkMilestone(totalDays, lastMilestone) {
  const milestones = [7, 14, 21, 30];
  for (const milestone of milestones) {
    if (totalDays >= milestone && lastMilestone < milestone) {
      return milestone;
    }
  }
  return null;
}

// Get milestone celebration message
function getMilestoneMessage(days) {
  const messages = {
    7: {
      title: '🎉 ONE WEEK STREAK! 🎉',
      message: 'Amazing! You\'ve completed one full week of cleaning. Keep it up!',
      gif: CELEBRATION_GIFS[7]
    },
    14: {
      title: '🔥 TWO WEEKS! HALFWAY THERE! 🔥',
      message: 'Incredible! You\'re halfway to your goal. The reward is in sight!',
      gif: CELEBRATION_GIFS[14]
    },
    21: {
      title: '⭐ THREE WEEKS! SO CLOSE! ⭐',
      message: 'Outstanding! Just 9 more days until you earn your treat!',
      gif: CELEBRATION_GIFS[21]
    },
    30: {
      title: '🏆 30 DAYS COMPLETE! YOU DID IT! 🏆',
      message: '🎊 CONGRATULATIONS! You\'ve earned your treat! Time to celebrate together! 🎊',
      gif: CELEBRATION_GIFS[30]
    }
  };
  return messages[days];
}

// Reset cycle
export function resetCycle() {
  const initialData = {
    completedDates: [],
    cycleStartDate: getTodayInEasternTime(),
    isPaused: false,
    lastMilestone: 0,
  };
  saveTracker(initialData);
}

// Pause reminders
export function pauseReminders() {
  const tracker = getTracker();
  tracker.isPaused = true;
  saveTracker(tracker);
}

// Resume reminders
export function resumeReminders() {
  const tracker = getTracker();
  tracker.isPaused = false;
  saveTracker(tracker);
}

// Cancel cycle
export function cancelCycle() {
  resetCycle();
}

// Check if today is already completed
export function isTodayCompleted() {
  const tracker = getTracker();
  const todayEastern = getTodayInEasternTime();
  return tracker.completedDates.includes(todayEastern);
}