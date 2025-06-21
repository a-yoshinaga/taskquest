import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { checkSupabaseHealth } from '../../utils/supabaseStorage';
import { useAuth } from '../../contexts/AuthContext';

const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [supabaseHealthy, setSupabaseHealthy] = useState<boolean | null>(null);
  const [showStatus, setShowStatus] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);
  const { user } = useAuth();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkHealth = async () => {
      // Prevent too frequent checks
      const now = Date.now();
      if (now - lastCheckTime < 30000) { // 30 seconds minimum between checks
        return;
      }
      
      if (user && isOnline && !isChecking) {
        setIsChecking(true);
        setLastCheckTime(now);
        
        try {
          console.log('Performing health check...');
          const result = await checkSupabaseHealth();
          setSupabaseHealthy(result.success);
          
          if (!result.success) {
            console.error('Health check failed:', result.error);
          } else {
            console.log('Health check passed');
          }
        } catch (error) {
          console.error('Health check error:', error);
          setSupabaseHealthy(false);
        } finally {
          setIsChecking(false);
        }
      } else if (!user || !isOnline) {
        setSupabaseHealthy(null);
      }
    };

    // Initial check with delay to avoid conflicts with login
    const timeoutId = setTimeout(() => {
      checkHealth();
    }, 2000);
    
    // Periodic check every 60 seconds if user is authenticated and online
    const interval = user && isOnline ? setInterval(checkHealth, 60000) : null;
    
    return () => {
      clearTimeout(timeoutId);
      if (interval) clearInterval(interval);
    };
  }, [user, isOnline, isChecking, lastCheckTime]);

  // Only show status for offline - don't show sync issues
  useEffect(() => {
    setShowStatus(!isOnline);
  }, [isOnline]);

  if (!showStatus) return null;

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: <WifiOff className="h-4 w-4" />,
        text: 'Offline',
        color: 'bg-red-500',
        description: 'No internet connection. Working in offline mode.'
      };
    }
    
    // Don't show sync issues to users - they don't need to know about this
    return {
      icon: <Wifi className="h-4 w-4" />,
      text: 'Online',
      color: 'bg-green-500',
      description: 'Connected to internet.'
    };
  };

  const status = getStatusInfo();

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className={`
        ${status.color} text-white px-3 py-2 rounded-lg shadow-lg
        flex items-center gap-2 text-sm font-medium
        animate-slideIn
      `}>
        {status.icon}
        <span>{status.text}</span>
      </div>
      
      {/* Detailed tooltip on hover */}
      <div className="absolute bottom-full left-0 mb-2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
          {status.description}
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;