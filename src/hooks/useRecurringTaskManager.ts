import { useState, useEffect } from 'react';
import { Task } from '../types';
import { useTasks } from '../contexts/TaskContext';

interface RecurringTaskNotification {
  id: string;
  type: 'new_recurring' | 'streak_milestone' | 'habit_reminder' | 'completion_celebration';
  task: Task;
  message: string;
  submessage?: string;
  daysLeft?: number;
  streakCount?: number;
}

export const useRecurringTaskManager = () => {
  const { tasks, addTask } = useTasks();
  const [notifications, setNotifications] = useState<RecurringTaskNotification[]>([]);

  useEffect(() => {
    const checkAndCreateRecurringTasks = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayString = today.toISOString().split('T')[0];
      
      console.log('🔄 Checking for recurring tasks that need new instances...');
      console.log(`📅 Today: ${todayString}`);
      
      const newNotifications: RecurringTaskNotification[] = [];
      const tasksToCreate: Partial<Task>[] = [];

      // Find all recurring tasks (both completed and incomplete)
      const recurringTasks = tasks.filter(task => task.recurring);
      console.log(`📋 Found ${recurringTasks.length} recurring tasks total`);

      // Group recurring tasks by their "template" (title + category + priority)
      const taskGroups = new Map<string, Task[]>();
      
      recurringTasks.forEach(task => {
        const key = `${task.title}-${task.category}-${task.priority}`;
        if (!taskGroups.has(key)) {
          taskGroups.set(key, []);
        }
        taskGroups.get(key)!.push(task);
      });

      console.log(`🔗 Found ${taskGroups.size} unique recurring task types`);

      taskGroups.forEach((taskInstances, taskKey) => {
        // Sort by creation date to get the latest instance
        taskInstances.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const latestTask = taskInstances[0];
        
        console.log(`\n🔍 Checking task group: "${latestTask.title}"`);
        console.log(`📊 Total instances: ${taskInstances.length}`);
        console.log(`✅ Completed instances: ${taskInstances.filter(t => t.completed).length}`);
        
        if (!latestTask.recurring) return;

        // Check if the habit journey is complete
        const totalReps = latestTask.recurring.totalRepetitions || 0;
        const completedInstances = taskInstances.filter(t => t.completed);
        const completedReps = completedInstances.length;
        
        console.log(`🎯 Progress: ${completedReps}/${totalReps || 'unlimited'} repetitions`);

        // If habit journey is complete, show celebration if needed
        if (totalReps > 0 && completedReps >= totalReps) {
          console.log(`🎉 Habit journey completed for "${latestTask.title}"`);
          
          const lastCompleted = completedInstances[0];
          if (lastCompleted && lastCompleted.completedAt) {
            const daysSinceCompletion = Math.floor(
              (now.getTime() - new Date(lastCompleted.completedAt).getTime()) / (1000 * 60 * 60 * 24)
            );
            
            if (daysSinceCompletion <= 1) {
              newNotifications.push({
                id: `completion-${latestTask.id}-${Date.now()}`,
                type: 'completion_celebration',
                task: latestTask,
                message: 'Habit Journey Complete! 🎉',
                submessage: `You've successfully completed all ${totalReps} repetitions of "${latestTask.title}"!`
              });
            }
          }
          return;
        }

        // Check if we need to create a new instance
        const hasActiveInstance = taskInstances.some(t => !t.completed);
        
        if (hasActiveInstance) {
          console.log(`⏳ Active instance already exists for "${latestTask.title}"`);
          return;
        }

        // All instances are completed, check if we need a new one
        const lastCompletedTask = completedInstances[0];
        if (!lastCompletedTask || !lastCompletedTask.completedAt) {
          console.log(`❌ No completed instance found for "${latestTask.title}"`);
          return;
        }

        // Calculate when the next instance should be due
        const lastCompletedDate = new Date(lastCompletedTask.completedAt);
        const nextDueDate = new Date(lastCompletedDate);
        
        switch (latestTask.recurring.type) {
          case 'daily':
            nextDueDate.setDate(nextDueDate.getDate() + latestTask.recurring.interval);
            break;
          case 'weekly':
            nextDueDate.setDate(nextDueDate.getDate() + (latestTask.recurring.interval * 7));
            break;
          case 'monthly':
            nextDueDate.setMonth(nextDueDate.getMonth() + latestTask.recurring.interval);
            break;
        }

        console.log(`📅 Last completed: ${lastCompletedDate.toISOString().split('T')[0]}`);
        console.log(`📅 Next due: ${nextDueDate.toISOString().split('T')[0]}`);
        console.log(`📅 Today: ${todayString}`);

        // Check if it's time to create a new instance
        if (now >= nextDueDate) {
          console.log(`✨ Creating new instance for "${latestTask.title}"`);
          
          // Calculate the next due date for the future instance
          const futureNextDue = new Date(nextDueDate);
          switch (latestTask.recurring.type) {
            case 'daily':
              futureNextDue.setDate(futureNextDue.getDate() + latestTask.recurring.interval);
              break;
            case 'weekly':
              futureNextDue.setDate(futureNextDue.getDate() + (latestTask.recurring.interval * 7));
              break;
            case 'monthly':
              futureNextDue.setMonth(futureNextDue.getMonth() + latestTask.recurring.interval);
              break;
          }
          
          // Calculate days left in habit journey
          const daysLeft = latestTask.recurring.endDate 
            ? Math.ceil((new Date(latestTask.recurring.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : null;
          
          // Only create if we haven't exceeded the end date
          if (!latestTask.recurring.endDate || now <= new Date(latestTask.recurring.endDate)) {
            // Create new task instance
            const newTaskData: Partial<Task> = {
              title: latestTask.title,
              description: latestTask.description,
              priority: latestTask.priority,
              category: latestTask.category,
              recurring: {
                type: latestTask.recurring.type,
                interval: latestTask.recurring.interval,
                totalRepetitions: latestTask.recurring.totalRepetitions,
                completedRepetitions: 0, // This is for the new instance
                nextDue: futureNextDue,
                endDate: latestTask.recurring.endDate,
                lastCompleted: lastCompletedTask.completedAt
              }
            };
            
            tasksToCreate.push(newTaskData);
            
            // Calculate streak count for notifications
            const streakCount = completedReps;
            
            // Create appropriate notification
            if (streakCount > 0 && streakCount % 7 === 0) {
              // Weekly streak milestone
              newNotifications.push({
                id: `streak-${latestTask.id}-${Date.now()}`,
                type: 'streak_milestone',
                task: latestTask,
                message: `${streakCount} Day Streak! 🔥`,
                submessage: 'You\'re building an incredible habit!',
                daysLeft: daysLeft || undefined,
                streakCount
              });
            } else if (daysLeft && daysLeft <= 7) {
              // Urgent reminder for ending habits
              newNotifications.push({
                id: `urgent-${latestTask.id}-${Date.now()}`,
                type: 'habit_reminder',
                task: latestTask,
                message: 'Final Sprint! 💪',
                submessage: `Only ${daysLeft} days left to complete your habit journey!`,
                daysLeft
              });
            } else {
              // Regular new recurring task notification
              newNotifications.push({
                id: `new-${latestTask.id}-${Date.now()}`,
                type: 'new_recurring',
                task: latestTask,
                message: 'Daily Habit Ready! 🎯',
                submessage: `Time to continue building your "${latestTask.title}" habit`,
                daysLeft: daysLeft || undefined
              });
            }
          } else {
            console.log(`⏰ Habit period ended for "${latestTask.title}"`);
          }
        } else {
          console.log(`⏰ Not yet time for new instance of "${latestTask.title}"`);
        }
      });

      // Create new task instances
      if (tasksToCreate.length > 0) {
        console.log(`\n🚀 Creating ${tasksToCreate.length} new recurring task instances`);
        tasksToCreate.forEach((taskData, index) => {
          console.log(`${index + 1}. Creating: "${taskData.title}"`);
          addTask(taskData);
        });
      } else {
        console.log(`\n✅ No new recurring task instances needed`);
      }

      // Show notifications if any
      if (newNotifications.length > 0) {
        console.log(`📢 Showing ${newNotifications.length} recurring task notifications`);
        setNotifications(newNotifications);
      }
    };

    // Small delay to ensure tasks are loaded
    const timeoutId = setTimeout(checkAndCreateRecurringTasks, 500);
    
    return () => clearTimeout(timeoutId);
  }, [tasks, addTask]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const dismissAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    dismissNotification,
    dismissAllNotifications
  };
};