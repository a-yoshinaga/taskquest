import React, { ReactNode, useState, useEffect } from 'react';
import Header from './Header';
import ConnectionStatus from './ConnectionStatus';
import Notifications from '../notifications/Notifications';
import RecurringTaskNotifications from '../notifications/RecurringTaskNotifications';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import { useRecurringTaskManager } from '../../hooks/useRecurringTaskManager';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { notifications, dismissNotification, dismissAllNotifications } = useRecurringTaskManager();
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Log when recurring task notifications are triggered
  useEffect(() => {
    if (notifications.length > 0) {
      console.log(`Recurring task manager triggered ${notifications.length} notifications`);
    }
  }, [notifications]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            {/* Hackathon Disclaimer */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-orange-600 text-lg">⚠️</span>
                <h3 className="font-bold text-orange-800">Hackathon Project Notice</h3>
              </div>
              <p className="text-orange-700 text-sm leading-relaxed">
                This application is developed for hackathon purposes and may be discontinued suddenly. 
                Please do not input important personal information.
              </p>
            </div>
            
            {/* Links */}
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600">
              <span>© 2025 Atsushi Yoshinaga</span>
              <span className="text-gray-400">•</span>
              <a 
                href="mailto:a.yoshinaga0314@gmail.com" 
                className="hover:text-purple-600 transition-colors font-medium"
              >
                Contact
              </a>
              <span className="text-gray-400">•</span>
              <button
                onClick={() => setShowPrivacyPolicy(true)}
                className="hover:text-purple-600 transition-colors font-medium underline"
              >
                Privacy Policy
              </button>
            </div>
            
            {/* Powered by Bolt.new */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="text-xs text-gray-500">Powered by</span>
              <a
                href="https://bolt.new/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-transform duration-300 hover:scale-110"
                title="Powered by Bolt.new"
              >
                <img
                  src="/black_circle_360x360.png"
                  alt="Powered by Bolt.new"
                  className="w-6 h-6 rounded-full shadow-sm hover:shadow-md transition-shadow duration-300"
                />
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      <ConnectionStatus />
      <Notifications />
      <RecurringTaskNotifications 
        notifications={notifications}
        onDismiss={dismissNotification}
        onDismissAll={dismissAllNotifications}
      />
      
      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal 
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
    </div>
  );
};

export default Layout;