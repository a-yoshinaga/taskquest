import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, handleSupabaseError, getUserProfile } from '../lib/supabase';

interface UserProfile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  app_title?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load user profile when user changes
  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading user profile for:', userId);
      const profile = await getUserProfile(userId);
      console.log('Loaded user profile:', profile);
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setUserProfile(null);
    }
  };

  // Force clear all auth state
  const clearAuthState = () => {
    console.log('Clearing all auth state...');
    setSession(null);
    setUser(null);
    setUserProfile(null);
    setLoading(false);
  };

  // Clear stored tokens and data
  const clearStoredData = () => {
    try {
      console.log('Clearing stored auth data...');
      
      // Clear localStorage
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      // Clear all Supabase auth keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          sessionStorage.removeItem(key);
        }
      });
      
      console.log('Stored auth data cleared');
    } catch (e) {
      console.warn('Failed to clear some stored tokens:', e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // Get initial session with better error handling
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Add a small delay to ensure Supabase is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.warn('Failed to get initial session:', error);
          clearAuthState();
          setIsInitialized(true);
          return;
        }
        
        console.log('Initial session loaded:', session?.user?.id || 'no session');
        setSession(session);
        setUser(session?.user ?? null);
        
        // Load user profile if user exists
        if (session?.user?.id) {
          await loadUserProfile(session.user.id);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.warn('Auth initialization failed:', error);
        if (isMounted) {
          clearAuthState();
          setIsInitialized(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with improved handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      console.log('Auth state changed:', event, session?.user?.id || 'no session');
      
      // Add a small delay to prevent rapid state changes
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Load user profile for authenticated users
      if (session?.user?.id) {
        // Add delay before loading profile to prevent connection conflicts
        setTimeout(() => {
          if (isMounted) {
            loadUserProfile(session.user.id);
          }
        }, 200);
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshSession = async () => {
    try {
      console.log('Manually refreshing session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      
      console.log('Session refreshed:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Refresh user profile
      if (session?.user?.id) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Exception refreshing session:', error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await loadUserProfile(user.id);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error };
    } catch (error) {
      const handledError = handleSupabaseError(error, 'sign up');
      return { error: handledError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setLoading(false);
      }
      // Don't set loading to false here - let the auth state change handler do it
      
      return { error };
    } catch (error) {
      setLoading(false);
      const handledError = handleSupabaseError(error, 'sign in');
      return { error: handledError };
    }
  };

  const signOut = async () => {
    console.log('Starting sign out process...');
    
    // ALWAYS clear local state first, regardless of server response
    clearAuthState();
    clearStoredData();
    
    // Try to sign out from server, but don't wait for it or let it block the logout
    const signOutFromServer = async () => {
      try {
        console.log('Attempting server sign out...');
        
        // Set a very short timeout for server sign out
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('Server sign out timeout, proceeding with local logout');
          controller.abort();
        }, 2000); // Only 2 seconds timeout
        
        const { error } = await supabase.auth.signOut();
        clearTimeout(timeoutId);
        
        if (error) {
          console.warn('Server sign out error (already logged out locally):', error);
        } else {
          console.log('Server sign out successful');
        }
      } catch (error) {
        console.warn('Server sign out failed (already logged out locally):', error);
      }
    };
    
    // Start server sign out but don't wait for it
    signOutFromServer();
    
    console.log('Local sign out completed - user should be logged out');
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      const handledError = handleSupabaseError(error, 'reset password');
      return { error: handledError };
    }
  };

  const value = {
    user,
    userProfile,
    session,
    loading: loading || !isInitialized,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshSession,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};