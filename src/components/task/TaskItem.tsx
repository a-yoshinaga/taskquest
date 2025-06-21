import React from 'react';
import { CheckCircle, Circle, Edit, Trash, Clock, Flag, RotateCcw, Repeat, CalendarDays, Target } from 'lucide-react';
import { Task } from '../../types';
import { useTasks } from '../../contexts/TaskContext';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit }) => {
  const { completeTask, deleteTask, undoTask } = useTasks();
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work': return 'bg-blue-100 text-blue-800';
      case 'personal': return 'bg-purple-100 text-purple-800';
      case 'health': return 'bg-green-100 text-green-800';
      case 'education': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatEndDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRecurringProgress = () => {
    if (!task.recurring) return null;
    
    const completed = task.recurring.completedRepetitions || 0;
    const total = task.recurring.totalRepetitions || 0;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  };

  const isRecurringComplete = () => {
    const progress = getRecurringProgress();
    return progress && progress.completed >= progress.total;
  };

  const getDaysUntilEnd = () => {
    if (!task.recurring?.endDate) return null;
    
    const today = new Date();
    const endDate = new Date(task.recurring.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getMotivationalMessage = () => {
    const daysLeft = getDaysUntilEnd();
    const progress = getRecurringProgress();
    
    if (!daysLeft || !progress) return null;
    
    if (isRecurringComplete()) {
      return "🎉 Habit completed! Amazing dedication!";
    }
    
    if (daysLeft <= 0) {
      return "⏰ Habit period ended";
    }
    
    if (daysLeft <= 3) {
      return `🔥 Only ${daysLeft} days left! Push through!`;
    } else if (daysLeft <= 7) {
      return `💪 ${daysLeft} days to go! You're almost there!`;
    } else {
      return `🌟 ${daysLeft} days remaining in your journey`;
    }
  };
  
  return (
    <div className={`
      bg-white rounded-lg shadow-sm border border-gray-100
      p-4 mb-3 transition-all duration-300 relative
      ${task.completed ? 'opacity-70 bg-gray-50' : 'hover:shadow-md'}
      ${isRecurringComplete() ? 'ring-2 ring-green-200 bg-green-50' : ''}
    `}>
      <div className="flex items-start gap-3">
        {/* Completion toggle */}
        <button 
          onClick={() => !task.completed && completeTask(task.id)}
          className={`
            mt-1 flex-shrink-0 transition-all duration-200
            ${task.completed ? 'cursor-default' : 'hover:scale-110'}
          `}
          disabled={task.completed}
        >
          {task.completed ? (
            <CheckCircle className="h-6 w-6 text-teal-500" />
          ) : (
            <Circle className="h-6 w-6 text-gray-300" />
          )}
        </button>
        
        {/* Task content */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
              {task.title}
            </h3>
            
            {/* Recurring indicator */}
            {task.recurring && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-800">
                <Repeat className="h-3 w-3" />
                Recurring
              </span>
            )}
            
            {/* Category badge */}
            <span className={`
              text-xs px-2 py-0.5 rounded-full font-medium
              ${getCategoryColor(task.category)}
            `}>
              {task.category}
            </span>
            
            {/* Points badge */}
            <span className={`
              text-xs px-2 py-0.5 rounded-full font-medium
              ${task.completed ? 'bg-gray-100 text-gray-500' : 'bg-purple-100 text-purple-800'}
            `}>
              {task.points} XP
            </span>
          </div>
          
          {/* Description */}
          {task.description && (
            <p className={`text-sm mb-2 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}

          {/* Recurring progress and end date */}
          {task.recurring && (
            <div className="mb-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">
                    Progress: {getRecurringProgress()?.completed || 0}/{getRecurringProgress()?.total || 0}
                  </span>
                </div>
                {task.recurring.endDate && (
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3 text-purple-600" />
                    <span className="text-xs text-purple-600">
                      Ends {formatEndDate(task.recurring.endDate)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-purple-200 rounded-full overflow-hidden mb-1">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${getRecurringProgress()?.percentage || 0}%` }}
                ></div>
              </div>
              
              {/* Motivational message */}
              {getMotivationalMessage() && (
                <div className="text-xs text-purple-700 font-medium">
                  {getMotivationalMessage()}
                </div>
              )}
            </div>
          )}
          
          {/* Task metadata */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Created {formatDate(task.createdAt)}</span>
            </div>
            
            {task.completed && task.completedAt && (
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-teal-500" />
                <span>Completed {formatDate(task.completedAt)}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <Flag className={`h-3 w-3 mr-1 ${getPriorityColor(task.priority)}`} />
              <span className="capitalize">{task.priority}</span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-1">
          {task.completed ? (
            <button 
              onClick={() => undoTask(task.id)}
              className="p-1 text-gray-500 hover:text-orange-600 transition-colors group"
              title="Mark as incomplete"
            >
              <RotateCcw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          ) : (
            <button 
              onClick={() => onEdit(task)}
              className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
              title="Edit task"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          <button 
            onClick={() => deleteTask(task.id)}
            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
            title="Delete task"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;