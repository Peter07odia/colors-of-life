import { create } from 'zustand';
import { Outfit } from '../outfitData';

export interface UIState {
  // Navigation
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  
  // Modal states
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
  
  // Try-on functionality
  selectedOutfit: Outfit | null;
  setSelectedOutfit: (outfit: Outfit | null) => void;
  
  // Mobile UI states
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // UI preferences
  showNotifications: boolean;
  toggleNotifications: () => void;
  
  // Performance monitoring
  pageLoadTime: number | null;
  setPageLoadTime: (time: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Navigation
  selectedTab: 'explore',
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  
  // Modal states
  isSearchOpen: false,
  setIsSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
  
  // Try-on functionality
  selectedOutfit: null,
  setSelectedOutfit: (outfit) => set({ selectedOutfit: outfit }),
  
  // Mobile UI states
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  
  // Theme
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  // UI preferences
  showNotifications: true,
  toggleNotifications: () => set((state) => ({ showNotifications: !state.showNotifications })),
  
  // Performance monitoring
  pageLoadTime: null,
  setPageLoadTime: (time) => set({ pageLoadTime: time }),
})); 