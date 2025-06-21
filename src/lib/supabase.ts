import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced validation with better error messages
const validateEnvironmentVariables = () => {
  const errors = [];
  
  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is missing');
  } else if (!supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must start with https://');
  } else if (!supabaseUrl.includes('.supabase.co')) {
    errors.push('VITE_SUPABASE_URL must be a valid Supabase URL');
  }
  
  if (!supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is missing');
  } else if (supabaseAnonKey.length < 100) {
    errors.push('VITE_SUPABASE_ANON_KEY appears to be invalid (too short)');
  }
  
  if (errors.length > 0) {
    console.error('Supabase configuration errors:');
    errors.forEach(error => console.error(`- ${error}`));
    console.error('Please check your .env file and ensure Supabase is properly configured.');
    console.error('You may need to click "Connect to Supabase" in the top right corner.');
    throw new Error(`Supabase configuration invalid: ${errors.join(', ')}`);
  }
};

// Validate environment variables
validateEnvironmentVariables();

// Enhanced Supabase client with better configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-application-name': 'TaskQuest'
    }
  }
});

// Export supabaseUrl for use in other files
export { supabaseUrl };

// Connection test function with better error handling
export const testSupabaseConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Testing Supabase connection...');
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000);
    });
    
    // Use a simple query that doesn't require authentication
    const connectionPromise = supabase
      .from('tasks')
      .select('count')
      .limit(1);
    
    const { data, error } = await Promise.race([connectionPromise, timeoutPromise]);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      
      // Provide specific error messages based on error type
      if (error.message?.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Cannot connect to Supabase. Please check your internet connection and Supabase configuration.'
        };
      }
      
      if (error.message?.includes('Invalid API key')) {
        return {
          success: false,
          error: 'Invalid Supabase API key. Please check your VITE_SUPABASE_ANON_KEY.'
        };
      }
      
      return {
        success: false,
        error: `Connection failed: ${error.message}`
      };
    }
    
    console.log('Supabase connection test successful');
    return { success: true };
  } catch (error: any) {
    console.error('Supabase connection test error:', error);
    
    if (error.message?.includes('timeout')) {
      return {
        success: false,
        error: 'Connection timeout. Supabase may be unreachable or experiencing issues.'
      };
    }
    
    if (error.message?.includes('Failed to fetch')) {
      return {
        success: false,
        error: 'Network error. Please check your internet connection and try again.'
      };
    }
    
    return {
      success: false,
      error: `Unexpected error: ${error.message}`
    };
  }
};

// Retry wrapper for Supabase operations with exponential backoff
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed:`, error.message);
      
      // Don't retry on certain types of errors
      if (error.message?.includes('Invalid API key') || 
          error.message?.includes('unauthorized') ||
          error.message?.includes('forbidden')) {
        console.log('Not retrying due to authentication error');
        break;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};

// Enhanced error handler with more specific error types
export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Supabase ${operation} error:`, error);
  
  if (error?.message?.includes('Failed to fetch')) {
    console.error('Network connectivity issue detected');
    return {
      type: 'network',
      message: 'Network connection failed. Please check your internet connection and try again.',
      suggestion: 'Verify that your internet connection is working and that Supabase is accessible.',
      originalError: error
    };
  }
  
  if (error?.message?.includes('JWT') || error?.message?.includes('unauthorized')) {
    console.error('Authentication issue detected');
    return {
      type: 'auth',
      message: 'Authentication expired. Please sign in again.',
      suggestion: 'Try signing out and signing back in.',
      originalError: error
    };
  }
  
  if (error?.message?.includes('Invalid API key')) {
    console.error('API key issue detected');
    return {
      type: 'config',
      message: 'Invalid Supabase configuration. Please check your API keys.',
      suggestion: 'Verify your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the .env file.',
      originalError: error
    };
  }
  
  if (error?.message?.includes('timeout')) {
    console.error('Timeout issue detected');
    return {
      type: 'timeout',
      message: 'Request timed out. The server may be experiencing issues.',
      suggestion: 'Try again in a few moments. If the problem persists, Supabase may be experiencing downtime.',
      originalError: error
    };
  }
  
  return {
    type: 'unknown',
    message: error?.message || 'An unexpected error occurred',
    suggestion: 'Please try again. If the problem persists, check the browser console for more details.',
    originalError: error
  };
};

// Safe Supabase operation wrapper with enhanced error handling
export const safeSupabaseOperation = async <T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  fallbackValue: T,
  operationName: string = 'operation'
): Promise<{ data: T; error: any | null }> => {
  try {
    const result = await withRetry(operation);
    
    if (result.error) {
      const errorInfo = handleSupabaseError(result.error, operationName);
      console.error(`Safe operation "${operationName}" failed:`, errorInfo);
      return { data: fallbackValue, error: errorInfo };
    }
    
    return { data: result.data || fallbackValue, error: null };
  } catch (error) {
    const errorInfo = handleSupabaseError(error, operationName);
    console.error(`Safe operation "${operationName}" threw exception:`, errorInfo);
    return { data: fallbackValue, error: errorInfo };
  }
};

// User profile operations with improved error handling
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: { 
  display_name?: string; 
  avatar_url?: string; 
  app_title?: string; 
}) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception updating user profile:', error);
    return { data: null, error };
  }
};

// Avatar storage utilities with improved error handling
export const uploadAvatar = async (file: File, userId: string): Promise<{ url: string | null; error: string | null }> => {
  try {
    console.log('Starting avatar upload for user:', userId);
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      return { url: null, error: 'Please select an image file' };
    }
    
    if (file.size > 2 * 1024 * 1024) {
      return { url: null, error: 'File size must be less than 2MB' };
    }
    
    // Create unique filename with user folder structure
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;
    
    console.log('Uploading file:', fileName);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false // Don't overwrite, create new file
      });
    
    if (error) {
      console.error('Upload error:', error);
      return { url: null, error: error.message };
    }
    
    console.log('Upload successful:', data);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    console.log('Generated public URL:', urlData.publicUrl);
    
    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Avatar upload exception:', error);
    return { url: null, error: 'Failed to upload image' };
  }
};

export const deleteAvatar = async (url: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    console.log('Attempting to delete avatar:', url);
    
    // Check if it's a Supabase Storage URL
    if (!url || !url.includes('/storage/v1/object/public/avatars/')) {
      console.log('Not a Supabase Storage URL, skipping deletion');
      return { success: true, error: null };
    }
    
    // Extract file path from URL
    const urlParts = url.split('/storage/v1/object/public/avatars/');
    if (urlParts.length !== 2) {
      console.log('Invalid URL format, skipping deletion');
      return { success: true, error: null };
    }
    
    const filePath = urlParts[1];
    console.log('Extracted file path:', filePath);
    
    // Delete from Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);
    
    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Delete successful:', data);
    return { success: true, error: null };
  } catch (error) {
    console.error('Avatar delete exception:', error);
    return { success: false, error: 'Failed to delete image' };
  }
};

// Clean up old avatars for a user (keep only the latest)
export const cleanupOldAvatars = async (userId: string, currentAvatarUrl?: string): Promise<void> => {
  try {
    console.log('Cleaning up old avatars for user:', userId);
    
    // List all files in the user's folder
    const { data: files, error } = await supabase.storage
      .from('avatars')
      .list(userId, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (error) {
      console.error('Error listing files:', error);
      return;
    }
    
    if (!files || files.length <= 1) {
      console.log('No old files to clean up');
      return;
    }
    
    // Extract current filename from URL if provided
    let currentFileName = '';
    if (currentAvatarUrl) {
      const urlParts = currentAvatarUrl.split('/');
      currentFileName = urlParts[urlParts.length - 1];
    }
    
    // Delete all files except the current one
    const filesToDelete = files
      .filter(file => file.name !== currentFileName)
      .map(file => `${userId}/${file.name}`);
    
    if (filesToDelete.length > 0) {
      console.log('Deleting old files:', filesToDelete);
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove(filesToDelete);
      
      if (deleteError) {
        console.error('Error deleting old files:', deleteError);
      } else {
        console.log('Successfully cleaned up old avatars');
      }
    }
  } catch (error) {
    console.error('Error cleaning up old avatars:', error);
  }
};