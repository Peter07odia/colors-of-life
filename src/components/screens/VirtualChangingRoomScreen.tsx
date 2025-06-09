'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import {
  User,
  Shirt,
  Package,
  Heart,
  RefreshCw,
  X,
  Search,
  Settings,
  Palette,
  RotateCcw,
  Camera,
  ShoppingBag,
  Sparkles,
  PlayCircle,
  Save,
  Star,
  ChevronLeft,
  ChevronRight,
  Share,
  Bookmark,
  ZoomIn,
  ZoomOut,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera as ExpoCamera } from 'expo-camera';
import { Video } from 'expo-av';

import { Button } from '../ui/Button';
import { Heading, AppText } from '../ui/Typography';
import { colors } from '../../constants/colors';
import { useTryOnContext } from '../../contexts/TryOnContext';

const { width, height } = Dimensions.get('window');

// Sample avatar data - will be replaced with n8n workflow
const sampleAvatar = {
  id: 'user-avatar-1',
  name: 'Your Avatar',
  image: require('../../../assets/virtual try on demo/20250408_1616_Stylish Simplicity Display_remix_01jrbgr0zrf1887vc81r8rs7ky.png'),
  customizations: {
    background: 'studio',
    pose: 'standing',
    zoom: 1,
  },
};

// Sample wardrobe items - will connect to real data later
const sampleWardrobeItems = [
  {
    id: 'item-1',
    name: 'Classic White T-Shirt',
    category: 'tops',
    price: 29.99,
    brand: 'Fashion Co.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop',
    isFavorite: true,
    dateAdded: '2024-01-15'
  },
  {
    id: 'item-2',
    name: 'Blue Denim Jeans',
    category: 'bottoms',
    price: 79.99,
    brand: 'Denim Brand',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=400&fit=crop',
    isFavorite: false,
    dateAdded: '2024-01-14'
  },
  {
    id: 'item-3',
    name: 'Black Leather Jacket',
    category: 'outerwear',
    price: 199.99,
    brand: 'Premium Leather',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=400&fit=crop',
    isFavorite: true,
    dateAdded: '2024-01-13'
  },
  {
    id: 'item-4',
    name: 'White Sneakers',
    category: 'shoes',
    price: 89.99,
    brand: 'Sport Brand',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop',
    isFavorite: false,
    dateAdded: '2024-01-12'
  }
];

// Sample current outfit state
const initialOutfitState = {
  tops: null,
  bottoms: null,
  outerwear: null,
  shoes: null,
  accessories: []
};

// Background options
const backgroundOptions = [
  { id: 'studio', name: 'Studio' },
  { id: 'outdoor', name: 'Outdoor' },
  { id: 'bedroom', name: 'Bedroom' },
  { id: 'street', name: 'Street' }
];

// Pose options
const poseOptions = [
  { id: 'standing', name: 'Standing', icon: '🧍' },
  { id: 'casual', name: 'Casual', icon: '🤷' },
  { id: 'confident', name: 'Confident', icon: '💪' },
  { id: 'elegant', name: 'Elegant', icon: '💃' }
];

interface VirtualChangingRoomScreenProps {
  userHasAvatar?: boolean;
}

export default function VirtualChangingRoomScreen({ userHasAvatar = false }: VirtualChangingRoomScreenProps) {
  const insets = useSafeAreaInsets();
  
  // Try-on context
  const { setHasClothesForTryOn, setSelectedClothesCount } = useTryOnContext();
  
  // State management
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(true);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentOutfit, setCurrentOutfit] = useState(initialOutfitState);
  const [avatarSettings, setAvatarSettings] = useState(sampleAvatar.customizations);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showAvatarPrompt, setShowAvatarPrompt] = useState(!userHasAvatar);
  const [showOutfitFloatingCard, setShowOutfitFloatingCard] = useState(false);

  // Categories for filtering
  const categories = [
    { id: 'all', label: 'All Items', icon: Package },
    { id: 'tops', label: 'Tops', icon: Shirt },
    { id: 'bottoms', label: 'Bottoms', icon: Package },
    { id: 'outerwear', label: 'Outerwear', icon: Package },
    { id: 'shoes', label: 'Shoes', icon: Package },
    { id: 'accessories', label: 'Accessories', icon: Sparkles }
  ];

  // Filter items by category
  const filteredItems = selectedCategory === 'all' 
    ? sampleWardrobeItems 
    : sampleWardrobeItems.filter(item => item.category === selectedCategory);

  // Calculate total outfit price
  const totalOutfitPrice = Object.values(currentOutfit)
    .flat()
    .filter(Boolean)
    .reduce((total: number, item: any) => total + (item?.price || 0), 0);

  // Check if any clothing items are selected for try-on
  const hasClothesForTryOn = Object.values(currentOutfit).some(item => 
    Array.isArray(item) ? item.length > 0 : item !== null
  );

  // Update try-on context when outfit changes
  useEffect(() => {
    const clothesCount = Object.values(currentOutfit).filter(item => 
      Array.isArray(item) ? item.length > 0 : item !== null
    ).length;
    
    setHasClothesForTryOn(hasClothesForTryOn);
    setSelectedClothesCount(clothesCount);
  }, [currentOutfit, hasClothesForTryOn, setHasClothesForTryOn, setSelectedClothesCount]);

  // Handle item try-on
  const handleTryOnItem = (item: any) => {
    setCurrentOutfit(prev => ({
      ...prev,
      [item.category]: item
    }));
    setShowOutfitFloatingCard(true);
  };

  // Handle remove item from outfit
  const handleRemoveItem = (category: string) => {
    setCurrentOutfit(prev => ({
      ...prev,
      [category]: null
    }));
    
    // Hide floating card if no items left
    const remainingItems = Object.values({
      ...currentOutfit,
      [category]: null
    }).filter(Boolean);
    if (remainingItems.length === 0) {
      setShowOutfitFloatingCard(false);
    }
  };

  // Handle virtual try-on process
  const handleVirtualTryOn = () => {
    if (!hasClothesForTryOn) return;
    
    console.log('Starting virtual try-on with outfit:', currentOutfit);
    // This would typically trigger the virtual try-on API or process
  };

  // Avatar Creation Prompt
  const AvatarCreationPrompt = () => (
    <Modal visible={showAvatarPrompt} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.avatarPromptContainer}>
          <Text style={styles.avatarPromptTitle}>Create Your Avatar</Text>
          <Text style={styles.avatarPromptText}>
            Upload a photo to create your personalized avatar for virtual try-ons
          </Text>
          <View style={styles.avatarPromptButtons}>
            <TouchableOpacity 
              style={[styles.avatarPromptButton, styles.avatarPromptButtonSecondary]}
              onPress={() => setShowAvatarPrompt(false)}
            >
              <Text style={styles.avatarPromptButtonTextSecondary}>Skip for now</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.avatarPromptButton, styles.avatarPromptButtonPrimary]}
              onPress={() => {
                // Handle avatar creation
                setShowAvatarPrompt(false);
              }}
            >
              <Camera size={20} color="#fff" />
              <Text style={styles.avatarPromptButtonTextPrimary}>Create Avatar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <AvatarCreationPrompt />

      <View style={styles.mainContainer}>
        {/* Left Sidebar - Wardrobe */}
        {!isLeftSidebarCollapsed && (
          <View style={styles.leftSidebar}>
            {/* Category Section - Horizontal Scrollable Pills with Back Button */}
            <View style={styles.categorySection}>
              <View style={styles.categoryHeaderRow}>
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={() => setIsLeftSidebarCollapsed(true)}
                >
                  <ChevronLeft size={20} color={colors.text.secondary} />
                </TouchableOpacity>
                <ScrollView 
                  horizontal 
                  style={styles.categoryScrollViewCompact}
                  contentContainerStyle={styles.categoryScrollContentCompact}
                  showsHorizontalScrollIndicator={false}
                  pagingEnabled={false}
                >
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryPillCompact,
                          selectedCategory === category.id && styles.selectedCategoryPill,
                        ]}
                        onPress={() => setSelectedCategory(category.id)}
                      >
                        <IconComponent 
                          size={16} 
                          color={selectedCategory === category.id ? '#FFFFFF' : colors.text.secondary} 
                        />
                        <Text style={[
                          styles.categoryPillText,
                          selectedCategory === category.id && styles.selectedCategoryPillText,
                        ]}>
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Wardrobe Items */}
            <ScrollView style={styles.wardrobeItemsContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.wardrobeGrid}>
                {filteredItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.wardrobeItem}
                    onPress={() => handleTryOnItem(item)}
                  >
                    <View style={styles.wardrobeItemImageContainer}>
                      <Image source={{ uri: item.image }} style={styles.wardrobeItemImage} />
                      {item.isFavorite && (
                        <Heart style={styles.favoriteIcon} size={16} color="#FF3040" fill="#FF3040" />
                      )}
                      {hoveredItem === item.id && (
                        <View style={styles.hoverOverlay}>
                          <Text style={styles.hoverText}>Try On</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.wardrobeItemInfo}>
                      <Text style={styles.wardrobeItemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.wardrobeItemPrice}>${item.price}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Main Canvas Area - Full Screen Avatar Display */}
        <View style={styles.mainCanvas}>
          {/* Avatar Canvas - Full Screen */}
          <View style={styles.avatarCanvas}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => {
                setIsLeftSidebarCollapsed(true);
                setIsRightSidebarCollapsed(true);
              }}
              activeOpacity={0.9}
            >
              <Image
                source={sampleAvatar.image}
                style={styles.avatarImage}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Page Title - Positioned just above floating icons */}
            <View style={styles.titleOverlay}>
              <Text style={styles.pageTitle}>Changing Room</Text>
            </View>

            {/* Floating Control Icons - Top Left and Right - Only show when drawers are closed */}
            {isLeftSidebarCollapsed && (
              <TouchableOpacity 
                style={[styles.floatingIcon, styles.floatingIconLeft]}
                onPress={() => {
                  setIsLeftSidebarCollapsed(false);
                  setIsRightSidebarCollapsed(true); // Close right drawer when opening left
                }}
              >
                <Shirt size={24} color={colors.text.primary} />
              </TouchableOpacity>
            )}

            {isRightSidebarCollapsed && (
              <TouchableOpacity 
                style={[styles.floatingIcon, styles.floatingIconRight]}
                onPress={() => {
                  setIsRightSidebarCollapsed(false);
                  setIsLeftSidebarCollapsed(true); // Close left drawer when opening right
                }}
              >
                <Settings size={24} color={colors.text.primary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Individual Square Floating Cards for Selected Items */}
          <View style={styles.selectedItemsContainer}>
            {Object.entries(currentOutfit).map(([category, item], index) => (
              item && (
                <View 
                  key={category} 
                  style={[
                    styles.squareFloatingCard,
                    {
                      transform: [
                        { rotate: `${-3 + (index % 3) * 2}deg` },
                        { translateY: 5 + (index % 2) * 3 }
                      ]
                    }
                  ]}
                >
                  <Image source={{ uri: item.image }} style={styles.squareItemImage} />
                  <TouchableOpacity 
                    style={styles.removeItemButtonSquare}
                    onPress={() => handleRemoveItem(category)}
                  >
                    <X size={14} color="#fff" />
                  </TouchableOpacity>
                  <View style={styles.categoryLabelContainer}>
                    <Text style={styles.categoryLabel}>{category}</Text>
                  </View>
                </View>
              )
            ))}
          </View>
        </View>

        {/* Right Sidebar - Avatar Settings */}
        {!isRightSidebarCollapsed && (
          <View style={styles.rightSidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Avatar Settings</Text>
              <TouchableOpacity 
                style={styles.collapseButton} 
                onPress={() => setIsRightSidebarCollapsed(true)}
              >
                <ChevronRight size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Avatar Controls */}
            <ScrollView style={styles.avatarControlsContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.controlSection}>
                <Text style={styles.controlSectionTitle}>Background</Text>
                <View style={styles.controlButtons}>
                  <TouchableOpacity style={styles.controlButton}>
                    <Palette size={20} color={colors.primary} />
                    <Text style={styles.controlButtonText}>Studio</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.controlButton}>
                    <Camera size={20} color={colors.text.secondary} />
                    <Text style={styles.controlButtonText}>Custom</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.controlSection}>
                <Text style={styles.controlSectionTitle}>Pose</Text>
                <View style={styles.controlButtons}>
                  <TouchableOpacity style={styles.controlButton}>
                    <User size={20} color={colors.primary} />
                    <Text style={styles.controlButtonText}>Standing</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.controlButton}>
                    <RotateCcw size={20} color={colors.text.secondary} />
                    <Text style={styles.controlButtonText}>Turn</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.controlSection}>
                <Text style={styles.controlSectionTitle}>Avatar</Text>
                <View style={styles.controlButtons}>
                  <TouchableOpacity style={styles.controlButton}>
                    <Camera size={20} color={colors.text.secondary} />
                    <Text style={styles.controlButtonText}>New Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.controlButton}>
                    <Settings size={20} color={colors.text.secondary} />
                    <Text style={styles.controlButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.controlSection}>
                <Text style={styles.controlSectionTitle}>Zoom & View</Text>
                <View style={styles.controlButtons}>
                  <TouchableOpacity style={styles.controlButton}>
                    <ZoomIn size={20} color={colors.text.secondary} />
                    <Text style={styles.controlButtonText}>Zoom In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.controlButton}>
                    <ZoomOut size={20} color={colors.text.secondary} />
                    <Text style={styles.controlButtonText}>Zoom Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  
  leftSidebar: {
    width: 300,
    backgroundColor: colors.background.main,
    borderRightWidth: 1,
    borderRightColor: colors.border.light,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  
  rightSidebar: {
    width: 300,
    backgroundColor: colors.background.main,
    borderLeftWidth: 1,
    borderLeftColor: colors.border.light,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  
  collapseButton: {
    padding: 8,
  },

  // Category Section - Horizontal Pills
  categorySection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
  },
  
  categoryScrollView: {
    flex: 1,
    flexGrow: 0,
  },
  
  categoryScrollViewCompact: {
    flex: 1,
    maxWidth: 250, // Limits visible area to show ~2 pills
  },
  
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  
  categoryScrollContentCompact: {
    gap: 8,
    paddingRight: 16, // Extra padding for scroll area
  },
  
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: '#F3F3F3',
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 80,
  },
  
  categoryPillCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: '#F3F3F3',
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 100,
    maxWidth: 120,
  },
  
  selectedCategoryPill: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  categoryPillText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  
  selectedCategoryPillText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Wardrobe Items
  wardrobeItemsContainer: {
    flex: 1,
    padding: 16,
  },
  
  wardrobeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  wardrobeItem: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: colors.background.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  
  wardrobeItemImageContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  
  wardrobeItemImage: {
    width: '100%',
    height: '100%',
  },
  
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  
  hoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  hoverText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  
  wardrobeItemInfo: {
    padding: 8,
  },
  
  wardrobeItemName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
  },
  
  wardrobeItemPrice: {
    fontSize: 10,
    color: colors.textSecondary,
  },

  // Main Canvas
  mainCanvas: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Light neutral background like your image
  },
  
  avatarCanvas: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  avatarContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: -50, // Move avatar position higher
  },
  
  avatarImage: {
    width: '90%',
    height: '85%',
    borderRadius: 60, // Very dramatic rounded corners - almost pill-shaped
    overflow: 'hidden', // Ensure corners are clipped
  },
  
  // Floating Control Icons
  floatingIcon: {
    position: 'absolute',
    top: -35, // Move buttons to align with title
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  
  floatingIconLeft: {
    left: 15, // Move wider apart from center
  },
  
  floatingIconRight: {
    right: 15, // Move wider apart from center
  },
  
  avatarInfoOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  avatarInfoContainer: {
    padding: 12,
  },
  
  avatarName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  
  avatarDetails: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Selected Items Container - Square Floating Cards (Horizontal Stack)
  selectedItemsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 100,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    gap: 12,
  },
  
  squareFloatingCard: {
    width: 80,
    height: 80,
    backgroundColor: colors.background.main,
    borderRadius: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  
  squareItemImage: {
    width: '100%',
    height: '70%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  
  removeItemButtonSquare: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  
  categoryLabelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: colors.background.main,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  
  categoryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'capitalize',
  },

  // Floating Card
  floatingCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  
  floatingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  floatingCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  
  selectedItemsList: {
    flexDirection: 'row',
    gap: 12,
  },
  
  selectedItemCard: {
    width: 80,
    alignItems: 'center',
  },
  
  selectedItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 4,
  },
  
  removeItemButton: {
    position: 'absolute',
    top: -4,
    right: 6,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  selectedItemName: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  
  selectedItemPrice: {
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  tryOnButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    position: 'relative',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },

  tryOnButtonGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: colors.primary,
    borderRadius: 16,
    opacity: 0.3,
    zIndex: -1,
  },
  
  tryOnButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Current Outfit Section
  currentOutfitContainer: {
    flex: 1,
    padding: 16,
  },
  
  outfitItemsList: {
    gap: 12,
  },
  
  outfitItemSlot: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    padding: 12,
  },
  
  outfitItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  outfitCategoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
  
  outfitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  outfitItemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  
  outfitItemInfo: {
    flex: 1,
  },
  
  outfitItemName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
  },
  
  outfitItemPrice: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  
  emptyOutfitSlot: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.off,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  
  emptySlotText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  
  totalPriceContainer: {
    backgroundColor: colors.background.off,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  
  totalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  totalPriceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  
  totalPriceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },

  // Action Buttons
  actionButtonsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: 12,
  },
  
  primaryActionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 12,
  },
  
  primaryActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  
  secondaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: 12,
    borderRadius: 12,
  },
  
  secondaryActionButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  
  shopButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: 14,
    borderRadius: 12,
  },
  
  shopButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  avatarPromptContainer: {
    backgroundColor: colors.background.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  
  avatarPromptTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  
  avatarPromptText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  
  avatarPromptButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  
  avatarPromptButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  
  avatarPromptButtonPrimary: {
    backgroundColor: colors.primary,
  },
  
  avatarPromptButtonSecondary: {
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  
  avatarPromptButtonTextPrimary: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  avatarPromptButtonTextSecondary: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },

  // Avatar Controls Styles
  avatarControlsContainer: {
    flex: 1,
    padding: 16,
  },
  
  controlSection: {
    marginBottom: 24,
  },
  
  controlSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  
  controlButtons: {
    gap: 8,
  },
  
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.main,
  },
  
  controlButtonText: {
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: 8,
    fontWeight: '500',
  },

        // Page Title Overlay Styles
   titleOverlay: {
     position: 'absolute',
     top: -40,
     left: 0,
     right: 0,
     alignItems: 'center',
     zIndex: 5,
   },
   
   pageTitle: {
     fontSize: 18,
     fontWeight: '600',
     color: colors.text.primary,
     textAlign: 'center',
   },
});