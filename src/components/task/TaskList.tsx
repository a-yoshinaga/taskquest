import React, { useState } from 'react';
import { PlusCircle, Filter, CheckCircle2, Sparkles, Zap, X, Calendar, Clock, Database, Loader } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import { Task } from '../../types';

const TaskList: React.FC = () => {
  const { tasks, filterTasks, syncing, loading, addTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [dateRange, setDateRange] = useState<string>('all');
  
  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setShowForm(true);
  };
  
  const handleFormClose = () => {
    setShowForm(false);
    setTaskToEdit(null);
  };

  const insertDemoData = () => {
    const demoTasks = [
      {
        title: "Complete Bolt.new Tutorial: Getting Started",
        description: "Learn the basics of Bolt.new and how to create your first project. Understand the interface and core features.",
        priority: 'medium' as const,
        category: 'education',
      },
      {
        title: "Build a Simple React Component",
        description: "Practice creating a functional React component with props and state using Bolt's AI assistance.",
        priority: 'high' as const,
        category: 'education',
      },
      {
        title: "Learn Tailwind CSS Basics",
        description: "Master responsive design and utility classes in Tailwind CSS through hands-on practice in Bolt.",
        priority: 'medium' as const,
        category: 'education',
      },
      {
        title: "Implement User Authentication",
        description: "Follow Bolt tutorial to add user login/signup functionality using Supabase authentication.",
        priority: 'high' as const,
        category: 'work',
      },
      {
        title: "Create a Database Schema",
        description: "Design and implement a database schema using Supabase with proper relationships and security policies.",
        priority: 'high' as const,
        category: 'work',
      },
      {
        title: "Add Real-time Features",
        description: "Implement real-time updates using Supabase subscriptions to make your app more interactive.",
        priority: 'medium' as const,
        category: 'work',
      },
      {
        title: "Deploy Your First App",
        description: "Learn how to deploy your Bolt-created application to production using Netlify or Vercel.",
        priority: 'low' as const,
        category: 'education',
      },
      {
        title: "Optimize App Performance",
        description: "Apply performance best practices: code splitting, lazy loading, and image optimization.",
        priority: 'low' as const,
        category: 'work',
      },
      {
        title: "Add API Integration",
        description: "Connect your app to external APIs and handle data fetching with proper error handling.",
        priority: 'medium' as const,
        category: 'work',
      },
      {
        title: "Implement Advanced UI Components",
        description: "Create complex UI components like modals, dropdowns, and interactive forms with animations.",
        priority: 'low' as const,
        category: 'education',
      },
      {
        title: "Set Up Testing Environment",
        description: "Learn to write and run tests for your components and functions to ensure code quality.",
        priority: 'medium' as const,
        category: 'education',
      },
      {
        title: "Master Git Workflow",
        description: "Practice version control with Git: branching, merging, and collaborative development workflows.",
        priority: 'low' as const,
        category: 'education',
      }
    ];

    // Add all demo tasks
    demoTasks.forEach(taskData => {
      addTask(taskData);
    });
  };
  
  // Date range filtering function
  const getDateRangeFilter = (range: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          start: yesterday,
          end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'this-week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return {
          start: startOfWeek,
          end: now
        };
      case 'last-week':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        lastWeekEnd.setHours(23, 59, 59, 999);
        return {
          start: lastWeekStart,
          end: lastWeekEnd
        };
      case 'this-month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start: startOfMonth,
          end: now
        };
      case 'last-month':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        lastMonthEnd.setHours(23, 59, 59, 999);
        return {
          start: lastMonthStart,
          end: lastMonthEnd
        };
      case 'last-7-days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return {
          start: sevenDaysAgo,
          end: now
        };
      case 'last-30-days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return {
          start: thirtyDaysAgo,
          end: now
        };
      case 'last-90-days':
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);
        return {
          start: ninetyDaysAgo,
          end: now
        };
      default:
        return null;
    }
  };
  
  // Enhanced filter function with date range
  const getFilteredTasks = () => {
    let filtered = filterTasks(filterCategory === 'all' ? undefined : filterCategory, showCompleted);
    
    // Apply date range filter
    if (dateRange !== 'all') {
      const range = getDateRangeFilter(dateRange);
      if (range) {
        filtered = filtered.filter(task => {
          // For completed tasks, filter by completion date
          if (task.completed && task.completedAt) {
            const completedDate = new Date(task.completedAt);
            return completedDate >= range.start && completedDate <= range.end;
          }
          // For incomplete tasks, filter by creation date
          else if (!showCompleted || !task.completed) {
            const createdDate = new Date(task.createdAt);
            return createdDate >= range.start && createdDate <= range.end;
          }
          return false;
        });
      }
    }
    
    return filtered;
  };
  
  const filteredTasks = getFilteredTasks();
  
  // Get unique categories from tasks
  const categories = ['all', ...new Set(tasks.map(task => task.category))];
  
  // Calculate stats for ALL tasks (not filtered) - this is the key fix
  const allCompletedTasks = tasks.filter(task => task.completed);
  const totalCompletedCount = allCompletedTasks.length;
  const totalTaskCount = tasks.length;
  const totalXP = allCompletedTasks.reduce((sum, task) => sum + task.points, 0);
  
  // Calculate stats for filtered tasks (for display purposes)
  const filteredCompletedCount = filteredTasks.filter(task => task.completed).length;
  const filteredTotalCount = filteredTasks.length;
  
  // Get date range display name
  const getDateRangeDisplayName = (range: string) => {
    const names = {
      'all': 'All Time',
      'today': 'Today',
      'yesterday': 'Yesterday',
      'this-week': 'This Week',
      'last-week': 'Last Week',
      'this-month': 'This Month',
      'last-month': 'Last Month',
      'last-7-days': 'Last 7 Days',
      'last-30-days': 'Last 30 Days',
      'last-90-days': 'Last 90 Days'
    };
    return names[range as keyof typeof names] || range;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader className="h-8 w-8 text-purple-500 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading your tasks...</h3>
          <p className="text-gray-600">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            My Quests
          </h2>
          <p className="text-gray-600">
            {totalTaskCount === 0 
              ? "Ready to start your adventure?" 
              : `${totalCompletedCount} of ${totalTaskCount} quests completed`}
            {dateRange !== 'all' && filteredTotalCount !== totalTaskCount && (
              <span className="ml-2 text-purple-600 font-medium">
                • Showing {filteredTotalCount} from {getDateRangeDisplayName(dateRange)}
              </span>
            )}
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="group flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <div className="relative">
            <PlusCircle className="h-5 w-5 transition-transform group-hover:rotate-90 duration-300" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping group-hover:animate-pulse"></div>
          </div>
          <span>New Quest</span>
        </button>
      </div>
      
      {/* Enhanced task statistics and filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-wrap justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              {syncing && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">Overall Progress</p>
              <p className="text-xl font-bold text-gray-800">{totalCompletedCount}/{totalTaskCount} quests</p>
              <div className="flex items-center mt-1">
                <Sparkles className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-sm font-medium text-purple-600">{totalXP} XP earned</span>
                <span className="ml-2 text-xs text-gray-500">
                  total lifetime
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500 font-medium">Filters:</span>
            </div>
            
            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-sm py-2 px-3 font-medium bg-white"
              >
                <option value="all">All Time</option>
                <optgroup label="Recent">
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last-7-days">Last 7 Days</option>
                  <option value="last-30-days">Last 30 Days</option>
                </optgroup>
                <optgroup label="Weeks">
                  <option value="this-week">This Week</option>
                  <option value="last-week">Last Week</option>
                </optgroup>
                <optgroup label="Months">
                  <option value="this-month">This Month</option>
                  <option value="last-month">Last Month</option>
                  <option value="last-90-days">Last 90 Days</option>
                </optgroup>
              </select>
            </div>
            
            {/* Category filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-sm py-2 px-3 font-medium"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            
            {/* Completed toggle */}
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={() => setShowCompleted(!showCompleted)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 transition-all duration-300 ${showCompleted ? 'bg-purple-500 border-purple-500' : 'border-gray-300 group-hover:border-purple-400'}`}>
                  {showCompleted && (
                    <CheckCircle2 className="h-3 w-3 text-white absolute top-0.5 left-0.5" />
                  )}
                </div>
              </div>
              <span className="font-medium">Show completed</span>
            </label>
          </div>
        </div>
        
        {/* Active filters display */}
        {(dateRange !== 'all' || filterCategory !== 'all' || showCompleted) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Active filters:</span>
            
            {dateRange !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                <Clock className="h-3 w-3" />
                {getDateRangeDisplayName(dateRange)}
                <button
                  onClick={() => setDateRange('all')}
                  className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filterCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                {filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1)}
                <button
                  onClick={() => setFilterCategory('all')}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {showCompleted && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                Including completed
                <button
                  onClick={() => setShowCompleted(false)}
                  className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            <button
              onClick={() => {
                setDateRange('all');
                setFilterCategory('all');
                setShowCompleted(false);
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
        
        {/* Progress bar - always shows overall progress */}
        {totalTaskCount > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Overall Quest Progress</span>
              <span>{Math.round((totalCompletedCount / totalTaskCount) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                style={{ width: `${(totalCompletedCount / totalTaskCount) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Filtered results summary */}
        {(dateRange !== 'all' || filterCategory !== 'all' || showCompleted) && filteredTotalCount !== totalTaskCount && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700 font-medium">
                Filtered Results: {filteredCompletedCount} of {filteredTotalCount} tasks completed
              </span>
              <span className="text-blue-600">
                {filteredTotalCount > 0 ? Math.round((filteredCompletedCount / filteredTotalCount) * 100) : 0}%
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Task list */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task, index) => (
            <div 
              key={task.id}
              className="animate-slideIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <TaskItem 
                task={task} 
                onEdit={handleEditTask}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-10 w-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {totalTaskCount === 0 ? "Ready for your first quest?" : 
               dateRange !== 'all' ? `No quests found for ${getDateRangeDisplayName(dateRange).toLowerCase()}` :
               "No quests match your filters"}
            </h3>
            <p className="text-gray-600 mb-6">
              {totalTaskCount === 0 
                ? "Create your first task and start earning XP!" 
                : dateRange !== 'all' 
                ? `Try selecting a different time period or create new tasks for ${getDateRangeDisplayName(dateRange).toLowerCase()}.`
                : "Try adjusting your filters to see more tasks."}
            </p>
            {totalTaskCount === 0 && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <PlusCircle className="h-5 w-5" />
                  Create First Quest
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3">
                    Or try our demo to see how TaskQuest works
                  </p>
                  <button
                    onClick={insertDemoData}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-5 py-2.5 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                  >
                    <Database className="h-4 w-4" />
                    Insert Demo Data
                  </button>
                  <p className="text-xs text-gray-400 mt-2">
                    💡 Demo tasks can be removed using the "Reset All Data" button in your profile menu
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Task form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto animate-scaleIn">
            <button
              onClick={handleFormClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
            <TaskForm 
              task={taskToEdit}
              onClose={handleFormClose}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;