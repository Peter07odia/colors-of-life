import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import { Database } from '../types/database.types';
import { NetworkDebugger } from './networkDebug';

// Network state management
let isNetworkConnected = true;
let lastNetworkCheck = 0;
const NETWORK_CHECK_INTERVAL = 5000; // 5 seconds

// Request debouncing
const requestCache = new Map();
const REQUEST_CACHE_DURATION = 1000; // 1 second

// Monitor network state
NetInfo.addEventListener(state => {
  isNetworkConnected = state.isConnected ?? false;
  if (!isNetworkConnected) {
    console.log('Network disconnected - Supabase requests will be queued');
  } else {
    console.log('Network connected - Resuming Supabase requests');
  }
});

// Supabase configuration - Use production Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Only log in development
if (__DEV__) {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');
  console.log('Platform:', Platform.OS, Platform.Version);
}

// iOS Simulator network fix
const isIOSSimulator = __DEV__ && Platform.OS === 'ios';

// Create Supabase client with iOS simulator fixes
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 1, // Further reduced for stability
    },
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'ColorsOfLife-Mobile/1.0',
      ...(isIOSSimulator && {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }),
    },
    fetch: async (url, options = {}) => {
      // Enhanced network check for iOS simulator
      const now = Date.now();
      if (now - lastNetworkCheck > NETWORK_CHECK_INTERVAL) {
        try {
          const netState = await NetInfo.fetch();
          isNetworkConnected = netState.isConnected ?? false;
          lastNetworkCheck = now;
          
          if (__DEV__) {
            console.log(`📱 Network check: ${isNetworkConnected ? '✅' : '❌'} Connected (${netState.type})`);
          }
        } catch (e) {
          // If NetInfo fails, assume connected
          isNetworkConnected = true;
          if (__DEV__) {
            console.log('⚠️ NetInfo check failed, assuming connected');
          }
        }
      }

      if (!isNetworkConnected) {
        throw new Error('No network connection available');
      }

      // iOS Simulator specific timeout (longer)
      const timeoutDuration = isIOSSimulator ? 30000 : 15000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        if (__DEV__) {
          console.log(`⏰ Request timeout after ${timeoutDuration}ms:`, url.replace(supabaseAnonKey, '***'));
        }
      }, timeoutDuration);

      // Retry logic for iOS Simulator
      let retryCount = 0;
      const maxRetries = isIOSSimulator ? 3 : 1;
      
      while (retryCount <= maxRetries) {
        try {
          if (__DEV__ && isIOSSimulator) {
            console.log(`🔗 Making request to: ${url.replace(supabaseAnonKey, '***')} (attempt ${retryCount + 1})`);
          }

          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
              // CRITICAL: Always include the API key first
              'apikey': supabaseAnonKey,
              // Then preserve any existing headers (includes Authorization)
              ...options.headers,
              // Then add our custom headers (but don't override apikey)
              'Cache-Control': 'no-cache',
              'Accept': 'application/json',
              ...(isIOSSimulator && {
                'X-Client-Info': 'supabase-js/ios-simulator',
                'Connection': 'keep-alive',
              }),
            },
          });
          
          clearTimeout(timeoutId);
          NetworkDebugger.logRequest(url, response.ok);
          
          if (__DEV__ && isIOSSimulator) {
            console.log(`✅ Request successful: ${response.status} ${response.statusText}`);
          }
          
          return response;
        } catch (error) {
          retryCount++;
          
          if (__DEV__ && isIOSSimulator && retryCount <= maxRetries) {
            console.log(`⚠️ Retry ${retryCount}/${maxRetries} for:`, url.replace(supabaseAnonKey, '***'));
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
            continue;
          }
          
          clearTimeout(timeoutId);
          NetworkDebugger.logRequest(url, false);
          
          // Enhanced error handling for development
          if (error.name === 'AbortError') {
            const timeoutMsg = `Request timeout after ${timeoutDuration}ms - please check your connection`;
            if (__DEV__) {
              console.error('🚨 Timeout Error:', timeoutMsg);
            }
            throw new Error(timeoutMsg);
          }
          
          if (__DEV__) {
            console.error('🚨 Supabase network error:', {
              url: url.replace(supabaseAnonKey, '***'),
              error: error.message,
              name: error.name,
              platform: Platform.OS,
              isSimulator: isIOSSimulator,
              retryCount,
            });
          } else {
            // Production: only log critical info
            console.error('Network error:', error.message);
          }
          
          throw error;
        }
      }
    },
  },
});

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Network error fetching user profile:', error);
    return null;
  }
};

// Helper function to sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  } catch (error) {
    console.error('Network error signing out:', error);
    throw error;
  }
};

export default supabase; 