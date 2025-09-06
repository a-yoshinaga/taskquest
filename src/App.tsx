import React, { useState } from 'react';
import { Layout, List, Columns } from 'lucide-react';
import { TaskProvider } from './contexts/TaskContext';
import { GameProvider } from './contexts/GameContext';
import AppLayout from './components/layout/Layout';
import TaskList from './components/task/TaskList';
import KanbanBoard from './components/task/KanbanBoard';
import Dashboard from './components/dashboard/Dashboard';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'board' | 'dashboard'>('tasks');

  return (
    <GameProvider>
      <TaskProvider>
        <AppLayout>
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
    <AppContent />
  );
}

export default App;