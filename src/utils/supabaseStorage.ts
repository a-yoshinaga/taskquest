import { supabase, safeSupabaseOperation, handleSupabaseError, testSupabaseConnection } from '../lib/supabase';
import { Task, GameStats, Achievement } from '../types';

// Enhanced Tasks operations with safe error handling
export const syncTasksToSupabase = async (tasks: Task[], userId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log(`Syncing ${tasks.length} tasks to Supabase for user ${userId}`);
    
    // Check connection first
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest.success) {
      console.error('Cannot sync tasks - Supabase connection failed:', connectionTest.error);
      return { success: false, error: connectionTest.error };
    }
    
    if (tasks.length > 0) {
      const { error } = await supabase
        .from('tasks')
        .upsert(
          tasks.map(task => ({
            id: task.id,
            user_id: userId,
            title: task.title,
            description: task.description,
            completed: task.completed,
            created_at: task.createdAt.toISOString(),
            completed_at: task.completedAt?.toISOString(),
            points: task.points,
            category: task.category,
            priority: task.priority,
            recurring_type: task.recurring?.type,
            recurring_interval: task.recurring?.interval,
            last_completed_date: task.recurring?.lastCompleted?.toISOString(),
            next_due_date: task.recurring?.nextDue?.toISOString(),
            total_repetitions: task.recurring?.totalRepetitions,
            completed_repetitions: task.recurring?.completedRepetitions,
            end_date: task.recurring?.endDate?.toISOString(),
          })),
          { onConflict: 'id' }
        );
      
      if (error) {
        const errorInfo = handleSupabaseError(error, 'sync tasks');
        console.error('Error syncing tasks:', errorInfo);
        return { success: false, error: errorInfo };
      }
    }
    
    console.log('Tasks synced successfully');
    return { success: true };
  } catch (error) {
    const errorInfo = handleSupabaseError(error, 'sync tasks');
    console.error('Exception syncing tasks:', errorInfo);
    return { success: false, error: errorInfo };
  }
};

export const loadTasksFromSupabase = async (userId: string): Promise<{ data: Task[]; error?: any }> => {
  try {
    console.log(`Loading tasks from Supabase for user ${userId}`);
    
    // Check connection first
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest.success) {
      console.error('Cannot load tasks - Supabase connection failed:', connectionTest.error);
      return { data: [], error: connectionTest.error };
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      const errorInfo = handleSupabaseError(error, 'load tasks');
      console.error('Error loading tasks:', errorInfo);
      return { data: [], error: errorInfo };
    }
    
    if (!data) {
      console.log('No task data returned from Supabase');
      return { data: [] };
    }
    
    const tasks = data.map(task => {
      try {
        return {
          id: task.id,
          title: task.title || '',
          description: task.description || '',
          completed: Boolean(task.completed),
          createdAt: new Date(task.created_at),
          completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
          points: Number(task.points) || 0,
          category: task.category || 'general',
          priority: task.priority || 'medium',
          recurring: task.recurring_type ? {
            type: task.recurring_type,
            interval: Number(task.recurring_interval) || 1,
            lastCompleted: task.last_completed_date ? new Date(task.last_completed_date) : undefined,
            nextDue: task.next_due_date ? new Date(task.next_due_date) : undefined,
            totalRepetitions: task.total_repetitions ? Number(task.total_repetitions) : undefined,
            completedRepetitions: Number(task.completed_repetitions) || 0,
            endDate: task.end_date ? new Date(task.end_date) : undefined,
          } : undefined,
        } as Task;
      } catch (taskError) {
        console.error('Error parsing task:', task, taskError);
        return null;
      }
    }).filter(task => task !== null) as Task[];
    
    console.log(`Loaded ${tasks.length} tasks successfully`);
    return { data: tasks };
  } catch (error) {
    const errorInfo = handleSupabaseError(error, 'load tasks');
    console.error('Exception loading tasks:', errorInfo);
    return { data: [], error: errorInfo };
  }
};

// Enhanced Game stats operations with safe error handling
export const syncGameStatsToSupabase = async (stats: GameStats, userId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log(`Syncing game stats to Supabase for user ${userId}`);
    
    // Check connection first
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest.success) {
      console.error('Cannot sync game stats - Supabase connection failed:', connectionTest.error);
      return { success: false, error: connectionTest.error };
    }
    
    const { error } = await supabase
      .from('game_stats')
      .upsert({
        user_id: userId,
        level: stats.level,
        current_points: stats.currentPoints,
        total_points: stats.totalPoints,
        tasks_completed: stats.tasksCompleted,
        streak: stats.streak,
        last_completed_date: stats.lastCompletedDate,
        updated_at: new Date().toISOString(),
      });
    
    if (error) {
      const errorInfo = handleSupabaseError(error, 'sync game stats');
      console.error('Error syncing game stats:', errorInfo);
      return { success: false, error: errorInfo };
    }
    
    console.log('Game stats synced successfully');
    return { success: true };
  } catch (error) {
    const errorInfo = handleSupabaseError(error, 'sync game stats');
    console.error('Exception syncing game stats:', errorInfo);
    return { success: false, error: errorInfo };
  }
};

export const loadGameStatsFromSupabase = async (userId: string): Promise<{ data: GameStats | null; error?: any }> => {
  try {
    console.log(`Loading game stats from Supabase for user ${userId}`);
    
    // Check connection first
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest.success) {
      console.error('Cannot load game stats - Supabase connection failed:', connectionTest.error);
      return { data: null, error: connectionTest.error };
    }
    
    const { data, error } = await supabase
      .from('game_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      const errorInfo = handleSupabaseError(error, 'load game stats');
      console.error('Error loading game stats:', errorInfo);
      return { data: null, error: errorInfo };
    }
    
    if (!data) {
      console.log('No game stats found for user');
      return { data: null };
    }
    
    const stats = {
      level: Number(data.level) || 1,
      currentPoints: Number(data.current_points) || 0,
      totalPoints: Number(data.total_points) || 0,
      tasksCompleted: Number(data.tasks_completed) || 0,
      streak: Number(data.streak) || 0,
      lastCompletedDate: data.last_completed_date,
    };
    
    console.log('Game stats loaded successfully');
    return { data: stats };
  } catch (error) {
    const errorInfo = handleSupabaseError(error, 'load game stats');
    console.error('Exception loading game stats:', errorInfo);
    return { data: null, error: errorInfo };
  }
};

// Enhanced Achievements operations with safe error handling
export const syncAchievementsToSupabase = async (achievements: Achievement[], userId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log(`Syncing ${achievements.length} achievements to Supabase for user ${userId}`);
    
    // Check connection first
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest.success) {
      console.error('Cannot sync achievements - Supabase connection failed:', connectionTest.error);
      return { success: false, error: connectionTest.error };
    }
    
    if (achievements.length > 0) {
      const { error } = await supabase
        .from('user_achievements')
        .upsert(
          achievements.map(achievement => ({
            user_id: userId,
            achievement_id: achievement.id,
            unlocked: achievement.unlocked,
            current_value: achievement.currentValue,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: 'user_id,achievement_id' }
        );
      
      if (error) {
        const errorInfo = handleSupabaseError(error, 'sync achievements');
        console.error('Error syncing achievements:', errorInfo);
        return { success: false, error: errorInfo };
      }
    }
    
    console.log('Achievements synced successfully');
    return { success: true };
  } catch (error) {
    const errorInfo = handleSupabaseError(error, 'sync achievements');
    console.error('Exception syncing achievements:', errorInfo);
    return { success: false, error: errorInfo };
  }
};

export const loadAchievementsFromSupabase = async (userId: string): Promise<{ data: Achievement[] | null; error?: any }> => {
  try {
    console.log(`Loading achievements from Supabase for user ${userId}`);
    
    // Check connection first
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest.success) {
      console.error('Cannot load achievements - Supabase connection failed:', connectionTest.error);
      return { data: null, error: connectionTest.error };
    }
    
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      const errorInfo = handleSupabaseError(error, 'load achievements');
      console.error('Error loading achievements:', errorInfo);
      return { data: null, error: errorInfo };
    }
    
    if (!data || data.length === 0) {
      console.log('No achievements found for user');
      return { data: null };
    }
    
    // Import default achievements structure
    const { DEFAULT_ACHIEVEMENTS } = await import('./constants');
    
    // Merge with user progress
    const achievements = DEFAULT_ACHIEVEMENTS.map(defaultAchievement => {
      const userProgress = data.find(ua => ua.achievement_id === defaultAchievement.id);
      return {
        ...defaultAchievement,
        unlocked: Boolean(userProgress?.unlocked) || false,
        currentValue: Number(userProgress?.current_value) || 0,
      };
    });
    
    console.log('Achievements loaded successfully');
    return { data: achievements };
  } catch (error) {
    const errorInfo = handleSupabaseError(error, 'load achievements');
    console.error('Exception loading achievements:', errorInfo);
    return { data: null, error: errorInfo };
  }
};

// Connection health check with improved error handling and timeout
export const checkSupabaseHealth = async (): Promise<{ success: boolean; error?: string; details?: any }> => {
  try {
    console.log('Performing Supabase health check...');
    
    const result = await testSupabaseConnection();
    
    if (!result.success) {
      console.error('Health check failed:', result.error);
      return {
        success: false,
        error: result.error || 'Unknown connection error',
        details: {
          message: result.error,
          suggestion: 'Please check your Supabase configuration and internet connection.'
        }
      };
    }
    
    console.log('Health check passed');
    return { success: true };
  } catch (error: any) {
    console.error('Health check exception:', error);
    
    const errorInfo = handleSupabaseError(error, 'health check');
    
    return {
      success: false,
      error: errorInfo.message,
      details: {
        type: errorInfo.type,
        message: errorInfo.message,
        suggestion: errorInfo.suggestion,
        originalError: error
      }
    };
  }
};