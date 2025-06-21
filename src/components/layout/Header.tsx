import React, { useState, useRef, useEffect } from 'react';
import { CheckSquare, Award, Flame, LogOut, User, Crown, Settings, Edit, Check, Trash2, X, Target } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../lib/supabase';

const Header: React.FC = () => {
  const { stats, levelProgress, pointsToNextLevel } = useGame();
  const { user, userProfile, signOut, refreshProfile } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  // Get display name from user profile
  const displayName = userProfile?.display_name || user?.email?.split('@')[0] || 'User';
  
  // Get app title from user profile or default to TaskQuest
  const appTitle = userProfile?.app_title || 'TaskQuest';
  
  // Initialize temp values when profile changes
  useEffect(() => {
    setTempName(displayName);
    setTempTitle(appTitle);
  }, [displayName, appTitle]);
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);
  
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
        // Cancel editing if clicking outside
        if (isEditingName) {
          setIsEditingName(false);
          setTempName(displayName);
        }
        if (isEditingTitle) {
          setIsEditingTitle(false);
          setTempTitle(appTitle);
        }
      }
    };
    
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu, isEditingName, isEditingTitle, displayName, appTitle]);
  
  const handleSignOut = async () => {
    setShowSignOutConfirm(false);
    setShowProfileMenu(false);
    await signOut();
  };

  const handleResetData = async () => {
    if (resetConfirmText !== 'delete all') {
      return;
    }

    try {
      // Clear Supabase data if user is authenticated
      if (user) {
        const { supabase } = await import('../../lib/supabase');
        
        // Delete all user data from Supabase
        await Promise.all([
          supabase.from('tasks').delete().eq('user_id', user.id),
          supabase.from('game_stats').delete().eq('user_id', user.id),
          supabase.from('user_achievements').delete().eq('user_id', user.id)
        ]);
      }

      // Close modals and reset form
      setShowResetConfirm(false);
      setShowProfileMenu(false);
      setResetConfirmText('');

      // Reload the page to reset all contexts
      window.location.reload();
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Failed to reset data. Please try again.');
    }
  };
  
  const handleStartEditingName = () => {
    setTempName(displayName);
    setIsEditingName(true);
  };
  
  const handleSaveName = async () => {
    if (!tempName.trim() || !user) {
      return;
    }

    setIsSavingName(true);
    
    try {
      console.log('Updating display name to:', tempName.trim());
      
      // Update user profile in our custom table
      const { data, error } = await updateUserProfile(user.id, {
        display_name: tempName.trim()
      });

      if (error) {
        console.error('Error updating display name:', error);
        alert('Failed to save display name. Please try again.');
        return;
      }

      console.log('Display name update response:', data);

      // Refresh the profile to get updated data
      await refreshProfile();
      setIsEditingName(false);
      
      console.log('Display name updated successfully');
    } catch (error) {
      console.error('Error updating display name:', error);
      alert('Failed to save display name. Please try again.');
    } finally {
      setIsSavingName(false);
    }
  };
  
  const handleCancelEditName = () => {
    setTempName(displayName);
    setIsEditingName(false);
  };
  
  const handleStartEditingTitle = () => {
    setTempTitle(appTitle);
    setIsEditingTitle(true);
  };
  
  const handleSaveTitle = async () => {
    if (!user) {
      return;
    }

    setIsSavingTitle(true);
    
    try {
      console.log('Updating app title to:', tempTitle.trim() || 'TaskQuest');
      
      // Update user profile in our custom table
      const { data, error } = await updateUserProfile(user.id, {
        app_title: tempTitle.trim() || null // Use null for empty string to reset to default
      });

      if (error) {
        console.error('Error updating app title:', error);
        alert('Failed to save app title. Please try again.');
        return;
      }

      console.log('App title update response:', data);

      // Refresh the profile to get updated data
      await refreshProfile();
      setIsEditingTitle(false);
      
      console.log('App title updated successfully');
    } catch (error) {
      console.error('Error updating app title:', error);
      alert('Failed to save app title. Please try again.');
    } finally {
      setIsSavingTitle(false);
    }
  };
  
  const handleCancelEditTitle = () => {
    setTempTitle(appTitle);
    setIsEditingTitle(false);
  };
  
  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEditName();
    }
  };
  
  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEditTitle();
    }
  };
  
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
              
              {/* Profile Menu Button */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
                  title="Profile Menu"
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center border-2 border-purple-300">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
                  </div>
                  <Settings className={`h-4 w-4 text-purple-200 transition-transform duration-200 ${showProfileMenu ? 'rotate-90' : ''}`} />
                </button>
                
                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-scaleIn">
                    <div className="p-6">
                      {/* Profile Header */}
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="relative group">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-4 border-purple-200 group-hover:border-purple-300 transition-colors">
                            <User className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          {isEditingName ? (
                            <div className="space-y-3">
                              <input
                                ref={nameInputRef}
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onKeyDown={handleNameKeyPress}
                                className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-800 font-medium"
                                placeholder="Enter your name"
                                maxLength={50}
                                disabled={isSavingName}
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleSaveName}
                                  disabled={!tempName.trim() || isSavingName}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                  {isSavingName ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                  {isSavingName ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={handleCancelEditName}
                                  disabled={isSavingName}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
                                >
                                  <X className="h-3 w-3" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center space-x-2 group">
                                <h3 className="text-lg font-bold text-gray-800">{displayName}</h3>
                                <button
                                  onClick={handleStartEditingName}
                                  className="p-1 text-gray-400 hover:text-purple-600 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Edit name"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-600">{user?.email}</p>
                              <div className="flex items-center space-x-1 mt-1">
                                {stats.level >= 10 ? (
                                  <Crown className="h-4 w-4 text-yellow-500" />
                                ) : (
                                  <Award className="h-4 w-4 text-purple-500" />
                                )}
                                <span className="text-sm font-medium text-purple-600">
                                  Level {stats.level} {levelNickname}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* App Title Customization */}
                      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-purple-700">Your Quest Focus</span>
                        </div>
                        
                        {isEditingTitle ? (
                          <div className="space-y-3">
                            <input
                              ref={titleInputRef}
                              type="text"
                              value={tempTitle}
                              onChange={(e) => setTempTitle(e.target.value)}
                              onKeyDown={handleTitleKeyPress}
                              className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-800 font-medium"
                              placeholder="Enter your quest focus (e.g., 'Fitness Journey', 'Study Goals')"
                              maxLength={30}
                              disabled={isSavingTitle}
                            />
                            <div className="text-xs text-gray-500 mb-2">
                              This will replace "TaskQuest" in the header. Leave empty to use default.
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSaveTitle}
                                disabled={isSavingTitle}
                                className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              >
                                {isSavingTitle ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                                {isSavingTitle ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={handleCancelEditTitle}
                                disabled={isSavingTitle}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
                              >
                                <X className="h-3 w-3" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between group">
                              <div>
                                <div className="font-medium text-gray-800">
                                  {appTitle === 'TaskQuest' ? 'TaskQuest (Default)' : appTitle}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {appTitle === 'TaskQuest' 
                                    ? 'Click to customize your quest focus' 
                                    : 'Your personalized quest title'}
                                </div>
                              </div>
                              <button
                                onClick={handleStartEditingTitle}
                                className="p-1 text-gray-400 hover:text-purple-600 transition-colors opacity-0 group-hover:opacity-100"
                                title="Edit quest focus"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Profile Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center border border-purple-200">
                          <div className="text-2xl font-bold text-purple-600">{stats.totalPoints}</div>
                          <div className="text-xs text-purple-500 uppercase tracking-wide font-medium">Total XP</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 text-center border border-orange-200">
                          <div className="text-2xl font-bold text-orange-600">{stats.streak}</div>
                          <div className="text-xs text-orange-500 uppercase tracking-wide font-medium">Day Streak</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center border border-green-200">
                          <div className="text-2xl font-bold text-green-600">{stats.tasksCompleted}</div>
                          <div className="text-xs text-green-500 uppercase tracking-wide font-medium">Tasks Done</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600">{stats.level}</div>
                          <div className="text-xs text-blue-500 uppercase tracking-wide font-medium">Level</div>
                        </div>
                      </div>
                      
                      {/* Profile Picture Feature Notice */}
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-800 mb-1">Profile Pictures</h4>
                            <p className="text-sm text-blue-700">
                              Profile picture upload will be added as a future feature if there's user demand. 
                              For now, enjoy the default avatar!
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Reset Data Button */}
                      <button
                        onClick={() => setShowResetConfirm(true)}
                        className="flex items-center justify-center space-x-2 w-full p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg mb-3 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Reset All Data</span>
                      </button>
                      
                      {/* Sign Out Button */}
                      <button
                        onClick={() => setShowSignOutConfirm(true)}
                        className="flex items-center justify-center space-x-2 w-full p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
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
      
      {/* Reset Data Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scaleIn">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Reset All Data
              </h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete all your tasks, progress, achievements, and game stats. This action cannot be undone.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type "delete all" to confirm:
                </label>
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-800"
                  placeholder="delete all"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    setResetConfirmText('');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetData}
                  disabled={resetConfirmText !== 'delete all'}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl focus:outline-none focus:ring-4 focus:ring-red-200 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Yes, Reset All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scaleIn">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Sign Out Confirmation
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to sign out? Your progress is automatically saved, but you'll need to sign back in to continue your quest.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl focus:outline-none focus:ring-4 focus:ring-red-200 transition-all duration-300 font-medium"
                >
                  Yes, Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;