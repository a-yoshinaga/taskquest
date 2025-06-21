import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles, Zap, Target, Calendar, Repeat, Clock, CalendarDays } from 'lucide-react';
import { Task } from '../../types';
import { useTasks } from '../../contexts/TaskContext';

interface TaskFormProps {
  task: Task | null;
  onClose: () => void;
}

const DEFAULT_CATEGORIES = ['work', 'personal', 'health', 'education', 'general'];

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const { addTask, updateTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('general');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [recurringInterval, setRecurringInterval] = useState(1);
  const [totalRepetitions, setTotalRepetitions] = useState(7); // Default to 7 repetitions
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Set form values if editing an existing task
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      
      if (DEFAULT_CATEGORIES.includes(task.category)) {
        setCategory(task.category);
      } else {
        setCategory('custom');
        setCustomCategory(task.category);
        setShowCustomCategory(true);
      }
      
      if (task.recurring) {
        setIsRecurring(true);
        setRecurringType(task.recurring.type);
        setRecurringInterval(task.recurring.interval);
        setTotalRepetitions(task.recurring.totalRepetitions || 7);
      }
    }
  }, [task]);
  
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'high':
        return { points: 20, color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
      case 'medium':
        return { points: 10, color: 'text-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' };
      case 'low':
        return { points: 5, color: 'text-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
      default:
        return { points: 10, color: 'text-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' };
    }
  };
  
  const getRecurringDescription = () => {
    const interval = recurringInterval === 1 ? '' : `${recurringInterval} `;
    const period = recurringType === 'daily' ? 'day' : recurringType === 'weekly' ? 'week' : 'month';
    const plural = recurringInterval === 1 ? '' : 's';
    return `Every ${interval}${period}${plural}`;
  };

  const calculateEndDate = () => {
    if (!isRecurring || !totalRepetitions) return null;
    
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    // Calculate total days based on repetitions and interval
    let totalDays = 0;
    switch (recurringType) {
      case 'daily':
        totalDays = (totalRepetitions - 1) * recurringInterval;
        break;
      case 'weekly':
        totalDays = (totalRepetitions - 1) * recurringInterval * 7;
        break;
      case 'monthly':
        // Approximate months as 30 days for calculation
        totalDays = (totalRepetitions - 1) * recurringInterval * 30;
        break;
    }
    
    endDate.setDate(endDate.getDate() + totalDays);
    return endDate;
  };

  const formatEndDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMotivationalMessage = () => {
    const endDate = calculateEndDate();
    if (!endDate) return '';
    
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      return `🎯 Just ${diffDays} days to complete your habit journey!`;
    } else if (diffDays <= 30) {
      return `💪 ${diffDays} days to build this amazing habit!`;
    } else if (diffDays <= 90) {
      return `🌟 ${diffDays} days to transform your routine!`;
    } else {
      return `🚀 ${diffDays} days to master this life-changing habit!`;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Add a small delay for animation effect
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const finalCategory = category === 'custom' ? customCategory : category;
    
    const taskData = {
      title,
      description,
      priority,
      category: finalCategory,
      recurring: isRecurring ? {
        type: recurringType,
        interval: recurringInterval,
        totalRepetitions,
        completedRepetitions: 0,
        nextDue: new Date(), // Set initial due date to today
        endDate: calculateEndDate()
      } : undefined
    };
    
    if (task) {
      // Update existing task
      updateTask(task.id, taskData);
    } else {
      // Add new task
      addTask(taskData);
    }
    
    setShowSuccess(true);
    
    // Close after success animation
    setTimeout(() => {
      onClose();
    }, 1000);
  };
  
  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
            <Sparkles className="h-10 w-10 text-white animate-pulse" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mt-6 animate-slideUp">
          {task ? 'Task Updated!' : 'Quest Added!'}
        </h3>
        <p className="text-gray-600 mt-2 animate-slideUp animation-delay-200">
          {task ? 'Your task has been updated successfully' : 
           isRecurring ? `Recurring habit created - ${getRecurringDescription()} for ${totalRepetitions} times!` : 'Ready to earn some XP?'}
        </p>
      </div>
    );
  }
  
  return (
    <div className="animate-slideIn">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 animate-pulse">
          {task ? <Target className="h-8 w-8 text-white" /> : <Plus className="h-8 w-8 text-white" />}
        </div>
        <h3 className="text-2xl font-bold text-gray-800">
          {task ? 'Update Your Quest' : 'Create New Quest'}
        </h3>
        <p className="text-gray-600 mt-1">
          {task ? 'Modify your existing task' : 'Every great adventure starts with a single task'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="group">
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Zap className="h-4 w-4 mr-1 text-purple-500" />
            Quest Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-gray-800 placeholder-gray-400 group-hover:border-purple-300"
            placeholder="What epic task awaits you?"
            required
          />
          <div className="mt-1 text-xs text-gray-500 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Make it specific and actionable
          </div>
        </div>
        
        {/* Description */}
        <div className="group">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Quest Details
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-gray-800 placeholder-gray-400 group-hover:border-purple-300 resize-none"
            placeholder="Add some context to help you succeed..."
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Priority */}
          <div className="group">
            <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
              Difficulty Level
            </label>
            <div className="space-y-2">
              {(['low', 'medium', 'high'] as const).map((p) => {
                const info = getPriorityInfo(p);
                return (
                  <label
                    key={p}
                    className={`
                      flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105
                      ${priority === p 
                        ? `${info.bgColor} ${info.borderColor} shadow-md` 
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'}
                    `}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={priority === p}
                      onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${priority === p ? info.color : 'border-gray-300'}`}>
                      {priority === p && <div className={`w-2 h-2 rounded-full bg-current`}></div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize text-gray-800">{p}</span>
                        <div className="flex items-center">
                          <Sparkles className={`h-4 w-4 mr-1 ${info.color}`} />
                          <span className={`font-bold ${info.color}`}>{info.points} XP</span>
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
          
          {/* Category */}
          <div className="group">
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
              Quest Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setShowCustomCategory(e.target.value === 'custom');
              }}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-gray-800 group-hover:border-purple-300"
            >
              {DEFAULT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
              <option value="custom">✨ Custom Category</option>
            </select>
            
            {/* Custom category input with animation */}
            <div className={`overflow-hidden transition-all duration-500 ${showCustomCategory ? 'max-h-20 mt-3' : 'max-h-0'}`}>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-gray-800 placeholder-gray-400"
                placeholder="Enter your custom category"
                required={category === 'custom'}
              />
            </div>
          </div>
        </div>
        
        {/* Recurring Task Options */}
        <div className="group">
          <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded border-2 transition-all duration-300 flex items-center justify-center ${isRecurring ? 'bg-purple-500 border-purple-500' : 'border-gray-300'}`}>
              {isRecurring && <Repeat className="h-3 w-3 text-white" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="font-semibold text-gray-800">Make this a recurring habit</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Perfect for daily routines and building lasting habits</p>
            </div>
          </label>
          
          {/* Recurring options with animation */}
          <div className={`overflow-hidden transition-all duration-500 ${isRecurring ? 'max-h-96 mt-4' : 'max-h-0'}`}>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Repeat every</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={recurringInterval}
                    onChange={(e) => setRecurringInterval(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                  <select
                    value={recurringType}
                    onChange={(e) => setRecurringType(e.target.value as 'daily' | 'weekly' | 'monthly')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300"
                  >
                    <option value="daily">Day(s)</option>
                    <option value="weekly">Week(s)</option>
                    <option value="monthly">Month(s)</option>
                  </select>
                </div>
              </div>
              
              {/* Total Repetitions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How many times do you want to repeat this habit?
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={totalRepetitions}
                  onChange={(e) => setTotalRepetitions(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300"
                  placeholder="e.g., 21 for habit formation"
                />
                <div className="mt-2 text-xs text-gray-600">
                  💡 Tip: 21 days to form a habit, 66 days to make it automatic
                </div>
              </div>
              
              {/* Habit Summary with End Date */}
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-700">Habit Journey Summary</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frequency:</span>
                    <span className="font-medium text-gray-800">{getRecurringDescription()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total repetitions:</span>
                    <span className="font-medium text-gray-800">{totalRepetitions} times</span>
                  </div>
                  {calculateEndDate() && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">End date:</span>
                        <span className="font-medium text-purple-600">{formatEndDate(calculateEndDate()!)}</span>
                      </div>
                      <div className="mt-2 p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                        <div className="text-center text-sm font-medium text-purple-700">
                          {getMotivationalMessage()}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* XP Preview */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="font-semibold text-gray-800">Quest Reward</p>
                <p className="text-sm text-gray-600">
                  {isRecurring ? `${getRecurringDescription()} for ${totalRepetitions} times - build your habit!` : 'Complete this task to earn XP'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                +{getPriorityInfo(priority).points} XP
                {isRecurring && (
                  <div className="text-xs text-gray-500 mt-1">
                    per completion
                  </div>
                )}
              </div>
              {isRecurring && (
                <div className="text-sm font-medium text-purple-500 mt-1">
                  Total: {getPriorityInfo(priority).points * totalRepetitions} XP
                </div>
              )}
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {priority} Priority {isRecurring && '• Recurring'}
              </div>
            </div>
          </div>
        </div>
      </form>
      
      {/* Form actions */}
      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-300 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={!title.trim() || isSubmitting}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold flex items-center min-w-[140px] justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating...
            </>
          ) : (
            <>
              {task ? <Target className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
              {task ? 'Update Quest' : 'Start Quest'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TaskForm;