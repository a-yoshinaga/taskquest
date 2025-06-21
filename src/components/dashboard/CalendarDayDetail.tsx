import React from 'react';
import { X, CheckCircle, Clock, Flag, Sparkles, Calendar, Trophy, Target } from 'lucide-react';
import { CalendarDay, Task } from '../../types';

interface CalendarDayDetailProps {
  day: CalendarDay | null;
  onClose: () => void;
}

const CalendarDayDetail: React.FC<CalendarDayDetailProps> = ({ day, onClose }) => {
  if (!day) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-500 bg-green-50 border-green-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'personal': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'health': return 'bg-green-100 text-green-800 border-green-200';
      case 'education': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Group tasks by category
  const tasksByCategory = day.tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const categories = Object.keys(tasksByCategory).sort();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{formatDate(day.date)}</h2>
              <p className="text-purple-100 mt-1">
                {day.isToday ? 'Today' : 'Daily Accomplishments'}
              </p>
            </div>
          </div>
          
          {/* Day Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{day.tasks.length}</div>
              <div className="text-sm text-purple-200">Tasks Completed</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                <Sparkles className="h-5 w-5" />
                {day.totalXP}
              </div>
              <div className="text-sm text-purple-200">XP Earned</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="text-sm text-purple-200">Categories</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {day.tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Tasks Completed</h3>
              <p className="text-gray-600">
                {day.isToday 
                  ? "You haven't completed any tasks today yet. Time to get started!" 
                  : "No tasks were completed on this day."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Achievement Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Daily Achievement</h3>
                      <p className="text-sm text-gray-600">
                        {day.isToday ? "Today's progress" : "What you accomplished"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">+{day.totalXP} XP</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Total Earned</div>
                  </div>
                </div>
              </div>

              {/* Tasks by Category */}
              {categories.map((category, index) => {
                const categoryTasks = tasksByCategory[category];
                const categoryXP = categoryTasks.reduce((sum, task) => sum + task.points, 0);
                
                return (
                  <div 
                    key={category}
                    className="animate-slideIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold text-gray-800 capitalize">{category}</h4>
                        <span className={`
                          text-xs px-2 py-1 rounded-full font-medium border
                          ${getCategoryColor(category)}
                        `}>
                          {categoryTasks.length} task{categoryTasks.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-purple-600 font-medium">
                        <Sparkles className="h-4 w-4" />
                        <span>{categoryXP} XP</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {categoryTasks
                        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
                        .map((task, taskIndex) => (
                        <div 
                          key={task.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 animate-slideIn"
                          style={{ animationDelay: `${(index * 100) + (taskIndex * 50)}ms` }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <CheckCircle className="h-5 w-5 text-teal-500" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-800 mb-1">{task.title}</h5>
                                  {task.description && (
                                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                  )}
                                  
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>Completed at {formatTime(task.completedAt!)}</span>
                                    </div>
                                    
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                                      <Flag className="h-3 w-3" />
                                      <span className="capitalize font-medium">{task.priority} Priority</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-right flex-shrink-0">
                                  <div className="text-lg font-bold text-purple-600">+{task.points}</div>
                                  <div className="text-xs text-gray-500 uppercase tracking-wide">XP</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Timeline Summary */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  Completion Timeline
                </h4>
                <div className="space-y-2">
                  {day.tasks
                    .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())
                    .map((task, index) => (
                    <div key={task.id} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-600 font-medium min-w-[80px]">
                        {formatTime(task.completedAt!)}
                      </span>
                      <span className="text-gray-800">{task.title}</span>
                      <span className="text-purple-600 font-medium ml-auto">+{task.points} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {day.isToday ? "Keep up the great work!" : "Great job on this productive day!"}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarDayDetail;