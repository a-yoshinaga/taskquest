import React from 'react';
import { CheckSquare, Award, Flame, Crown } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
 

const Header: React.FC = () => {
  const { stats, levelProgress, pointsToNextLevel } = useGame();
  const appTitle = 'TaskQuest';
  
  // Get level nickname
  const LEVEL_NICKNAMES = {
    1: "Novice Adventurer",
    2: "Task Apprentice", 
    3: "Productivity Warrior",
    4: "Quest Champion",
    5: "Habit Master",
    6: "Efficiency Expert",
    7: "Goal Crusher",
    8: "Achievement Legend",
    9: "Productivity Titan",
    10: "Grand Master",
    11: "Productivity Sage",
    12: "Ultimate Champion",
    15: "Productivity God",
    20: "Legendary Being"
  };
  
  const getLevelNickname = (level: number) => {
    const availableLevels = Object.keys(LEVEL_NICKNAMES).map(Number).sort((a, b) => b - a);
    const applicableLevel = availableLevels.find(l => level >= l) || 1;
    return LEVEL_NICKNAMES[applicableLevel as keyof typeof LEVEL_NICKNAMES];
  };
  
  const levelNickname = getLevelNickname(stats.level);
  
  return (
    <>
      <header className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-md z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-2 md:mb-0">
              <CheckSquare className="h-6 w-6 mr-2" />
              <h1 className="text-xl font-bold">{appTitle}</h1>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
              {/* Level indicator with nickname */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {stats.level >= 10 ? (
                    <Crown className="h-5 w-5 text-yellow-300" />
                  ) : (
                    <Award className="h-5 w-5 text-yellow-300" />
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-purple-200">LEVEL</span>
                    <span className="font-bold">{stats.level}</span>
                  </div>
                  <span className="text-xs text-yellow-300 font-medium">{levelNickname}</span>
                </div>
              </div>
              
              {/* XP/Points indicator */}
              <div className="flex flex-col">
                <div className="flex justify-between text-xs">
                  <span className="text-purple-200">XP</span>
                  <span className="text-purple-100">
                    {pointsToNextLevel > 0 ? `${pointsToNextLevel} to level ${stats.level + 1}` : 'Max level'}
                  </span>
                </div>
                <div className="w-36 h-2 bg-purple-900 rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-yellow-400 transition-all duration-1000 ease-out"
                    style={{ width: `${levelProgress}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Streak indicator */}
              <div className="flex items-center space-x-2">
                <Flame className={`h-5 w-5 ${stats.streak > 0 ? 'text-orange-400' : 'text-gray-400'}`} />
                <div className="flex flex-col">
                  <span className="text-xs text-purple-200">STREAK</span>
                  <span className="font-bold">{stats.streak} days</span>
                </div>
              </div>
              
              {/* Bolt.new Hackathon Badge */}
              <div className="hidden md:block">
                <a
                  href="https://bolt.new/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition-transform duration-300 hover:scale-110"
                  title="Powered by Bolt.new"
                >
                  <img
                    src="/black_circle_360x360.png"
                    alt="Powered by Bolt.new"
                    className="w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
                  />
                </a>
              </div>
      
            </div>
          </div>
          
          {/* Mobile Bolt.new Badge */}
          <div className="md:hidden flex justify-center mt-3">
            <a
              href="https://bolt.new/"
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-transform duration-300 hover:scale-110"
              title="Powered by Bolt.new"
            >
              <img
                src="/black_circle_360x360.png"
                alt="Powered by Bolt.new"
                className="w-8 h-8 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
            </a>
          </div>
        </div>
      </header>
      
    </>
  );
};

export default Header;