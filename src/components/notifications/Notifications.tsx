import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { Award, Zap, Star, X, Crown, Sparkles, Trophy, Medal } from 'lucide-react';

const Notifications: React.FC = () => {
  const { notifications, dismissNotification } = useGame();
  
  if (notifications.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 space-y-3 z-50 max-w-sm">
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className={`
            p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-slideIn relative overflow-hidden border-2
            ${notification.type === 'points' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-teal-300' : ''}
            ${notification.type === 'level' ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white border-yellow-300' : ''}
            ${notification.type === 'achievement' ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white border-purple-300' : ''}
            ${notification.type === 'streak' ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white border-orange-300' : ''}
          `}
        >
          {/* Enhanced background animations */}
          {notification.type === 'level' && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-300 opacity-30 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-200 to-orange-200 animate-pulse"></div>
            </>
          )}
          
          {notification.type === 'achievement' && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-200 to-pink-200 animate-pulse"></div>
            </>
          )}
          
          {/* Enhanced sparkle effects */}
          {(notification.type === 'achievement' || notification.type === 'level') && (
            <>
              <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full animate-ping"></div>
              <div className="absolute top-3 right-3 w-1 h-1 bg-white rounded-full animate-ping animation-delay-200"></div>
              <div className="absolute bottom-2 left-4 w-1 h-1 bg-white rounded-full animate-ping animation-delay-500"></div>
              <div className="absolute bottom-3 right-2 w-1 h-1 bg-white rounded-full animate-ping animation-delay-700"></div>
              <div className="absolute top-2 left-1/2 w-1 h-1 bg-white rounded-full animate-ping animation-delay-300"></div>
            </>
          )}
          
          <div className="relative z-10 flex items-start gap-3 flex-1">
            {/* Enhanced icons with medals */}
            {notification.type === 'points' && (
              <div className="relative">
                <Zap className="h-6 w-6 flex-shrink-0 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3">
                  <Sparkles className="h-3 w-3 text-cyan-200 animate-spin" />
                </div>
              </div>
            )}
            
            {notification.type === 'level' && (
              <div className="relative">
                {notification.level && notification.level >= 10 ? (
                  <Crown className="h-7 w-7 flex-shrink-0 animate-bounce text-yellow-200" />
                ) : (
                  <Star className="h-7 w-7 flex-shrink-0 animate-bounce text-yellow-200" />
                )}
                <div className="absolute -top-1 -right-1 w-4 h-4">
                  <Trophy className="h-4 w-4 text-yellow-200 animate-spin" />
                </div>
                {/* Medal overlay for level ups */}
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Medal className="h-2 w-2 text-yellow-800" />
                </div>
              </div>
            )}
            
            {notification.type === 'achievement' && (
              <div className="relative">
                <Award className="h-6 w-6 flex-shrink-0 text-yellow-200" />
                <div className="absolute -top-1 -right-1 w-3 h-3">
                  <Sparkles className="h-3 w-3 text-pink-200 animate-spin" />
                </div>
                {/* Medal overlay for achievements */}
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-purple-400 rounded-full flex items-center justify-center">
                  <Medal className="h-2 w-2 text-purple-800" />
                </div>
              </div>
            )}
            
            {notification.type === 'streak' && (
              <div className="relative">
                <Award className="h-6 w-6 flex-shrink-0 animate-pulse text-orange-200" />
                <div className="absolute inset-0 animate-ping">
                  <Award className="h-6 w-6 text-orange-300 opacity-75" />
                </div>
                {/* Flame medal for streaks */}
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">🔥</span>
                </div>
              </div>
            )}
            
            <div className="flex-1 relative z-10">
              <p className={`font-bold ${notification.type === 'level' ? 'text-lg' : 'text-base'}`}>
                {notification.message}
              </p>
              {notification.achievement && (
                <p className="text-sm opacity-90 mt-1 font-medium">{notification.achievement.description}</p>
              )}
              {notification.type === 'level' && notification.level && (
                <p className="text-sm opacity-90 mt-1 font-medium">
                  🎯 Keep completing tasks to reach even greater heights!
                </p>
              )}
              {notification.type === 'achievement' && (
                <p className="text-xs opacity-80 mt-1">
                  ✨ You're building incredible momentum!
                </p>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => dismissNotification(notification.id)}
            className="text-white/80 hover:text-white relative z-10 flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;