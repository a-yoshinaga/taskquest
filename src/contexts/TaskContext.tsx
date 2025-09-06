import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task } from '../types';
import { PRIORITY_POINTS } from '../utils/constants';
import { useGame } from './GameContext';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Partial<Task>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  undoTask: (id: string) => void;
  filterTasks: (category?: string, showCompleted?: boolean) => Task[];
  syncing: boolean;
  loading: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { completeTask: updateGameProgress, undoTask: revertGameProgress } = useGame();
  
  const LOCAL_STORAGE_KEY = 'taskquest.tasks.v1';
  
  const serializeTasks = (tasksToSave: Task[]) => {
    return JSON.stringify(
      tasksToSave.map(t => ({
        ...t,
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : undefined,
        completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : undefined,
        recurring: t.recurring
          ? {
              ...t.recurring,
              lastCompleted: t.recurring.lastCompleted ? new Date(t.recurring.lastCompleted).toISOString() : undefined,
              nextDue: t.recurring.nextDue ? new Date(t.recurring.nextDue).toISOString() : undefined,
              endDate: t.recurring.endDate ? new Date(t.recurring.endDate).toISOString() : undefined,
            }
          : undefined,
      }))
    );
  };
  
  const deserializeTasks = (raw: string | null): Task[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((t: any) => ({
        id: String(t.id),
        title: String(t.title || ''),
        description: t.description ? String(t.description) : undefined,
        completed: Boolean(t.completed),
        createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
        completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
        points: Number(t.points) || 0,
        category: String(t.category || 'general'),
        priority: t.priority as Task['priority'] || 'medium',
        recurring: t.recurring
          ? {
              type: t.recurring.type,
              interval: Number(t.recurring.interval) || 1,
              lastCompleted: t.recurring.lastCompleted ? new Date(t.recurring.lastCompleted) : undefined,
              nextDue: t.recurring.nextDue ? new Date(t.recurring.nextDue) : undefined,
              totalRepetitions: t.recurring.totalRepetitions ? Number(t.recurring.totalRepetitions) : undefined,
              completedRepetitions: Number(t.recurring.completedRepetitions) || 0,
              endDate: t.recurring.endDate ? new Date(t.recurring.endDate) : undefined,
            }
          : undefined,
      })) as Task[];
    } catch (e) {
      console.warn('Failed to parse tasks from localStorage:', e);
      return [];
    }
  };
  
  // Initialize tasks on first load from localStorage
  useEffect(() => {
    const initializeTasks = async () => {
      if (hasInitialized) return;
      
      console.log('Initializing tasks...');
      setLoading(true);
      setError(null);
      
      try {
        const stored = deserializeTasks(localStorage.getItem(LOCAL_STORAGE_KEY));
        const processed = processRecurringOnLoad(stored);
        setTasks(processed);
        setHasInitialized(true);
      } catch (err) {
        console.error('Error initializing tasks:', err);
        setError('Failed to initialize tasks');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    
    initializeTasks();
  }, [hasInitialized]);

  // Persist tasks to localStorage whenever tasks change
  useEffect(() => {
    if (!hasInitialized) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, serializeTasks(tasks));
    } catch (e) {
      console.warn('Failed to save tasks to localStorage:', e);
    }
  }, [tasks, hasInitialized]);
  
  const addTask = (taskData: Partial<Task>) => {
    try {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: taskData.title || '',
        description: taskData.description || '',
        completed: false,
        createdAt: new Date(),
        points: PRIORITY_POINTS[taskData.priority || 'medium'],
        category: taskData.category || 'general',
        priority: taskData.priority || 'medium',
        recurring: taskData.recurring
      };
      
      console.log('Adding new task:', newTask.title, newTask.recurring ? '(recurring)' : '(one-time)');
      
      setTasks(prevTasks => [...prevTasks, newTask]);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task');
    }
  };
  
  const updateTask = (id: string, updates: Partial<Task>) => {
    try {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? { ...task, ...updates } : task
        )
      );
      setError(null);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    }
  };
  
  const deleteTask = (id: string) => {
    try {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  };
  
  const completeTask = (id: string) => {
    try {
      const completedAt = new Date();
      
      setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.id === id) {
            const updatedTask = { 
              ...task, 
              completed: true, 
              completedAt 
            };
            
            // Update recurring task progress
            if (task.recurring) {
              const currentReps = task.recurring.completedRepetitions || 0;
              const nextDue = new Date(completedAt);
              
              // Calculate next due date
              switch (task.recurring.type) {
                case 'daily':
                  nextDue.setDate(nextDue.getDate() + task.recurring.interval);
                  break;
                case 'weekly':
                  nextDue.setDate(nextDue.getDate() + (task.recurring.interval * 7));
                  break;
                case 'monthly':
                  nextDue.setMonth(nextDue.getMonth() + task.recurring.interval);
                  break;
              }
              
              updatedTask.recurring = {
                ...task.recurring,
                nextDue,
                lastCompleted: completedAt,
                completedRepetitions: currentReps + 1
              };
              
              console.log(`Completed recurring task "${task.title}" - ${currentReps + 1}/${task.recurring.totalRepetitions || 'unlimited'} repetitions`);
            }
            
            return updatedTask;
          }
          return task;
        })
      );
      
      // Find the completed task and update game progress
      const completedTask = tasks.find(task => task.id === id);
      if (completedTask) {
        updateGameProgress({
          ...completedTask,
          completed: true,
          completedAt
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error completing task:', err);
      setError('Failed to complete task');
    }
  };
  
  const undoTask = (id: string) => {
    try {
      // Find the task before updating it
      const taskToUndo = tasks.find(task => task.id === id);
      
      setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.id === id) {
            const updatedTask = { ...task, completed: false, completedAt: undefined };
            
            // Revert recurring task progress
            if (task.recurring && task.recurring.completedRepetitions) {
              updatedTask.recurring = {
                ...task.recurring,
                completedRepetitions: Math.max(0, task.recurring.completedRepetitions - 1)
              };
              
              console.log(`Undid recurring task "${task.title}" - ${updatedTask.recurring.completedRepetitions}/${task.recurring.totalRepetitions || 'unlimited'} repetitions`);
            }
            
            return updatedTask;
          }
          return task;
        })
      );
      
      // Revert game progress if task was found
      if (taskToUndo && taskToUndo.completed) {
        revertGameProgress(taskToUndo);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error undoing task:', err);
      setError('Failed to undo task');
    }
  };
  
  const filterTasks = (category?: string, showCompleted = false) => {
    try {
      return tasks.filter(task => {
        // Filter by completion status
        if (!showCompleted && task.completed) {
          return false;
        }
        
        // Filter by category if specified
        if (category && category !== 'all' && task.category !== category) {
          return false;
        }
        
        return true;
      });
    } catch (err) {
      console.error('Error filtering tasks:', err);
      return [];
    }
  };
  
  const value = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    undoTask,
    filterTasks,
    syncing,
    loading,
    error
  };
  
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
// 1) サーバーからロードした直後に呼び出す関数
const processRecurringOnLoad = (rawTasks: Task[]): Task[] => {
  const now = new Date();

  return rawTasks.map(task => {
    if (!task.recurring) return task;

    const { nextDue, type, interval, lastCompleted } = task.recurring;
    // nextDue が「昨日以前」であれば、未完了状態にリセットして nextDue を再計算
    if (nextDue && now >= new Date(nextDue)) {
      // ベースにする日付は lastCompleted があればそこから、なければ today から
      const base = lastCompleted ? new Date(lastCompleted) : now;
      const newNextDue = new Date(base);

      switch (type) {
        case 'daily':
          newNextDue.setDate(newNextDue.getDate() + interval);
          break;
        case 'weekly':
          newNextDue.setDate(newNextDue.getDate() + interval * 7);
          break;
        case 'monthly':
          newNextDue.setMonth(newNextDue.getMonth() + interval);
          break;
      }

      return {
        ...task,
        // 完了済みフラグをリセット
        completed: false,
        completedAt: undefined,
        // recurring 情報を更新
        recurring: {
          ...task.recurring,
          lastCompleted: undefined,              // 前回完了情報はクリア
          nextDue: newNextDue,                   // 新しい期日
          completedRepetitions: 0,               // 繰り返し回数もリセット
        }
      };
    }

    return task;
  });
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};