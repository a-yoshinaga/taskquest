import React, { useState, useEffect } from 'react';
import { X, Calendar, Target, Sparkles, CheckCircle, Flame, Trophy, Star } from 'lucide-react';
import { Task } from '../../types';

interface RecurringTaskNotification {
  id: string;
  type: 'new_recurring' | 'streak_milestone' | 'habit_reminder' | 'completion_celebration';
  task: Task;
  message: string;
  submessage?: string;
  daysLeft?: number;
  streakCount?: number;
}

interface RecurringTaskNotificationsProps {
  notifications: RecurringTaskNotification[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}

const RecurringTaskNotifications: React.FC<RecurringTaskNotificationsProps> = ({
  notifications,
  onDismiss,
  onDismissAll
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(notifications.length > 0);

  useEffect(() => {
    setIsVisible(notifications.length > 0);
    setCurrentIndex(0);
  }, [notifications]);

  if (!isVisible || notifications.length === 0) return null;

  const currentNotification = notifications[currentIndex];
  const hasMultiple = notifications.length > 1;

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_recurring':
        return <Calendar className="h-8 w-8 text-blue-500" />;
      case 'streak_milestone':
        return <Flame className="h-8 w-8 text-orange-500" />;
      case 'habit_reminder':
        return <Target className="h-8 w-8 text-purple-500" />;
      case 'completion_celebration':
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      default:
        return <Sparkles className="h-8 w-8 text-purple-500" />;
    }
  };

  const getBackgroundGradient = (type: string) => {
    switch (type) {
      case 'new_recurring':
        return 'from-blue-500 to-cyan-500';
      case 'streak_milestone':
        return 'from-orange-500 to-red-500';
      case 'habit_reminder':
        return 'from-purple-500 to-pink-500';
      case 'completion_celebration':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  const handleNext = () => {
    if (currentIndex < notifications.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onDismissAll();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDismissCurrent = () => {
    onDismiss(currentNotification.id);
    if (notifications.length === 1) {
      setIsVisible(false);
    } else if (currentIndex === notifications.length - 1) {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
        {/* Header with gradient background */}
        <div className={`bg-gradient-to-r ${getBackgroundGradient(currentNotification.type)} text-white p-6 relative`}>
          {/* Close button */}
          <button
            onClick={() => onDismissAll()}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Notification counter */}
          {hasMultiple && (
            <div className="absolute top-4 left-4 bg-white/20 rounded-full px-3 py-1">
              <span className="text-sm font-medium">
                {currentIndex + 1} of {notifications.length}
              </span>
            </div>
          )}

          {/* Icon and title */}
          <div className="flex items-center justify-center mb-4 mt-8">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              {getIcon(currentNotification.type)}
            </div>
          </div>

          <h3 className="text-xl font-bold text-center mb-2">
            {currentNotification.message}
          </h3>
          
          {currentNotification.submessage && (
            <p className="text-white/90 text-center text-sm">
              {currentNotification.submessage}
            </p>
          )}

          {/* Sparkle effects */}
          <div className="absolute top-2 left-8 w-1 h-1 bg-white rounded-full animate-ping"></div>
          <div className="absolute top-6 right-12 w-1 h-1 bg-white rounded-full animate-ping animation-delay-200"></div>
          <div className="absolute bottom-4 left-6 w-1 h-1 bg-white rounded-full animate-ping animation-delay-500"></div>
          <div className="absolute bottom-2 right-8 w-1 h-1 bg-white rounded-full animate-ping animation-delay-700"></div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Task details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {currentNotification.task.title}
            </h4>
            
            {currentNotification.task.description && (
              <p className="text-sm text-gray-600 mb-3">
                {currentNotification.task.description}
              </p>
            )}

            {/* Recurring info */}
            {currentNotification.task.recurring && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="font-bold text-purple-600">
                    {currentNotification.task.recurring.completedRepetitions || 0}/
                    {currentNotification.task.recurring.totalRepetitions || 0}
                  </div>
                  <div className="text-gray-500">Progress</div>
                </div>
                
                {currentNotification.daysLeft !== undefined && (
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="font-bold text-blue-600">
                      {currentNotification.daysLeft}
                    </div>
                    <div className="text-gray-500">Days Left</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Motivational content based on type */}
          {currentNotification.type === 'new_recurring' && (
            <div className="text-center mb-6">
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-gray-700 font-medium">
                Your recurring habit is ready for today!
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Consistency is the key to building lasting habits
              </p>
            </div>
          )}

          {currentNotification.type === 'streak_milestone' && (
            <div className="text-center mb-6">
              <div className="text-2xl mb-2">🔥</div>
              <p className="text-gray-700 font-medium">
                {currentNotification.streakCount} day streak!
              </p>
              <p className="text-sm text-gray-500 mt-1">
                You're building incredible momentum!
              </p>
            </div>
          )}

          {currentNotification.type === 'habit_reminder' && (
            <div className="text-center mb-6">
              <div className="text-2xl mb-2">💪</div>
              <p className="text-gray-700 font-medium">
                Don't break the chain!
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Every day you complete this habit, you're getting stronger
              </p>
            </div>
          )}

          {currentNotification.type === 'completion_celebration' && (
            <div className="text-center mb-6">
              <div className="text-2xl mb-2">🎉</div>
              <p className="text-gray-700 font-medium">
                Habit completed successfully!
              </p>
              <p className="text-sm text-gray-500 mt-1">
                You've proven that consistency pays off!
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {hasMultiple && currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
              >
                Previous
              </button>
            )}
            
            <button
              onClick={handleDismissCurrent}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
            >
              Dismiss
            </button>
            
            <button
              onClick={handleNext}
              className={`flex-1 px-4 py-3 bg-gradient-to-r ${getBackgroundGradient(currentNotification.type)} text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium`}
            >
              {currentIndex < notifications.length - 1 ? 'Next' : 'Got it!'}
            </button>
          </div>

          {/* Progress dots for multiple notifications */}
          {hasMultiple && (
            <div className="flex justify-center mt-4 gap-2">
              {notifications.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-purple-500 w-6' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecurringTaskNotifications;