import React from 'react';
import { Award, TrendingUp, Star, CheckSquare, Calendar, Sparkles, Trophy, CheckCircle, ChevronLeft, ChevronRight, Medal, Filter, X } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { useTasks } from '../../contexts/TaskContext';
import { CalendarDay } from '../../types';
import CalendarDayDetail from './CalendarDayDetail';

const Dashboard: React.FC = () => {
  const { stats, achievements, levelProgress } = useGame();
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDay, setSelectedDay] = React.useState<CalendarDay | null>(null);
  const [achievementFilter, setAchievementFilter] = React.useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = React.useState(false);
  
  // Calculate statistics
  const completedTasks = tasks.filter(task => task.completed);
  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;
  
  // Get filtered achievements
  const getFilteredAchievements = () => {
    let filtered = achievements;
    
    // Filter by category
    if (achievementFilter !== 'all') {
      filtered = filtered.filter(achievement => achievement.category === achievementFilter);
    }
    
    // Filter by unlocked status
    if (showUnlockedOnly) {
      filtered = filtered.filter(achievement => achievement.unlocked);
    }
    
    return filtered;
  };
  
  const filteredAchievements = getFilteredAchievements();
  const unlockedAchievements = achievements.filter(achievement => achievement.unlocked);
  
  // Get unique categories for filter
  const achievementCategories = [
    'all',
    ...new Set(achievements.map(achievement => achievement.category))
  ];
  
  // Get category display names
  const getCategoryDisplayName = (category: string) => {
    const names = {
      'all': 'All Categories',
      'beginner': 'Beginner',
      'intermediate': 'Intermediate', 
      'advanced': 'Advanced',
      'expert': 'Expert',
      'legendary': 'Legendary',
      'daily': 'Daily Productivity',
      'streak': 'Streak Master',
      'specialist': 'Category Specialist',
      'priority': 'Priority Master',
      'xp': 'XP Milestones',
      'special': 'Special Events'
    };
    return names[category as keyof typeof names] || category;
  };
  
  // Get category colors
  const getCategoryColor = (category: string) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-800 border-green-200',
      'intermediate': 'bg-blue-100 text-blue-800 border-blue-200',
      'advanced': 'bg-purple-100 text-purple-800 border-purple-200',
      'expert': 'bg-orange-100 text-orange-800 border-orange-200',
      'legendary': 'bg-red-100 text-red-800 border-red-200',
      'daily': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'streak': 'bg-pink-100 text-pink-800 border-pink-200',
      'specialist': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'priority': 'bg-teal-100 text-teal-800 border-teal-200',
      'xp': 'bg-amber-100 text-amber-800 border-amber-200',
      'special': 'bg-violet-100 text-violet-800 border-violet-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  // Calendar logic
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  
  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));
  
  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayTasks = tasks.filter(task => {
        if (!task.completed || !task.completedAt) return false;
        const completedDate = new Date(task.completedAt);
        return (
          completedDate.getDate() === current.getDate() &&
          completedDate.getMonth() === current.getMonth() &&
          completedDate.getFullYear() === current.getFullYear()
        );
      });
      
      const totalXP = dayTasks.reduce((sum, task) => sum + task.points, 0);
      const today = new Date();
      
      days.push({
        date: new Date(current),
        tasks: dayTasks,
        totalXP,
        isToday: (
          current.getDate() === today.getDate() &&
          current.getMonth() === today.getMonth() &&
          current.getFullYear() === today.getFullYear()
        ),
        isCurrentMonth: current.getMonth() === currentDate.getMonth()
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day);
  };

  const handleCloseDayDetail = () => {
    setSelectedDay(null);
  };
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Calculate monthly stats
  const currentMonthTasks = tasks.filter(task => {
    if (!task.completed || !task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    return (
      completedDate.getMonth() === currentDate.getMonth() &&
      completedDate.getFullYear() === currentDate.getFullYear()
    );
  });
  
  const monthlyXP = currentMonthTasks.reduce((sum, task) => sum + task.points, 0);
  const activeDays = calendarDays.filter(day => day.tasks.length > 0 && day.isCurrentMonth).length;
  const bestDay = calendarDays.reduce((best, day) => 
    day.totalXP > best.totalXP ? day : best, 
    { totalXP: 0, tasks: [], date: new Date() }
  );
  
  // Get achievement medal
  const getAchievementMedal = (achievementId: string) => {
    const medals = {
      'first-task': '🥉',
      'task-5': '🎯',
      'task-master': '🏆',
      'task-25': '⭐',
      'task-50': '👑',
      'task-100': '🏅',
      'task-250': '💎',
      'task-500': '✨',
      'productive-day': '⚡',
      'super-productive-day': '⚡⚡',
      'mega-productive-day': '⚡⚡⚡',
      'streak-3': '🔥',
      'streak-7': '🌟',
      'streak-14': '📈',
      'streak-21': '🔄',
      'streak-30': '📅',
      'streak-45': '🎯',
      'streak-60': '💎',
      'streak-66': '👑',
      'streak-100': '🏆',
      'work-specialist': '💼',
      'health-guru': '❤️',
      'learning-enthusiast': '📚',
      'personal-champion': '👤',
      'high-priority-master': '⚠️',
      'balanced-achiever': '⚖️',
      'xp-500': '🪙',
      'xp-1000': '💰',
      'xp-2500': '💵',
      'xp-5000': '🏛️',
      'early-bird': '🌅',
      'night-owl': '🌙',
      'weekend-warrior': '📅',
      'recurring-master': '🔄'
    };
    return medals[achievementId as keyof typeof medals] || '🏅';
  };
  
  return (
    <div className="space-y-6 mb-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Level Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-md p-4 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-200 text-sm">CURRENT LEVEL</p>
              <h3 className="text-3xl font-bold mt-1">{stats.level}</h3>
              <div className="mt-2">
                <div className="text-xs flex justify-between mb-1">
                  <span>Progress</span>
                  <span>{levelProgress}%</span>
                </div>
                <div className="w-full h-2 bg-purple-900/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-1000 ease-out"
                    style={{ width: `${levelProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="relative">
              {stats.level >= 10 ? (
                <Star className="h-10 w-10 text-yellow-300" />
              ) : (
                <Star className="h-10 w-10 text-yellow-300" />
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <Medal className="h-2 w-2 text-yellow-800" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Points Card */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm">TOTAL POINTS</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalPoints} XP</h3>
              <p className="text-sm text-gray-500 mt-2">Lifetime points earned</p>
            </div>
            <TrendingUp className="h-10 w-10 text-teal-500" />
          </div>
        </div>
        
        {/* Tasks Card */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm">TASKS COMPLETED</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{completedTasks.length}</h3>
              <p className="text-sm text-gray-500 mt-2">
                {completionRate}% completion rate
              </p>
            </div>
            <CheckSquare className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        
        {/* Streak Card */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm">CURRENT STREAK</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.streak} days</h3>
              <p className="text-sm text-gray-500 mt-2">
                Keep it going!
              </p>
            </div>
            <div className={`h-10 w-10 flex items-center justify-center rounded-full relative ${stats.streak > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
              <Award className={`h-6 w-6 ${stats.streak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
              {stats.streak > 0 && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">🔥</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Accomplishment Calendar */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-purple-600" />
              Accomplishment Calendar
            </h3>
            <p className="text-gray-600 mt-1">Track your daily progress and build streaks • Click any day to see details</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="text-center min-w-[140px]">
              <h4 className="font-semibold text-lg text-gray-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h4>
            </div>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
            
            <button
              onClick={goToToday}
              className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
        
        {/* Monthly Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Monthly XP</p>
                <p className="text-2xl font-bold text-purple-700">{monthlyXP}</p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Active Days</p>
                <p className="text-2xl font-bold text-green-700">{activeDays}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Best Day</p>
                <p className="text-2xl font-bold text-yellow-700">{bestDay.totalXP} XP</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDayClick(day)}
              className={`
                relative p-2 min-h-[80px] border border-gray-100 transition-all duration-200 cursor-pointer
                ${day.isCurrentMonth ? 'bg-white hover:bg-purple-50' : 'bg-gray-50 hover:bg-gray-100'}
                ${day.isToday ? 'ring-2 ring-purple-500 bg-purple-50' : ''}
                ${day.tasks.length > 0 ? 'hover:shadow-md hover:scale-105' : ''}
              `}
              title={day.tasks.length > 0 ? `Click to see ${day.tasks.length} completed task${day.tasks.length !== 1 ? 's' : ''}` : 'No tasks completed'}
            >
              <div className={`
                text-sm font-medium mb-1
                ${day.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}
                ${day.isToday ? 'text-purple-700' : ''}
              `}>
                {day.date.getDate()}
              </div>
              
              {day.tasks.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {day.tasks.length} task{day.tasks.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs font-medium text-purple-600">
                      {day.totalXP} XP
                    </span>
                  </div>
                  
                  {/* Task indicators */}
                  <div className="flex flex-wrap gap-1">
                    {day.tasks.slice(0, 3).map((task, taskIndex) => (
                      <div
                        key={taskIndex}
                        className={`
                          w-2 h-2 rounded-full
                          ${task.priority === 'high' ? 'bg-red-400' : 
                            task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}
                        `}
                        title={task.title}
                      />
                    ))}
                    {day.tasks.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{day.tasks.length - 3}
                      </div>
                    )}
                  </div>
                  
                  {/* XP bar */}
                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ 
                        width: `${Math.min((day.totalXP / Math.max(bestDay.totalXP, 20)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Low Priority</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            <span>XP Progress</span>
          </div>
          <div className="flex items-center gap-1 text-purple-600 font-medium">
            <span>💡 Click any day to see task details</span>
          </div>
        </div>
      </div>
      
      {/* Enhanced Achievements section with filtering */}
      <div className="bg-white rounded-lg shadow-md p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <Award className="h-5 w-5 mr-2 text-purple-600" />
              Achievements & Medals
            </h3>
            <p className="text-gray-600 mt-1">
              {unlockedAchievements.length} of {achievements.length} achievements unlocked
            </p>
          </div>
          
          {/* Achievement Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500 font-medium">Filter:</span>
            </div>
            
            {/* Category Filter */}
            <select
              value={achievementFilter}
              onChange={(e) => setAchievementFilter(e.target.value)}
              className="rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-sm py-2 px-3 font-medium bg-white"
            >
              {achievementCategories.map(category => (
                <option key={category} value={category}>
                  {getCategoryDisplayName(category)}
                </option>
              ))}
            </select>
            
            {/* Unlocked Only Toggle */}
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showUnlockedOnly}
                  onChange={() => setShowUnlockedOnly(!showUnlockedOnly)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 transition-all duration-300 ${showUnlockedOnly ? 'bg-purple-500 border-purple-500' : 'border-gray-300 group-hover:border-purple-400'}`}>
                  {showUnlockedOnly && (
                    <CheckCircle className="h-3 w-3 text-white absolute top-0.5 left-0.5" />
                  )}
                </div>
              </div>
              <span className="font-medium">Unlocked only</span>
            </label>
          </div>
        </div>
        
        {/* Active filters display */}
        {(achievementFilter !== 'all' || showUnlockedOnly) && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Active filters:</span>
            
            {achievementFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                {getCategoryDisplayName(achievementFilter)}
                <button
                  onClick={() => setAchievementFilter('all')}
                  className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {showUnlockedOnly && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                Unlocked only
                <button
                  onClick={() => setShowUnlockedOnly(false)}
                  className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            <button
              onClick={() => {
                setAchievementFilter('all');
                setShowUnlockedOnly(false);
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
        
        {/* Filtered results summary */}
        {filteredAchievements.length !== achievements.length && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700 font-medium">
                Showing {filteredAchievements.length} of {achievements.length} achievements
              </span>
              <span className="text-blue-600">
                {filteredAchievements.filter(a => a.unlocked).length} unlocked
              </span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map(achievement => (
            <div 
              key={achievement.id}
              className={`
                border rounded-lg p-4 transition-all duration-300 relative overflow-hidden
                ${achievement.unlocked 
                  ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md' 
                  : 'border-gray-200 bg-gray-50 opacity-70'}
              `}
            >
              {/* Category badge */}
              <div className="absolute top-2 right-2">
                <span className={`
                  text-xs px-2 py-1 rounded-full font-medium border
                  ${getCategoryColor(achievement.category)}
                `}>
                  {getCategoryDisplayName(achievement.category)}
                </span>
              </div>
              
              {/* Medal overlay for unlocked achievements */}
              {achievement.unlocked && (
                <div className="absolute top-2 left-2 text-2xl animate-pulse">
                  {getAchievementMedal(achievement.id)}
                </div>
              )}
              
              <div className="flex items-center gap-3 mt-6">
                <div className={`
                  h-12 w-12 rounded-full flex items-center justify-center relative
                  ${achievement.unlocked ? 'bg-purple-100' : 'bg-gray-100'}
                `}>
                  <Award className={`h-6 w-6 ${achievement.unlocked ? 'text-purple-600' : 'text-gray-400'}`} />
                  {achievement.unlocked && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Medal className="h-2 w-2 text-yellow-800" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    {achievement.name}
                    {achievement.unlocked && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                        EARNED
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Progress</span>
                  <span>{achievement.currentValue}/{achievement.requiredValue}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ease-out ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                        : 'bg-gray-400'
                    }`}
                    style={{ width: `${Math.min((achievement.currentValue / achievement.requiredValue) * 100, 100)}%` }}
                  ></div>
                </div>
                {achievement.unlocked && (
                  <p className="text-xs text-purple-600 font-medium mt-1">
                    🎉 Achievement unlocked! Well done!
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {filteredAchievements.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">No achievements found</h4>
            <p className="text-gray-600">
              {showUnlockedOnly 
                ? "You haven't unlocked any achievements in this category yet. Keep working towards your goals!"
                : "No achievements match your current filters. Try adjusting your filter settings."}
            </p>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-4 py-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            <p className="text-purple-700 font-medium">
              You've earned {unlockedAchievements.length} of {achievements.length} medals
            </p>
          </div>
          {achievements.some(a => a.category === 'streak' && a.id === 'streak-66') && (
            <p className="text-sm text-gray-600 mt-2">
              🎯 Work towards the 66-day streak to master habit formation!
            </p>
          )}
        </div>
      </div>

      {/* Calendar Day Detail Popup */}
      <CalendarDayDetail 
        day={selectedDay} 
        onClose={handleCloseDayDetail} 
      />
    </div>
  );
};

export default Dashboard;