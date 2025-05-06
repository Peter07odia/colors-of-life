import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StylePreference } from '../userPreferences';

export interface User {
  id?: string;
  name: string;
  email?: string;
  gender?: 'man' | 'woman' | 'prefer-not-to-say';
  sizes?: {
    tops?: string;
    bottoms?: string;
    shoes?: string;
  };
  avatarUrl?: string;
  isAuthenticated: boolean;
}

export interface UserState {
  user: User | null;
  preferences: StylePreference | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => void;
  setPreferences: (preferences: StylePreference | null) => void;
  updatePreferences: (preferencesData: Partial<StylePreference>) => void;
  signOut: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      preferences: null,
      loading: false,
      error: null,
      
      setUser: (user) => set({ user, error: null }),
      
      updateUser: (userData) => 
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
          error: null,
        })),
      
      setPreferences: (preferences) => set({ preferences, error: null }),
      
      updatePreferences: (preferencesData) =>
        set((state) => ({
          preferences: state.preferences 
            ? { ...state.preferences, ...preferencesData } 
            : preferencesData as StylePreference,
          error: null,
        })),
      
      signOut: () => 
        set({ 
          user: null,
          error: null,
        }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error, loading: false }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        preferences: state.preferences,
      }),
    }
  )
); 