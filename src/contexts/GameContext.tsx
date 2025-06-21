import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameStats, Achievement, Task, Notification } from '../types';
import { 
  getDefaultStats,
  DEFAULT_ACHIEVEMENTS,
  calculateLevel,
  updateStreak,
  PRIORITY_POINTS,
  pointsForNextLevel,
  levelProgressPercentage
} from '../utils/constants';
import { 
  syncGameStatsToSupabase, 
  loadGameStatsFromSupabase,
  syncAchievementsToSupabase,
  loadAchievementsFromSupabase
} from '../utils/supabaseStorage';
import { useAuth } from './AuthContext';

interface GameContextType {
  stats: GameStats;
  achievements: Achievement[];
  notifications: Notification[];
  completeTask: (task: Task) => void;
  undoTask: (task: Task) => void;
  dismissNotification: (id: string) => void;
  pointsToNextLevel: number;
  levelProgress: number;
  syncing: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Maximum number of notifications to show at once
const MAX_NOTIFICATIONS = 5;

// Level nicknames and encouragement messages
const LEVEL_REWARDS = {
  1: { nickname: "Novice Adventurer", message: "Welcome to your quest! Every journey begins with a single step.", medal: "🥉" },
  2: { nickname: "Task Apprentice", message: "You're getting the hang of this! Keep building those productive habits.", medal: "🥉" },
  3: { nickname: "Productivity Warrior", message: "Look at you go! Your dedication is starting to show real results.", medal: "🥈" },
  4: { nickname: "Quest Champion", message: "Impressive progress! You're developing serious productivity skills.", medal: "🥈" },
  5: { nickname: "Habit Master", message: "Outstanding! You've proven you can stick to your goals consistently.", medal: "🥇" },
  6: { nickname: "Efficiency Expert", message: "Wow! Your productivity game is getting seriously strong!", medal: "🥇" },
  7: { nickname: "Goal Crusher", message: "Incredible! You're absolutely crushing your objectives!", medal: "🏆" },
  8: { nickname: "Achievement Legend", message: "Legendary status! Your commitment is truly inspiring!", medal: "🏆" },
  9: { nickname: "Productivity Titan", message: "Titan level achieved! You're operating at peak performance!", medal: "🏆" },
  10: { nickname: "Grand Master", message: "GRAND MASTER! You've reached the pinnacle of productivity excellence!", medal: "👑" },
  11: { nickname: "Productivity Sage", message: "Beyond mastery! You're now a true sage of productivity!", medal: "👑" },
  12: { nickname: "Ultimate Champion", message: "ULTIMATE CHAMPION! Your dedication knows no bounds!", medal: "💎" },
  15: { nickname: "Productivity God", message: "DIVINE LEVEL! You've transcended ordinary productivity!", medal: "⭐" },
  20: { nickname: "Legendary Being", message: "LEGENDARY! You are the stuff of productivity legends!", medal: "🌟" }
};

// Achievement medal types and encouraging messages
const ACHIEVEMENT_REWARDS = {
  'first-task': {
    medal: '🥉',
    celebration: 'First Quest Complete!',
    message: 'Amazing start! You\'ve taken the first step on your productivity journey. Every expert was once a beginner!'
  },
  'task-5': {
    medal: '🎯',
    celebration: 'Building Momentum!',
    message: 'Five tasks down! You\'re proving that consistency is key. Keep this energy flowing!'
  },
  'task-master': {
    medal: '🏆',
    celebration: 'Task Master Achieved!',
    message: 'Incredible milestone! 10 tasks completed shows real dedication. You\'re building unstoppable momentum!'
  },
  'task-25': {
    medal: '⭐',
    celebration: 'Quarter Century Champion!',
    message: '25 tasks completed! You\'re developing serious productivity superpowers. Nothing can stop you now!'
  },
  'task-50': {
    medal: '👑',
    celebration: 'Half Century Hero!',
    message: '50 tasks! You\'ve proven that persistence pays off. You\'re becoming a true productivity legend!'
  },
  'task-100': {
    medal: '🏅',
    celebration: 'Centurion Status!',
    message: '100 tasks completed! This is extraordinary dedication. You\'ve joined the elite ranks of productivity masters!'
  },
  'productive-day': {
    medal: '⚡',
    celebration: 'Productivity Powerhouse!',
    message: 'What a day! 5 tasks in one day proves you\'re a true productivity champion. Keep this energy flowing!'
  },
  'super-productive-day': {
    medal: '⚡⚡',
    celebration: 'Super Productive Day!',
    message: '10 tasks in one day! Your focus and determination are absolutely incredible. You\'re unstoppable!'
  },
  'mega-productive-day': {
    medal: '⚡⚡⚡',
    celebration: 'Mega Productive Day!',
    message: '15 tasks in one day! This is legendary productivity. You\'ve achieved something truly extraordinary!'
  },
  'streak-3': {
    medal: '🔥',
    celebration: 'Consistency Champion!',
    message: 'Three days strong! You\'re proving that consistency beats perfection. This is how habits are born!'
  },
  'streak-7': {
    medal: '🌟',
    celebration: 'Week Warrior!',
    message: 'One week of consistency! You\'re building incredible momentum. This is the foundation of lasting change!'
  },
  'streak-21': {
    medal: '🔄',
    celebration: 'Habit Former!',
    message: '21 days! Scientists say this is when habits start to form. You\'re rewiring your brain for success!'
  },
  'streak-30': {
    medal: '📅',
    celebration: 'Monthly Master!',
    message: '30 days of pure dedication! You\'ve transformed from beginner to habit machine. This is truly extraordinary!'
  },
  'streak-66': {
    medal: '👑',
    celebration: 'Habit Master Supreme!',
    message: '66 days! You\'ve achieved the scientifically proven threshold for automatic habit formation. You are unstoppable!'
  },
  'streak-100': {
    medal: '🏆',
    celebration: 'Centurion Streaker!',
    message: '100 days! This is legendary consistency that less than 1% of people achieve. You are truly exceptional!'
  }
};

const getLevelReward = (level: number) => {
  // Find the highest level reward that applies
  const availableLevels = Object.keys(LEVEL_REWARDS).map(Number).sort((a, b) => b - a);
  const applicableLevel = availableLevels.find(l => level >= l) || 1;
  return LEVEL_REWARDS[applicableLevel as keyof typeof LEVEL_REWARDS];
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<GameStats>(getDefaultStats());
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();
  
  // Calculate points needed for next level
  const pointsToNextLevel = pointsForNextLevel(stats.level, stats.currentPoints);
  
  // Calculate level progress percentage
  const levelProgress = levelProgressPercentage(stats.level, stats.currentPoints);
  
  // Reset data when user changes
  useEffect(() => {
    let isMounted = true;
    
    const loadUserData = async () => {
      if (user && user.id !== currentUserId) {
        console.log('Loading game data for user:', user.id);
        setSyncing(true);
        
        // Add delay to prevent connection conflicts after login
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!isMounted) return;
        
        try {
          // Load user-specific data from Supabase with staggered requests
          const supabaseStats = await loadGameStatsFromSupabase(user.id);
          
          if (!isMounted) return;
          
          // Add delay between requests
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const supabaseAchievements = await loadAchievementsFromSupabase(user.id);
          
          if (!isMounted) return;
          
          if (supabaseStats.data) {
            console.log('Loaded stats from Supabase:', supabaseStats.data);
            setStats(supabaseStats.data);
          } else {
            console.log('No stats found, initializing new user');
            // Initialize new user with default stats
            const defaultStats = getDefaultStats();
            setStats(defaultStats);
          }
          
          if (supabaseAchievements.data) {
            console.log('Loaded achievements from Supabase:', supabaseAchievements.data);
            setAchievements(supabaseAchievements.data);
          } else {
            console.log('No achievements found, initializing new user');
            // Initialize new user with default achievements
            setAchievements(DEFAULT_ACHIEVEMENTS);
          }
          
          setCurrentUserId(user.id);
          setIsInitialized(true);
        } catch (error) {
          console.error('Failed to load user data from Supabase:', error);
          if (isMounted) {
            // Fallback to default data for new user
            setStats(getDefaultStats());
            setAchievements(DEFAULT_ACHIEVEMENTS);
            setCurrentUserId(user.id);
            setIsInitialized(true);
          }
        } finally {
          if (isMounted) {
            setSyncing(false);
          }
        }
      } else if (!user && currentUserId) {
        console.log('User logged out, resetting to default data');
        // User logged out, reset to default data
        setStats(getDefaultStats());
        setAchievements(DEFAULT_ACHIEVEMENTS);
        setCurrentUserId(null);
        setIsInitialized(false);
        setSyncing(false);
      }
    };
    
    loadUserData();
    
    return () => {
      isMounted = false;
    };
  }, [user, currentUserId]);
  
  // Sync data to Supabase when it changes (if user is authenticated)
  useEffect(() => {
    if (user && currentUserId === user.id && isInitialized) {
      // Add delay to prevent rapid sync calls
      const timeoutId = setTimeout(() => {
        console.log('Syncing stats to Supabase:', stats);
        syncGameStatsToSupabase(stats, user.id);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [stats, user, currentUserId, isInitialized]);
  
  useEffect(() => {
    if (user && currentUserId === user.id && isInitialized) {
      // Add delay to prevent rapid sync calls
      const timeoutId = setTimeout(() => {
        console.log('Syncing achievements to Supabase:', achievements);
        syncAchievementsToSupabase(achievements, user.id);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [achievements, user, currentUserId, isInitialized]);
  
  // Auto-dismiss notifications after appropriate time
  useEffect(() => {
    if (notifications.length > 0) {
      const currentNotification = notifications[0];
      let dismissTime = 5000; // Default 5 seconds
      
      // Longer display times for special achievements
      if (currentNotification.type === 'level') dismissTime = 12000; // 12 seconds for level ups
      if (currentNotification.type === 'achievement') dismissTime = 8000; // 8 seconds for achievements
      if (currentNotification.type === 'streak') dismissTime = 6000; // 6 seconds for streaks
      
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, dismissTime);
      return () => clearTimeout(timer);
    }
  }, [notifications]);
  
  const addNotification = (notification: Notification) => {
    setNotifications(prev => {
      const newNotifications = [...prev, notification];
      
      // If we exceed the maximum, remove the oldest notifications
      if (newNotifications.length > MAX_NOTIFICATIONS) {
        const excessCount = newNotifications.length - MAX_NOTIFICATIONS;
        return newNotifications.slice(excessCount);
      }
      
      return newNotifications;
    });
  };
  
  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const updateAchievements = (stats: GameStats, task: Task) => {
    const updatedAchievements = [...achievements];
    const newUnlocks: Achievement[] = [];
    
    // Check for unlocked achievements
    updatedAchievements.forEach((achievement, index) => {
      let newValue = achievement.currentValue;
      
      switch (achievement.id) {
        case 'first-task':
        case 'task-5':
        case 'task-master':
        case 'task-25':
        case 'task-50':
        case 'task-100':
        case 'task-250':
        case 'task-500':
          newValue = stats.tasksCompleted;
          break;
        case 'productive-day':
        case 'super-productive-day':
        case 'mega-productive-day':
          // Count today's completed tasks
          const today = new Date().toISOString().split('T')[0];
          if (task.completedAt && task.completedAt.toString().includes(today)) {
            newValue += 1;
          }
          break;
        case 'streak-3':
        case 'streak-7':
        case 'streak-14':
        case 'streak-21':
        case 'streak-30':
        case 'streak-45':
        case 'streak-60':
        case 'streak-66':
        case 'streak-100':
          newValue = stats.streak;
          break;
        case 'work-specialist':
          if (task.category === 'work') newValue += 1;
          break;
        case 'health-guru':
          if (task.category === 'health') newValue += 1;
          break;
        case 'learning-enthusiast':
          if (task.category === 'education') newValue += 1;
          break;
        case 'personal-champion':
          if (task.category === 'personal') newValue += 1;
          break;
        case 'high-priority-master':
          if (task.priority === 'high') newValue += 1;
          break;
        case 'balanced-achiever':
          // This would need more complex logic to track all priority levels
          newValue = achievement.currentValue;
          break;
        case 'xp-500':
        case 'xp-1000':
        case 'xp-2500':
        case 'xp-5000':
          newValue = stats.totalPoints;
          break;
        case 'early-bird':
          if (task.completedAt) {
            const hour = new Date(task.completedAt).getHours();
            if (hour < 8) newValue = 1;
          }
          break;
        case 'night-owl':
          if (task.completedAt) {
            const hour = new Date(task.completedAt).getHours();
            if (hour >= 22) newValue = 1;
          }
          break;
        case 'weekend-warrior':
          if (task.completedAt) {
            const day = new Date(task.completedAt).getDay();
            if (day === 0 || day === 6) newValue += 1; // Sunday or Saturday
          }
          break;
        case 'recurring-master':
          if (task.recurring) newValue += 1;
          break;
      }
      
      // Update achievement value
      updatedAchievements[index] = {
        ...achievement,
        currentValue: newValue
      };
      
      // Check if achievement is newly unlocked
      if (!achievement.unlocked && newValue >= achievement.requiredValue) {
        updatedAchievements[index].unlocked = true;
        newUnlocks.push(updatedAchievements[index]);
      }
    });
    
    // Save updated achievements
    setAchievements(updatedAchievements);
    
    // Create enhanced notifications for newly unlocked achievements
    newUnlocks.forEach(achievement => {
      const reward = ACHIEVEMENT_REWARDS[achievement.id as keyof typeof ACHIEVEMENT_REWARDS];
      
      if (reward) {
        // Main achievement notification with medal
        addNotification({
          id: `achievement-${achievement.id}-${Date.now()}`,
          type: 'achievement',
          message: `${reward.medal} ${reward.celebration}`,
          achievement: achievement
        });
        
        // Follow-up encouraging message
        setTimeout(() => {
          addNotification({
            id: `achievement-msg-${achievement.id}-${Date.now()}`,
            type: 'achievement',
            message: `💫 ${reward.message}`
          });
        }, 3000);
      } else {
        // Fallback for achievements without specific rewards
        addNotification({
          id: `achievement-${achievement.id}-${Date.now()}`,
          type: 'achievement',
          message: `🏆 Achievement Unlocked: ${achievement.name}!`,
          achievement: achievement
        });
      }
    });
  };

  const revertAchievements = (stats: GameStats) => {
    const updatedAchievements = [...achievements];
    
    // Recalculate achievement progress based on new stats
    updatedAchievements.forEach((achievement, index) => {
      let newValue = 0;
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first-task':
          newValue = stats.tasksCompleted;
          shouldUnlock = newValue >= 1;
          break;
        case 'task-5':
          newValue = stats.tasksCompleted;
          shouldUnlock = newValue >= 5;
          break;
        case 'task-master':
          newValue = stats.tasksCompleted;
          shouldUnlock = newValue >= 10;
          break;
        case 'task-25':
          newValue = stats.tasksCompleted;
          shouldUnlock = newValue >= 25;
          break;
        case 'task-50':
          newValue = stats.tasksCompleted;
          shouldUnlock = newValue >= 50;
          break;
        case 'task-100':
          newValue = stats.tasksCompleted;
          shouldUnlock = newValue >= 100;
          break;
        case 'task-250':
          newValue = stats.tasksCompleted;
          shouldUnlock = newValue >= 250;
          break;
        case 'task-500':
          newValue = stats.tasksCompleted;
          shouldUnlock = newValue >= 500;
          break;
        case 'productive-day':
        case 'super-productive-day':
        case 'mega-productive-day':
          // This would need more complex logic to track daily completions
          // For now, keep current value as it's hard to revert without more data
          newValue = achievement.currentValue;
          shouldUnlock = achievement.unlocked;
          break;
        case 'streak-3':
          newValue = stats.streak;
          shouldUnlock = newValue >= 3;
          break;
        case 'streak-7':
          newValue = stats.streak;
          shouldUnlock = newValue >= 7;
          break;
        case 'streak-14':
          newValue = stats.streak;
          shouldUnlock = newValue >= 14;
          break;
        case 'streak-21':
          newValue = stats.streak;
          shouldUnlock = newValue >= 21;
          break;
        case 'streak-30':
          newValue = stats.streak;
          shouldUnlock = newValue >= 30;
          break;
        case 'streak-45':
          newValue = stats.streak;
          shouldUnlock = newValue >= 45;
          break;
        case 'streak-60':
          newValue = stats.streak;
          shouldUnlock = newValue >= 60;
          break;
        case 'streak-66':
          newValue = stats.streak;
          shouldUnlock = newValue >= 66;
          break;
        case 'streak-100':
          newValue = stats.streak;
          shouldUnlock = newValue >= 100;
          break;
        case 'xp-500':
          newValue = stats.totalPoints;
          shouldUnlock = newValue >= 500;
          break;
        case 'xp-1000':
          newValue = stats.totalPoints;
          shouldUnlock = newValue >= 1000;
          break;
        case 'xp-2500':
          newValue = stats.totalPoints;
          shouldUnlock = newValue >= 2500;
          break;
        case 'xp-5000':
          newValue = stats.totalPoints;
          shouldUnlock = newValue >= 5000;
          break;
        default:
          newValue = achievement.currentValue;
          shouldUnlock = achievement.unlocked;
      }
      
      // Update achievement
      updatedAchievements[index] = {
        ...achievement,
        currentValue: newValue,
        unlocked: shouldUnlock
      };
    });
    
    setAchievements(updatedAchievements);
  };
  
  const completeTask = (task: Task) => {
    // Calculate points earned
    const pointsEarned = PRIORITY_POINTS[task.priority];
    
    // Update stats
    const updatedStats = {
      ...stats,
      currentPoints: stats.currentPoints + pointsEarned,
      totalPoints: stats.totalPoints + pointsEarned,
      tasksCompleted: stats.tasksCompleted + 1
    };
    
    // Update streak
    const statsWithStreak = updateStreak(updatedStats);
    
    // Check for level up
    const newLevel = calculateLevel(statsWithStreak.currentPoints);
    const leveledUp = newLevel > stats.level;
    
    if (leveledUp) {
      statsWithStreak.level = newLevel;
      
      // Get level reward info
      const levelReward = getLevelReward(newLevel);
      
      // Add epic level up notification with medal and nickname
      addNotification({
        id: `level-${newLevel}-${Date.now()}`,
        type: 'level',
        message: `${levelReward.medal} LEVEL ${newLevel}! You're now a ${levelReward.nickname}!`,
        level: newLevel
      });
      
      // Add encouragement message as a second notification
      setTimeout(() => {
        addNotification({
          id: `encouragement-${newLevel}-${Date.now()}`,
          type: 'achievement',
          message: `🎯 ${levelReward.message}`
        });
      }, 4000);
    }
    
    // Add points notification
    addNotification({
      id: `points-${Date.now()}`,
      type: 'points',
      message: `+${pointsEarned} XP earned!`,
      points: pointsEarned
    });
    
    // Check for streak milestones with medals
    if (statsWithStreak.streak > stats.streak && statsWithStreak.streak >= 3) {
      const streakRewards = {
        3: { medal: "🔥", message: "3-day streak! You're building momentum!" },
        7: { medal: "🌟", message: "Week-long streak! You're on fire!" },
        14: { medal: "💫", message: "Two weeks strong! Unstoppable!" },
        21: { medal: "🔄", message: "21 days! Habits are forming!" },
        30: { medal: "📅", message: "30-day streak! You're a habit machine!" },
        45: { medal: "🎯", message: "45 days! You're in the zone!" },
        50: { medal: "👑", message: "50-day streak! Absolutely incredible!" },
        60: { medal: "💎", message: "60 days! Diamond dedication!" },
        66: { medal: "👑", message: "66-day streak! Scientifically proven habit formation!" },
        100: { medal: "🏆", message: "100-day streak! LEGENDARY dedication!" }
      };
      
      const reward = streakRewards[statsWithStreak.streak as keyof typeof streakRewards];
      const message = reward 
        ? `${reward.medal} ${reward.message}`
        : `🔥 ${statsWithStreak.streak}-day streak! Keep the momentum going!`;
      
      addNotification({
        id: `streak-${statsWithStreak.streak}-${Date.now()}`,
        type: 'streak',
        message
      });
    }
    
    // Update achievements
    updateAchievements(statsWithStreak, task);
    
    // Save updated stats
    setStats(statsWithStreak);
  };

  const undoTask = (task: Task) => {
    // Calculate points to remove
    const pointsToRemove = PRIORITY_POINTS[task.priority];
    
    // Update stats by removing points and decrementing task count
    const updatedStats = {
      ...stats,
      currentPoints: Math.max(0, stats.currentPoints - pointsToRemove),
      totalPoints: Math.max(0, stats.totalPoints - pointsToRemove),
      tasksCompleted: Math.max(0, stats.tasksCompleted - 1)
    };
    
    // Recalculate level based on new points
    const newLevel = calculateLevel(updatedStats.currentPoints);
    updatedStats.level = newLevel;
    
    // Check if level decreased
    if (newLevel < stats.level) {
      addNotification({
        id: `level-down-${Date.now()}`,
        type: 'level',
        message: `📉 Level decreased to ${newLevel}`,
        level: newLevel
      });
    }
    
    // Add notification about points removal
    addNotification({
      id: `points-removed-${Date.now()}`,
      type: 'points',
      message: `−${pointsToRemove} XP (task undone)`,
      points: -pointsToRemove
    });
    
    // Revert achievements based on new stats
    revertAchievements(updatedStats);
    
    // Save updated stats
    setStats(updatedStats);
  };
  
  const value = {
    stats,
    achievements,
    notifications,
    completeTask,
    undoTask,
    dismissNotification,
    pointsToNextLevel,
    levelProgress,
    syncing
  };
  
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};