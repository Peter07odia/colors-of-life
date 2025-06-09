import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

export interface WardrobeItem {
  id: string;
  name: string;
  category: 'tops' | 'bottoms' | 'outerwear' | 'shoes' | 'accessories';
  price: number;
  brand: string;
  image: string;
  isFavorite: boolean;
  dateAdded: string;
}

export interface OutfitState {
  tops: WardrobeItem | null;
  bottoms: WardrobeItem | null;
  outerwear: WardrobeItem | null;
  shoes: WardrobeItem | null;
  accessories: WardrobeItem[];
}

export interface Avatar {
  id: string;
  name: string;
  image: string;
  customizations: {
    background: string;
    pose: string;
    zoom: number;
  };
}

export interface UseVirtualChangingRoomReturn {
  // Avatar state
  avatar: Avatar | null;
  setAvatar: (avatar: Avatar) => void;
  
  // Wardrobe state
  wardrobeItems: WardrobeItem[];
  setWardrobeItems: (items: WardrobeItem[]) => void;
  
  // Current outfit state
  currentOutfit: OutfitState;
  addItemToOutfit: (item: WardrobeItem) => void;
  removeItemFromOutfit: (category: string) => void;
  clearOutfit: () => void;
  
  // Computed values
  totalOutfitPrice: number;
  isOutfitComplete: boolean;
  
  // Actions
  saveCurrentLook: () => Promise<void>;
  shareCurrentLook: () => Promise<void>;
  addToWishlist: () => Promise<void>;
  shopItems: () => void;
}

const initialOutfitState: OutfitState = {
  tops: null,
  bottoms: null,
  outerwear: null,
  shoes: null,
  accessories: []
};

export function useVirtualChangingRoom(): UseVirtualChangingRoomReturn {
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [currentOutfit, setCurrentOutfit] = useState<OutfitState>(initialOutfitState);

  const addItemToOutfit = useCallback((item: WardrobeItem) => {
    setCurrentOutfit(prev => {
      if (item.category === 'accessories') {
        // Handle accessories differently - can have multiple
        const updatedAccessories = [...prev.accessories];
        const existingIndex = updatedAccessories.findIndex(acc => acc.id === item.id);
        
        if (existingIndex >= 0) {
          // Remove if already exists
          updatedAccessories.splice(existingIndex, 1);
        } else {
          // Add new accessory
          updatedAccessories.push(item);
        }
        
        return {
          ...prev,
          accessories: updatedAccessories
        };
      } else {
        // Replace single item categories
        return {
          ...prev,
          [item.category]: item
        };
      }
    });
  }, []);

  const removeItemFromOutfit = useCallback((category: string) => {
    setCurrentOutfit(prev => ({
      ...prev,
      [category]: category === 'accessories' ? [] : null
    }));
  }, []);

  const clearOutfit = useCallback(() => {
    setCurrentOutfit(initialOutfitState);
  }, []);

  // Computed values
  const totalOutfitPrice = Object.values(currentOutfit)
    .flat()
    .filter(Boolean)
    .reduce((total: number, item: any) => total + (item?.price || 0), 0);

  const isOutfitComplete = !!(
    currentOutfit.tops && 
    currentOutfit.bottoms
  );

  // Actions
  const saveCurrentLook = useCallback(async () => {
    try {
      // TODO: Implement save look functionality with API
      console.log('Saving current look:', currentOutfit);
      
      // Show success alert
      Alert.alert(
        'Look Saved!',
        'Your outfit has been saved to your collection.',
        [{ text: 'OK', style: 'default' }]
      );
      
      // This would typically make an API call to save the look
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to save your look. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [currentOutfit]);

  const shareCurrentLook = useCallback(async () => {
    try {
      // TODO: Implement share functionality with React Native Share
      console.log('Sharing current look:', currentOutfit);
      
      // For now, just show an alert
      Alert.alert(
        'Share Look',
        'Sharing functionality will be implemented soon!',
        [{ text: 'OK', style: 'default' }]
      );
      
      // This would typically use React Native Share API
      // import { Share } from 'react-native';
      // await Share.share({
      //   message: 'Check out my new outfit!',
      //   url: 'https://your-app.com/look/123'
      // });
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to share your look. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [currentOutfit]);

  const addToWishlist = useCallback(async () => {
    try {
      // TODO: Implement wishlist functionality
      console.log('Adding to wishlist:', currentOutfit);
      
      const itemCount = Object.values(currentOutfit)
        .flat()
        .filter(Boolean).length;
      
      Alert.alert(
        'Added to Wishlist!',
        `${itemCount} item${itemCount !== 1 ? 's' : ''} added to your wishlist.`,
        [{ text: 'OK', style: 'default' }]
      );
      
      // This would typically add all items in current outfit to wishlist
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to add items to wishlist. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [currentOutfit]);

  const shopItems = useCallback(() => {
    try {
      // TODO: Implement shop functionality
      console.log('Shopping items:', currentOutfit);
      
      const itemCount = Object.values(currentOutfit)
        .flat()
        .filter(Boolean).length;
      
      if (itemCount === 0) {
        Alert.alert(
          'No Items Selected',
          'Please add some items to your outfit first.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }
      
      Alert.alert(
        'Shop Items',
        `Redirecting to shop with ${itemCount} item${itemCount !== 1 ? 's' : ''}...`,
        [{ text: 'OK', style: 'default' }]
      );
      
      // This would typically redirect to shopping cart with current items
      // or navigate to a shopping screen
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to open shopping. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [currentOutfit]);

  return {
    // Avatar state
    avatar,
    setAvatar,
    
    // Wardrobe state
    wardrobeItems,
    setWardrobeItems,
    
    // Current outfit state
    currentOutfit,
    addItemToOutfit,
    removeItemFromOutfit,
    clearOutfit,
    
    // Computed values
    totalOutfitPrice,
    isOutfitComplete,
    
    // Actions
    saveCurrentLook,
    shareCurrentLook,
    addToWishlist,
    shopItems
  };
} 