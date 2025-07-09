import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase, getUserProfile } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface AuthContextType {
  // State
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  // Auth Methods
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<{ error?: AuthError }>;
  signInWithGoogle: () => Promise<{ error?: AuthError }>;
  signInWithApple: () => Promise<{ error?: AuthError }>;
  
  // Profile Methods
  updateProfile: (updates: any) => Promise<{ error?: Error }>;
  getProfile: () => Promise<any>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('Error getting initial session:', error);
          } else {
            setSession(initialSession);
            setUser(initialSession?.user ?? null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);

          // Store auth state for offline access
          if (session) {
            await AsyncStorage.setItem('isAuthenticated', 'true');
          } else {
            await AsyncStorage.removeItem('isAuthenticated');
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign In
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      return {};
    } catch (error) {
      console.error('Sign in network error:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Sign Up
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      // If sign up successful but needs email confirmation
      if (data.user && !data.session) {
        console.log('Sign up successful, check email for confirmation');
      }

      return {};
    } catch (error) {
      console.error('Sign up network error:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        return { error };
      }

      // Clear local storage
      await AsyncStorage.removeItem('isAuthenticated');
      
      return {};
    } catch (error) {
      console.error('Sign out network error:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In (placeholder - requires additional setup)
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      // Note: This requires additional setup with Google OAuth
      // For now, we'll return an error to indicate it's not implemented
      return { 
        error: { 
          message: 'Google sign-in not implemented yet. Please use email/password.',
          name: 'NotImplementedError'
        } as AuthError 
      };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Apple Sign In (placeholder - requires additional setup)
  const signInWithApple = async () => {
    try {
      setLoading(true);
      // Note: This requires additional setup with Apple OAuth
      // For now, we'll return an error to indicate it's not implemented
      return { 
        error: { 
          message: 'Apple sign-in not implemented yet. Please use email/password.',
          name: 'NotImplementedError'
        } as AuthError 
      };
    } catch (error) {
      console.error('Apple sign in error:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Update Profile
  const updateProfile = async (updates: any) => {
    if (!user) {
      return { error: new Error('No authenticated user') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        return { error: new Error(error.message) };
      }

      return {};
    } catch (error) {
      console.error('Profile update network error:', error);
      return { error: error as Error };
    }
  };

  // Get Profile
  const getProfile = async () => {
    if (!user) {
      return null;
    }

    try {
      return await getUserProfile(user.id);
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  };

  // Context value
  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithApple,
    updateProfile,
    getProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext; 