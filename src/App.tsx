import React, { useState, useEffect } from 'react';
import { Layout, List, Columns } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import { GameProvider } from './contexts/GameContext';
import { useAuth } from './contexts/AuthContext';
import { testSupabaseConnection } from './lib/supabase';
import AuthForm from './components/auth/AuthForm';
import PasswordResetForm from './components/auth/PasswordResetForm';
import AppLayout from './components/layout/Layout';
import TaskList from './components/task/TaskList';
import KanbanBoard from './components/task/KanbanBoard';
import Dashboard from './components/dashboard/Dashboard';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'tasks' | 'board' | 'dashboard'>('tasks');
  const [connectionTested, setConnectionTested] = useState(false);
  
  // Test Supabase connection on app start
  useEffect(() => {
    const testConnection = async () => {
      if (!connectionTested) {
        console.log('Testing Supabase connection on app start...');
        await testSupabaseConnection();
        setConnectionTested(true);
      }
    };
    
    testConnection();
  }, [connectionTested]);
  
  // Check if we're on the password reset page
  const isPasswordResetPage = window.location.pathname === '/reset-password' || 
                              window.location.hash.includes('type=recovery');
  
  if (isPasswordResetPage) {
    return <PasswordResetForm />;
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading TaskQuest...</p>
          {!connectionTested && (
            <p className="text-sm text-gray-500 mt-2">Testing connection...</p>
          )}
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <AuthForm />;
  }
  
  return (
    <GameProvider>
      <TaskProvider>
        <AppLayout>
          {/* Tabs */}
          <div className="flex border-b mb-6 pb-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`
                px-4 py-2 font-medium text-sm mr-2 rounded-t-lg transition-colors flex items-center whitespace-nowrap
                ${activeTab === 'tasks' 
                  ? 'text-purple-700 border-b-2 border-purple-600' 
                  : 'text-gray-600 hover:text-purple-600'}
              `}
            >
              <List className="h-4 w-4 mr-1" />
              My Tasks
            </button>
            <button
              onClick={() => setActiveTab('board')}
              className={`
                px-4 py-2 font-medium text-sm mr-2 rounded-t-lg transition-colors flex items-center whitespace-nowrap
                ${activeTab === 'board' 
                  ? 'text-purple-700 border-b-2 border-purple-600' 
                  : 'text-gray-600 hover:text-purple-600'}
              `}
            >
              <Columns className="h-4 w-4 mr-1" />
              Board View
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`
                px-4 py-2 font-medium text-sm rounded-t-lg flex items-center transition-colors whitespace-nowrap
                ${activeTab === 'dashboard' 
                  ? 'text-purple-700 border-b-2 border-purple-600' 
                  : 'text-gray-600 hover:text-purple-600'}
              `}
            >
              <Layout className="h-4 w-4 mr-1" />
              Dashboard
            </button>
          </div>
          
          {/* Main content */}
          {activeTab === 'tasks' && <TaskList />}
          {activeTab === 'board' && <KanbanBoard />}
          {activeTab === 'dashboard' && <Dashboard />}
        </AppLayout>
      </TaskProvider>
    </GameProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;