import AsyncStorage from '@react-native-async-storage/async-storage';

// User Style Preferences Types
export interface StylePreference {
  categories: string[];
  colors: string[];
  patterns: string[];
  occasions: string[];
  brands: string[];
  fit: string[];
}

// Default empty preferences
export const defaultPreferences: StylePreference = {
  categories: [],
  colors: [],
  patterns: [],
  occasions: [],
  brands: [],
  fit: []
};

// Save user preferences to AsyncStorage (mobile-friendly)
export const saveUserPreferences = async (preferences: StylePreference): Promise<void> => {
  try {
    await AsyncStorage.setItem('userStylePreferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
};

// Get user preferences from AsyncStorage (mobile-friendly)
export const getUserPreferences = async (): Promise<StylePreference> => {
  try {
    const savedPreferences = await AsyncStorage.getItem('userStylePreferences');
    if (savedPreferences) {
      return JSON.parse(savedPreferences);
    }
    return defaultPreferences;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return defaultPreferences;
  }
};

// Filter outfits based on user preferences
export const filterOutfitsByPreferences = (outfits: any[], preferences: StylePreference): any[] => {
  // If no preferences are set, return all outfits
  if (Object.values(preferences).every(pref => pref.length === 0)) {
    return outfits;
  }
  
  return outfits.filter(outfit => {
    // Check for category match
    if (preferences.categories.length > 0 && outfit.category) {
      if (!preferences.categories.includes(outfit.category)) {
        return false;
      }
    }
    
    // Check for color match
    if (preferences.colors.length > 0 && outfit.colors) {
      const hasMatchingColor = outfit.colors.some((color: string) => 
        preferences.colors.includes(color)
      );
      if (!hasMatchingColor) {
        return false;
      }
    }
    
    // Check for pattern match
    if (preferences.patterns.length > 0 && outfit.patterns) {
      const hasMatchingPattern = outfit.patterns.some((pattern: string) => 
        preferences.patterns.includes(pattern)
      );
      if (!hasMatchingPattern) {
        return false;
      }
    }
    
    // Check for occasion match
    if (preferences.occasions.length > 0 && outfit.occasions) {
      const hasMatchingOccasion = outfit.occasions.some((occasion: string) => 
        preferences.occasions.includes(occasion)
      );
      if (!hasMatchingOccasion) {
        return false;
      }
    }
    
    // Check for brand match
    if (preferences.brands.length > 0 && outfit.brand) {
      if (!preferences.brands.includes(outfit.brand)) {
        return false;
      }
    }
    
    // Check for fit match
    if (preferences.fit.length > 0 && outfit.fit) {
      if (!preferences.fit.includes(outfit.fit)) {
        return false;
      }
    }
    
    return true;
  });
};

// Generate AI recommendations based on user preferences
export const getAIRecommendations = (outfits: any[], preferences: StylePreference): any[] => {
  // First filter by basic preferences
  const filteredOutfits = filterOutfitsByPreferences(outfits, preferences);
  
  // Mock AI scoring - in a real app, this would call an AI service
  const scoredOutfits = filteredOutfits.map(outfit => {
    // Calculate a relevance score based on preference matches
    let score = 0;
    
    // More matches = higher score
    if (preferences.categories.includes(outfit.category)) score += 2;
    
    if (outfit.colors) {
      outfit.colors.forEach((color: string) => {
        if (preferences.colors.includes(color)) score += 1;
      });
    }
    
    if (outfit.occasions) {
      outfit.occasions.forEach((occasion: string) => {
        if (preferences.occasions.includes(occasion)) score += 1.5;
      });
    }
    
    // Add randomness to simulate AI variability
    score += Math.random() * 2;
    
    return { ...outfit, aiScore: score };
  });
  
  // Sort by score and return top results
  return scoredOutfits.sort((a, b) => b.aiScore - a.aiScore);
}; 