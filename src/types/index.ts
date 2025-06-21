export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  points: number;
  category: string;
  priority: 'low' | 'medium' | 'high';
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number; // e.g., every 2 days, every 3 weeks
    lastCompleted?: Date;
    nextDue?: Date;
    totalRepetitions?: number; // How many times to repeat (optional)
    completedRepetitions?: number; // How many times completed so far
    endDate?: Date; // Calculated end date based on repetitions
  };
}

export interface GameStats {
  level: number;
  currentPoints: number;
  totalPoints: number;
  tasksCompleted: number;
  streak: number;
  lastCompletedDate?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
  requiredValue: number;
  currentValue: number;
  category: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'legendary' | 'daily' | 'streak' | 'specialist' | 'priority' | 'xp' | 'special';
}

export type NotificationType = 'points' | 'level' | 'achievement' | 'streak';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  points?: number;
  level?: number;
  achievement?: Achievement;
}

export interface CalendarDay {
  date: Date;
  tasks: Task[];
  totalXP: number;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export interface UserProfile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  app_title?: string;
  created_at: string;
  updated_at: string;
}