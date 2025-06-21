import { GameStats, Achievement } from '../types';

// Task priority points
export const PRIORITY_POINTS = {
  low: 5,
  medium: 10,
  high: 20,
};

// Points needed for each level
export const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 3000];

// Default game stats
export const getDefaultStats = (): GameStats => ({
  level: 1,
  currentPoints: 0,
  totalPoints: 0,
  tasksCompleted: 0,
  streak: 0,
});

// Enhanced achievements with categories and progression up to 66 days
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // Getting Started (Beginner)
  {
    id: 'first-task',
    name: 'First Steps',
    description: 'Complete your first task and begin your productivity journey',
    unlocked: false,
    icon: 'award',
    requiredValue: 1,
    currentValue: 0,
    category: 'beginner',
  },
  {
    id: 'task-5',
    name: 'Getting Momentum',
    description: 'Complete 5 tasks - you\'re building great habits!',
    unlocked: false,
    icon: 'target',
    requiredValue: 5,
    currentValue: 0,
    category: 'beginner',
  },
  {
    id: 'task-master',
    name: 'Task Master',
    description: 'Complete 10 tasks and prove your dedication',
    unlocked: false,
    icon: 'trophy',
    requiredValue: 10,
    currentValue: 0,
    category: 'beginner',
  },
  {
    id: 'task-25',
    name: 'Quarter Century',
    description: 'Complete 25 tasks - you\'re becoming unstoppable!',
    unlocked: false,
    icon: 'star',
    requiredValue: 25,
    currentValue: 0,
    category: 'intermediate',
  },
  {
    id: 'task-50',
    name: 'Half Century Hero',
    description: 'Complete 50 tasks - incredible dedication!',
    unlocked: false,
    icon: 'crown',
    requiredValue: 50,
    currentValue: 0,
    category: 'intermediate',
  },
  {
    id: 'task-100',
    name: 'Centurion',
    description: 'Complete 100 tasks - you\'re a productivity legend!',
    unlocked: false,
    icon: 'medal',
    requiredValue: 100,
    currentValue: 0,
    category: 'advanced',
  },
  {
    id: 'task-250',
    name: 'Task Titan',
    description: 'Complete 250 tasks - absolutely extraordinary!',
    unlocked: false,
    icon: 'gem',
    requiredValue: 250,
    currentValue: 0,
    category: 'expert',
  },
  {
    id: 'task-500',
    name: 'Productivity God',
    description: 'Complete 500 tasks - divine level achievement!',
    unlocked: false,
    icon: 'sparkles',
    requiredValue: 500,
    currentValue: 0,
    category: 'legendary',
  },

  // Daily Productivity
  {
    id: 'productive-day',
    name: 'Productivity Powerhouse',
    description: 'Complete 5 tasks in a single day - show your focus!',
    unlocked: false,
    icon: 'zap',
    requiredValue: 5,
    currentValue: 0,
    category: 'daily',
  },
  {
    id: 'super-productive-day',
    name: 'Super Productive Day',
    description: 'Complete 10 tasks in a single day - incredible focus!',
    unlocked: false,
    icon: 'lightning',
    requiredValue: 10,
    currentValue: 0,
    category: 'daily',
  },
  {
    id: 'mega-productive-day',
    name: 'Mega Productive Day',
    description: 'Complete 15 tasks in a single day - you\'re on fire!',
    unlocked: false,
    icon: 'flame',
    requiredValue: 15,
    currentValue: 0,
    category: 'daily',
  },

  // Streak Achievements (Building up to 66 days)
  {
    id: 'streak-3',
    name: 'Consistency Champion',
    description: 'Maintain a 3-day streak and build lasting habits',
    unlocked: false,
    icon: 'flame',
    requiredValue: 3,
    currentValue: 0,
    category: 'streak',
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak - you\'re unstoppable!',
    unlocked: false,
    icon: 'star',
    requiredValue: 7,
    currentValue: 0,
    category: 'streak',
  },
  {
    id: 'streak-14',
    name: 'Fortnight Fighter',
    description: 'Maintain a 14-day streak - building serious momentum!',
    unlocked: false,
    icon: 'trending-up',
    requiredValue: 14,
    currentValue: 0,
    category: 'streak',
  },
  {
    id: 'streak-21',
    name: 'Habit Former',
    description: 'Maintain a 21-day streak - habits are forming!',
    unlocked: false,
    icon: 'repeat',
    requiredValue: 21,
    currentValue: 0,
    category: 'streak',
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak - incredible dedication!',
    unlocked: false,
    icon: 'calendar',
    requiredValue: 30,
    currentValue: 0,
    category: 'streak',
  },
  {
    id: 'streak-45',
    name: 'Persistence Pro',
    description: 'Maintain a 45-day streak - you\'re in the zone!',
    unlocked: false,
    icon: 'target',
    requiredValue: 45,
    currentValue: 0,
    category: 'streak',
  },
  {
    id: 'streak-60',
    name: 'Diamond Dedication',
    description: 'Maintain a 60-day streak - diamond-level commitment!',
    unlocked: false,
    icon: 'gem',
    requiredValue: 60,
    currentValue: 0,
    category: 'streak',
  },
  {
    id: 'streak-66',
    name: 'Habit Master Supreme',
    description: 'Maintain a 66-day streak - scientifically proven habit formation!',
    unlocked: false,
    icon: 'crown',
    requiredValue: 66,
    currentValue: 0,
    category: 'streak',
  },
  {
    id: 'streak-100',
    name: 'Centurion Streaker',
    description: 'Maintain a 100-day streak - legendary consistency!',
    unlocked: false,
    icon: 'trophy',
    requiredValue: 100,
    currentValue: 0,
    category: 'streak',
  },

  // Category Specialists
  {
    id: 'work-specialist',
    name: 'Work Warrior',
    description: 'Complete 25 work-related tasks',
    unlocked: false,
    icon: 'briefcase',
    requiredValue: 25,
    currentValue: 0,
    category: 'specialist',
  },
  {
    id: 'health-guru',
    name: 'Health Guru',
    description: 'Complete 25 health-related tasks',
    unlocked: false,
    icon: 'heart',
    requiredValue: 25,
    currentValue: 0,
    category: 'specialist',
  },
  {
    id: 'learning-enthusiast',
    name: 'Learning Enthusiast',
    description: 'Complete 25 education-related tasks',
    unlocked: false,
    icon: 'book',
    requiredValue: 25,
    currentValue: 0,
    category: 'specialist',
  },
  {
    id: 'personal-champion',
    name: 'Personal Champion',
    description: 'Complete 25 personal development tasks',
    unlocked: false,
    icon: 'user',
    requiredValue: 25,
    currentValue: 0,
    category: 'specialist',
  },

  // Priority Masters
  {
    id: 'high-priority-master',
    name: 'High Priority Master',
    description: 'Complete 20 high-priority tasks',
    unlocked: false,
    icon: 'alert-triangle',
    requiredValue: 20,
    currentValue: 0,
    category: 'priority',
  },
  {
    id: 'balanced-achiever',
    name: 'Balanced Achiever',
    description: 'Complete tasks in all priority levels (5 each)',
    unlocked: false,
    icon: 'scale',
    requiredValue: 15,
    currentValue: 0,
    category: 'priority',
  },

  // XP Milestones
  {
    id: 'xp-500',
    name: 'XP Collector',
    description: 'Earn 500 total XP',
    unlocked: false,
    icon: 'coins',
    requiredValue: 500,
    currentValue: 0,
    category: 'xp',
  },
  {
    id: 'xp-1000',
    name: 'XP Hoarder',
    description: 'Earn 1,000 total XP',
    unlocked: false,
    icon: 'dollar-sign',
    requiredValue: 1000,
    currentValue: 0,
    category: 'xp',
  },
  {
    id: 'xp-2500',
    name: 'XP Millionaire',
    description: 'Earn 2,500 total XP',
    unlocked: false,
    icon: 'banknote',
    requiredValue: 2500,
    currentValue: 0,
    category: 'xp',
  },
  {
    id: 'xp-5000',
    name: 'XP Tycoon',
    description: 'Earn 5,000 total XP - incredible wealth!',
    unlocked: false,
    icon: 'landmark',
    requiredValue: 5000,
    currentValue: 0,
    category: 'xp',
  },

  // Special Achievements
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete a task before 8 AM',
    unlocked: false,
    icon: 'sunrise',
    requiredValue: 1,
    currentValue: 0,
    category: 'special',
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete a task after 10 PM',
    unlocked: false,
    icon: 'moon',
    requiredValue: 1,
    currentValue: 0,
    category: 'special',
  },
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Complete 10 tasks on weekends',
    unlocked: false,
    icon: 'calendar-days',
    requiredValue: 10,
    currentValue: 0,
    category: 'special',
  },
  {
    id: 'recurring-master',
    name: 'Recurring Master',
    description: 'Complete 5 different recurring habits',
    unlocked: false,
    icon: 'repeat',
    requiredValue: 5,
    currentValue: 0,
    category: 'special',
  },
];

// Calculate level based on points
export const calculateLevel = (points: number): number => {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
};

// Calculate points needed for next level
export const pointsForNextLevel = (currentLevel: number, currentPoints: number): number => {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return 0; // Max level reached
  }
  return LEVEL_THRESHOLDS[currentLevel] - currentPoints;
};

// Calculate percentage to next level
export const levelProgressPercentage = (currentLevel: number, currentPoints: number): number => {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return 100; // Max level reached
  }
  
  const prevLevelPoints = LEVEL_THRESHOLDS[currentLevel - 1];
  const nextLevelPoints = LEVEL_THRESHOLDS[currentLevel];
  const pointsInCurrentLevel = currentPoints - prevLevelPoints;
  const pointsRequiredForLevel = nextLevelPoints - prevLevelPoints;
  
  return Math.min(Math.floor((pointsInCurrentLevel / pointsRequiredForLevel) * 100), 100);
};

// Update streak based on task completion
export const updateStreak = (stats: GameStats): GameStats => {
  const today = new Date().toISOString().split('T')[0];
  const lastCompleted = stats.lastCompletedDate;
  
  // If first completion ever
  if (!lastCompleted) {
    return {
      ...stats,
      streak: 1,
      lastCompletedDate: today,
    };
  }
  
  // If completed today already, streak stays the same
  if (lastCompleted === today) {
    return stats;
  }
  
  // Check if last completion was yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];
  
  if (lastCompleted === yesterdayString) {
    // Continuing the streak
    return {
      ...stats,
      streak: stats.streak + 1,
      lastCompletedDate: today,
    };
  }
  
  // Streak broken, start new streak
  return {
    ...stats,
    streak: 1,
    lastCompletedDate: today,
  };
};