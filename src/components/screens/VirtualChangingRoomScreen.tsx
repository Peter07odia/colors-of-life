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
  ImageStyle,
  Platform,
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
  Upload,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera as ExpoCamera, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Video } from 'expo-av';
import { fashionItemService } from '../../services/fashionItemService';

import { Button } from '../ui/Button';
import { Heading, AppText } from '../ui/Typography';
import { colors } from '../../constants/colors';
import { useTryOnContext } from '../../contexts/TryOnContext';
import { supabaseEdgeFunctionService } from '../../lib/services/supabaseEdgeFunctionService';
import { supabase } from '../../lib/supabase';
import { PhotoUploadScreen } from '../tryOn/PhotoUploadScreen';
// Removed DEFAULT_MODELS import to fix errors

const { width, height } = Dimensions.get('window');

// Sample avatar data - will be replaced with n8n workflow
const sampleAvatar = {
  id: 'user-avatar-1',
  name: 'Your Avatar',
  image: 'https://jiwiclemrwjojoewmcnc.supabase.co/storage/v1/object/public/fashion-items/demo/avatar-sample.png',
  customizations: {
    background: 'studio',
    pose: 'standing',
    zoom: 1,
  },
};

// Use fashionItemService to load real database items
// Note: wardrobeItems state moved inside component

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

// Model options with all 6 default models from defaultModels.ts
const modelOptions = [
  {
    id: 'default-petite',
    name: 'Petite Model',
    type: 'default' as const,
    description: 'Perfect for petite body types and smaller clothing sizes',
    image: require('../../../assets/default models/petite.png')
  },
  {
    id: 'default-average', 
    name: 'Average Model',
    type: 'default' as const,
    description: 'Ideal for standard body types and regular sizing',
    image: require('../../../assets/default models/average.png')
  },
  {
    id: 'default-athletic',
    name: 'Athletic Model',
    type: 'default' as const,
    description: 'Great for athletic builds and activewear',
    image: require('../../../assets/default models/athletic.png')
  },
  {
    id: 'default-curvy',
    name: 'Curvy Model',
    type: 'default' as const,
    description: 'Perfect for curvy body types and plus-size fashion',
    image: require('../../../assets/default models/curvy.png')
  },
  {
    id: 'default-medium-large',
    name: 'Medium-Large Model', 
    type: 'default' as const,
    description: 'Ideal for medium to large body types',
    image: require('../../../assets/default models/medium-large.png')
  },
  {
    id: 'default-xl',
    name: 'XL Model',
    type: 'default' as const,
    description: 'Perfect for extra-large sizes and extended fit clothing',
    image: require('../../../assets/default models/xl.png')
  }
];


interface VirtualChangingRoomScreenProps {
  userHasAvatar?: boolean;
}

export default function VirtualChangingRoomScreen({ userHasAvatar = false }: VirtualChangingRoomScreenProps) {
  const insets = useSafeAreaInsets();
  
  // Try-on context
  const { setHasClothesForTryOn, setSelectedClothesCount } = useTryOnContext();
  
  // State management
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(true);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false); // Open by default to show default models
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentOutfit, setCurrentOutfit] = useState(initialOutfitState);
  const [avatarSettings, setAvatarSettings] = useState({
    selectedId: 'default-average', // ID of selected model or avatar - default to average model
    selectedType: 'default' // 'default' for model options, 'user' for user avatars
  });
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showAvatarPrompt, setShowAvatarPrompt] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showOutfitFloatingCard, setShowOutfitFloatingCard] = useState(false);
  const [avatarCreationStep, setAvatarCreationStep] = useState<'prompt' | 'capture' | 'processing' | 'complete'>('prompt');

  // Load real fashion items from database
  useEffect(() => {
    const loadFashionItems = async () => {
      try {
        const items = await fashionItemService.getFashionItems(20);
        console.log('✅ Loaded fashion items from database:', items.length);
        setWardrobeItems(items);
      } catch (error) {
        console.error('Failed to load fashion items:', error);
      }
    };
    loadFashionItems();
  }, []);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [avatarProcessingProgress, setAvatarProcessingProgress] = useState(0);
  const [userAvatars, setUserAvatars] = useState<any[]>([]); // Store user's created avatars

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
    ? wardrobeItems 
    : wardrobeItems.filter(item => item.category === selectedCategory);

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

  // Load user avatars on component mount
  useEffect(() => {
    loadUserAvatars();
  }, []);

  const loadUserAvatars = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (userId) {
        const avatars = await supabaseEdgeFunctionService.getUserAvatars(userId);
        setUserAvatars(avatars);
      }
    } catch (error) {
      console.error('Failed to load user avatars:', error);
    }
  };

  // Handle item try-on
  const handleTryOnItem = (item: any) => {
    console.log('🎯 Demo item selected for try-on:', {
      id: item.id,
      name: item.name,
      category: item.category,
      brand: item.brand,
      price: item.price
    });
    
    setCurrentOutfit(prev => ({
      ...prev,
      [item.category]: item
    }));
    setShowOutfitFloatingCard(true);
    
    console.log('✅ Item added to current outfit in category:', item.category);
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

  // Add virtual try-on processing state with enhanced progress tracking
  const [isProcessingTryOn, setIsProcessingTryOn] = useState(false);
  const [tryOnResults, setTryOnResults] = useState<any>(null);
  const [tryOnStep, setTryOnStep] = useState<'idle' | 'validating_avatar' | 'processing_image' | 'generating_video' | 'finalizing' | 'complete'>('idle');
  const [tryOnProgress, setTryOnProgress] = useState(0);
  const [tryOnCurrentStep, setTryOnCurrentStep] = useState('');

  // Handle virtual try-on process
  const handleVirtualTryOn = async () => {
    if (!hasClothesForTryOn) return;
    
    setIsProcessingTryOn(true);
    setTryOnStep('validating_avatar');
    setTryOnProgress(0);
    setTryOnCurrentStep('Starting try-on process...');
    
         try {
       // Get current user ID and avatar ID
       const { data: { session } } = await supabase.auth.getSession();
       const userId = session?.user?.id || 'anonymous-user';
       
       // Get currently selected avatar ID
       const avatarId = avatarSettings.selectedType === 'user' 
         ? avatarSettings.selectedId
         : avatarSettings.selectedId; // Default models already have correct ID format
       
       // Get selected clothing items
       const selectedItems = Object.entries(currentOutfit)
         .filter(([category, item]) => item !== null)
         .map(([category, item]) => ({ 
           category, 
           imageUrl: item.image,
           image: item.image, // Include both for compatibility
           name: item.name,
           itemId: item.id,
           price: item.price,
           brand: item.brand
         }));

       console.log('Starting virtual try-on with outfit:', selectedItems);
       
               // Start virtual try-on with Supabase Edge Function
        const result = await supabaseEdgeFunctionService.performVirtualTryOn({
          avatarId,
          clothingItems: selectedItems,
          userId,
          // Add missing fields that N8N workflow expects
          clothingItemData: {
            processingSettings: {
              qualityLevel: 'high',
              outputFormat: 'both'
            }
          },
          tryonSettings: {
            qualityLevel: 'high',
            outputFormat: 'both',
            autoCreateAvatar: false
          }
        });

        // Poll for completion with enhanced progress tracking
        supabaseEdgeFunctionService.pollProcessingStatus(
         'tryon',
         result.tryOnId,
         (status) => {
           console.log('🎬 Try-on progress update:', status);
           
           if (status?.progressPercentage !== undefined) {
             setTryOnProgress(status.progressPercentage);
           }
           
           if (status?.currentStep) {
             setTryOnCurrentStep(status.currentStep);
             // Map detailed steps to UI steps
             switch (status.currentStep) {
               case 'validating_avatar':
                 setTryOnStep('validating_avatar');
                 break;
               case 'processing_image':
                 setTryOnStep('processing_image');
                 break;
               case 'generating_video':
                 setTryOnStep('generating_video');
                 break;
               case 'completed':
                 setTryOnStep('complete');
                 break;
               default:
                 setTryOnStep('processing_image');
             }
           }
           
           if (status?.status === 'completed') {
             setTryOnStep('complete');
             setTryOnProgress(100);
             setTryOnResults({
               resultImageUrl: status.resultImageUrl,
               resultVideoUrl: status.resultVideoUrl,
               processingTime: status.processingTime,
               qualityScore: status.qualityScore,
               tryOnId: status.tryOnId
             });
             setIsProcessingTryOn(false);
             console.log('✅ Try-on completed successfully:', status);
           } else if (status?.status === 'failed') {
             setIsProcessingTryOn(false);
             setTryOnStep('idle');
             setTryOnProgress(0);
             const errorMessage = status.errorMessage || 'Virtual try-on processing failed. Please try again.';
             Alert.alert('Try-On Failed', errorMessage);
             console.log('❌ Try-on failed:', status);
           } else if (!status) {
             console.log('⚠️ Received null status in try-on polling');
           }
         }
       );
       
     } catch (error) {
      console.error('Virtual try-on error:', error);
      setIsProcessingTryOn(false);
      setTryOnStep('idle');
      
      // Show specific error message if available
      const errorMessage = error?.message || error?.error?.message || 'Failed to process virtual try-on. Please try again.';
      Alert.alert('Error', errorMessage);
      console.log('Error details:', {
        message: error?.message,
        error: error?.error,
        full: error
      });
    }
  };

  // Enhanced Avatar Creation Flow
  const AvatarCreationFlow = () => {
    const handleCameraCapture = async () => {
      try {
        if (!cameraPermission?.granted) {
          const permission = await requestCameraPermission();
          if (!permission.granted) {
            Alert.alert('Permission needed', 'Camera access is required to create your avatar');
            return;
          }
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [3, 4],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          setCapturedImage(result.assets[0].uri);
          setAvatarCreationStep('processing');
          await processAvatarCreation(result.assets[0].uri);
        }
      } catch (error) {
        console.error('Camera capture error:', error);
        Alert.alert('Error', 'Failed to capture image');
      }
    };

    const handlePhotoLibrary = async () => {
      try {
        if (!mediaPermission?.granted) {
          const permission = await requestMediaPermission();
          if (!permission.granted) {
            Alert.alert('Permission needed', 'Photo library access is required');
            return;
          }
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [3, 4],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          setCapturedImage(result.assets[0].uri);
          setAvatarCreationStep('processing');
          await processAvatarCreation(result.assets[0].uri);
        }
      } catch (error) {
        console.error('Photo library error:', error);
        Alert.alert('Error', 'Failed to select image');
      }
    };

         const processAvatarCreation = async (imageUri: string) => {
       setIsProcessingAvatar(true);
       setAvatarProcessingProgress(0);
 
       try {
         // Get current user ID - simplified without complex auth timeout handling
         const { data: { session } } = await supabase.auth.getSession();
         
         // For development/testing: Use a fallback user ID if no session
         const userId = session?.user?.id || 'anonymous-user-' + Date.now();
         
         console.log('Processing avatar for user:', userId);
         
         // Start avatar creation
          const result = await supabaseEdgeFunctionService.createAvatar({
            imageUri,
            userId: userId
          });
  
          // Poll for completion
          supabaseEdgeFunctionService.pollProcessingStatus(
           'avatar',
           result.avatarId,
           (status) => {
             // Update progress based on status
             console.log('📊 Avatar polling status update:', status);
             if (status?.status === 'processing') {
               setAvatarProcessingProgress(70);
             } else if (status?.status === 'completed') {
               setAvatarProcessingProgress(100);
               setAvatarCreationStep('complete');
               setIsProcessingAvatar(false);
               console.log('Avatar creation completed:', status);
               // Reload avatars to show the new one
               loadUserAvatars();
             } else if (status?.status === 'failed' || status?.status === 'timeout') {
               setIsProcessingAvatar(false);
               Alert.alert('Error', status?.message || 'Avatar processing failed. Please try again.');
               setAvatarCreationStep('prompt');
             } else if (!status) {
               console.log('⚠️ Received null status in polling callback');
             }
           }
         );
         
       } catch (error) {
         console.error('Avatar processing error:', error);
         setIsProcessingAvatar(false);
         Alert.alert('Error', 'Failed to process avatar. Please try again.');
         setAvatarCreationStep('prompt');
       }
     };

    return (
      <Modal visible={showAvatarPrompt} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.avatarPromptContainer, avatarCreationStep === 'processing' && styles.processingContainer]}>
            
            {avatarCreationStep === 'prompt' && (
              <>
                <TouchableOpacity 
                  style={styles.floatingCloseButton}
                  onPress={() => setShowAvatarPrompt(false)}
                >
                  <X size={18} color="#fff" />
                </TouchableOpacity>
                
                <Text style={styles.avatarPromptTitle}>Create Your Avatar</Text>
                <Text style={styles.avatarPromptText}>
                  Upload a photo to create your personalized avatar for virtual try-ons
                </Text>
                
                <View style={styles.photoOptionsContainer}>
                  <TouchableOpacity 
                    style={[styles.photoOptionCard, styles.cameraCard]}
                    onPress={handleCameraCapture}
                  >
                    <View style={styles.photoOptionIcon}>
                      <Camera size={24} color="#fff" />
                    </View>
                    <Text style={styles.photoOptionTitle}>Take Photo</Text>
                    <Text style={styles.photoOptionSubtitle}>Use camera</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.photoOptionCard, styles.galleryCard]}
                    onPress={handlePhotoLibrary}
                  >
                    <View style={[styles.photoOptionIcon, styles.galleryIcon]}>
                      <Upload size={24} color={colors.primary} />
                    </View>
                    <Text style={[styles.photoOptionTitle, styles.galleryTitle]}>Choose from Gallery</Text>
                    <Text style={[styles.photoOptionSubtitle, styles.gallerySubtitle]}>Select existing photo</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {avatarCreationStep === 'processing' && (
              <>
                <ActivityIndicator size="large" color={colors.primary} style={styles.processingSpinner} />
                <Text style={styles.processingTitle}>Creating Your Avatar</Text>
                <Text style={styles.processingText}>
                  Processing your photo with AI magic...
                </Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${avatarProcessingProgress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{avatarProcessingProgress}%</Text>
                </View>
                {capturedImage && (
                  <Image source={{ uri: capturedImage }} style={styles.processingPreview} />
                )}
              </>
            )}

            {avatarCreationStep === 'complete' && (
              <>
                <View style={styles.successIcon}>
                  <Star size={40} color={colors.primary} fill={colors.primary} />
                </View>
                <Text style={styles.avatarPromptTitle}>Avatar Created!</Text>
                <Text style={styles.avatarPromptText}>
                  Your personalized avatar is ready for virtual try-ons
                </Text>
                <TouchableOpacity 
                  style={[styles.avatarPromptButton, styles.avatarPromptButtonPrimary]}
                  onPress={() => {
                    setShowAvatarPrompt(false);
                    setAvatarCreationStep('prompt');
                  }}
                >
                  <Text style={styles.avatarPromptButtonTextPrimary}>Start Trying On!</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const handlePhotosUploaded = async (photos: { front?: string; side?: string; back?: string }) => {
    // Close photo upload screen
    setShowPhotoUpload(false);
    
    // Open the avatar settings drawer (right sidebar)
    setIsRightSidebarCollapsed(false);
    setIsLeftSidebarCollapsed(true); // Ensure left drawer is closed
    
    // Start avatar creation process
    setAvatarCreationStep('processing');
    setIsProcessingAvatar(true);
    setAvatarProcessingProgress(0);
    
    try {
      // Get current user ID - simplified approach
      const { data: { session } } = await supabase.auth.getSession();
      
      // For development/testing: Use a fallback user ID if no session
      const userId = session?.user?.id || 'anonymous-user-' + Date.now();
      
      // Use the front image for avatar creation
      const frontImage = photos.front;
      if (!frontImage) {
        throw new Error('Front view image is required');
      }
      
      console.log('Processing avatar with photos for user:', userId);
      
      // Start avatar creation
      const result = await supabaseEdgeFunctionService.createAvatar({
        imageUri: frontImage,
        userId: userId
      });

      // Poll for completion with progress updates
      supabaseEdgeFunctionService.pollProcessingStatus(
        'avatar',
        result.avatarId,
        (status) => {
          // Update progress based on status
          if (status.status === 'processing') {
            if (status.step === 'background_removal') {
              setAvatarProcessingProgress(25);
            } else if (status.step === 'enhancement') {
              setAvatarProcessingProgress(50);
            } else if (status.step === 'generation') {
              setAvatarProcessingProgress(75);
            }
          } else if (status.status === 'completed') {
            setAvatarProcessingProgress(100);
            setAvatarCreationStep('complete');
            setIsProcessingAvatar(false);
            console.log('Avatar creation completed:', status);
            // Reload avatars to show the new one
            loadUserAvatars();
            
            // Optionally close the avatar drawer after a delay
            setTimeout(() => {
              setIsRightSidebarCollapsed(true);
            }, 2000);
          } else if (status.status === 'failed') {
            setIsProcessingAvatar(false);
            setAvatarCreationStep('prompt');
            Alert.alert('Error', 'Avatar processing failed. Please try again.');
          }
        }
      );
      
    } catch (error) {
      console.error('Avatar processing error:', error);
      setIsProcessingAvatar(false);
      setAvatarCreationStep('prompt');
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to process avatar. Please try again.';
      Alert.alert('Avatar Creation Error', errorMessage);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <AvatarCreationFlow />
      
      {/* Photo Upload Screen */}
      <PhotoUploadScreen
        visible={showPhotoUpload}
        onClose={() => setShowPhotoUpload(false)}
        onPhotosUploaded={handlePhotosUploaded}
      />

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
                      <Image 
                        source={
                          typeof item.image === 'string' 
                            ? { uri: item.image }
                            : item.image
                        } 
                        style={styles.wardrobeItemImage} 
                      />
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
                source={
                  avatarSettings.selectedType === 'default' 
                    ? (modelOptions.find(model => model.id === avatarSettings.selectedId)?.image || sampleAvatar.image)
                    : (
                        userAvatars.find(avatar => avatar.id === avatarSettings.selectedId)?.avatar_url || 
                        userAvatars.find(avatar => avatar.id === avatarSettings.selectedId)?.original_image_url
                      ) 
                      ? { uri: userAvatars.find(avatar => avatar.id === avatarSettings.selectedId)?.avatar_url || userAvatars.find(avatar => avatar.id === avatarSettings.selectedId)?.original_image_url }
                      : sampleAvatar.image
                }
                style={styles.avatarImage}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Floating Control Icons - Top Left and Right - Only show when respective drawers are closed */}
            {isLeftSidebarCollapsed && isRightSidebarCollapsed && (
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

            {isRightSidebarCollapsed && isLeftSidebarCollapsed && (
              <TouchableOpacity 
                style={[styles.floatingIcon, styles.floatingIconRight]}
                onPress={() => {
                  setIsRightSidebarCollapsed(false);
                  setIsLeftSidebarCollapsed(true); // Close left drawer when opening right
                }}
              >
                                  <User size={24} color={colors.text.primary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Individual Square Floating Cards for Selected Items - Hide when avatar drawer is open */}
          {isRightSidebarCollapsed && (
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
                    <Image 
                      source={
                        typeof item.image === 'string' 
                          ? { uri: item.image }
                          : item.image
                      } 
                      style={styles.squareItemImage} 
                    />
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
          )}

          {/* Floating Try-On Action Button - Hide when any drawer is open */}
          {hasClothesForTryOn && !isProcessingTryOn && isRightSidebarCollapsed && isLeftSidebarCollapsed && (
            <TouchableOpacity
              style={styles.floatingTryOnButton}
              onPress={handleVirtualTryOn}
              activeOpacity={0.8}
            >
              <View style={styles.tryOnButtonGlow} />
              <PlayCircle size={24} color="#fff" />
              <Text style={styles.floatingTryOnButtonText}>Try On Now</Text>
            </TouchableOpacity>
          )}
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
              
              {/* Avatar Selection */}
              <View style={styles.controlSection}>
                <Text style={styles.controlSectionTitle}>Avatar</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScrollContainer}
                  contentContainerStyle={styles.horizontalScrollContent}
                >
                  {/* Add/Create Avatar */}
                  <TouchableOpacity 
                    style={styles.avatarOptionContainer}
                    onPress={() => setShowPhotoUpload(true)}
                    disabled={isProcessingAvatar}
                  >
                    <View style={styles.addAvatarBox}>
                      <Camera size={24} color={colors.text.secondary} />
                      <Text style={styles.addAvatarText}>Add</Text>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Processing Avatar - Show when creating new avatar */}
                  {isProcessingAvatar && (
                    <View style={[styles.avatarOptionContainer, styles.processingAvatarContainer]}>
                      <View style={styles.processingAvatarBox}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.processingAvatarText}>Creating...</Text>
                        <View style={styles.progressBarFinal}>
                          <View 
                            style={[
                              styles.progressFillFinal, 
                              { width: `${avatarProcessingProgress}%` }
                            ]} 
                          />
                        </View>
                        <Text style={styles.progressTextFinal}>{avatarProcessingProgress}%</Text>
                      </View>
                    </View>
                  )}
                  
                  {/* User's Created Avatars */}
                  {userAvatars.map((avatar, index) => (
                    <TouchableOpacity 
                      key={avatar.id}
                      style={[
                        styles.avatarOptionContainer, 
                        avatarSettings.selectedType === 'user' && avatarSettings.selectedId === avatar.id && styles.selectedAvatarContainer
                      ]}
                      onPress={() => {
                        setAvatarSettings({ selectedId: avatar.id, selectedType: 'user' });
                        console.log('Selected user avatar:', avatar.id);
                      }}
                    >
                      <Image 
                        source={{ uri: avatar.avatar_url || avatar.original_image_url }}
                        style={styles.avatarOptionImage}
                        resizeMode="cover"
                      />
                      {avatarSettings.selectedType === 'user' && avatarSettings.selectedId === avatar.id && (
                        <View style={styles.primaryAvatarBadge}>
                          <Text style={styles.primaryAvatarBadgeText}>Selected</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                  
                  {/* Show current sample avatar if no user avatars exist */}
                  {userAvatars.length === 0 && (
                    <TouchableOpacity style={[styles.avatarOptionContainer, styles.selectedAvatarContainer]}>
                      <Image 
                        source={sampleAvatar.image} 
                        style={styles.avatarOptionImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  )}
                  
                  {/* Placeholder for additional avatars */}
                  <TouchableOpacity style={styles.avatarOptionContainer}>
                    <View style={styles.placeholderAvatarBox}>
                      <User size={20} color={colors.text.secondary} />
                    </View>
                  </TouchableOpacity>
                </ScrollView>
              </View>


              {/* Models Controls */}
              <View style={styles.controlSection}>
                <Text style={styles.controlSectionTitle}>Default Models ({modelOptions.length})</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScrollContainer}
                  contentContainerStyle={styles.horizontalScrollContent}
                >
                  {modelOptions.map((model) => (
                    <TouchableOpacity
                      key={model.id}
                      style={[
                        styles.modelOptionContainer,
                        avatarSettings.selectedType === 'default' && avatarSettings.selectedId === model.id && styles.selectedModelContainer
                      ]}
                      onPress={() => setAvatarSettings({ selectedId: model.id, selectedType: 'default' })}
                    >
                      <View style={[
                        styles.modelImageContainer,
                        avatarSettings.selectedType === 'default' && avatarSettings.selectedId === model.id && styles.selectedModelImageContainer
                      ]}>
                        <Image 
                          source={model.image} 
                          style={styles.modelImage}
                          resizeMode="cover"
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Virtual Try-On Processing Overlay with Enhanced Progress */}
      {isProcessingTryOn && (
        <Modal visible={isProcessingTryOn} transparent animationType="fade">
          <View style={styles.processingOverlay}>
            <View style={styles.processingCard}>
              <ActivityIndicator size="large" color={colors.primary} style={styles.processingSpinner} />
              
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${tryOnProgress}%` }]} />
                </View>
                <Text style={styles.progressText}>{tryOnProgress}%</Text>
              </View>
              
              <Text style={styles.processingTitle}>
                {tryOnStep === 'validating_avatar' && 'Validating Avatar...'}
                {tryOnStep === 'processing_image' && 'Processing Try-On...'}
                {tryOnStep === 'generating_video' && 'Creating Video...'}
                {tryOnStep === 'finalizing' && 'Finalizing...'}
                {tryOnStep === 'complete' && 'Almost Ready!'}
              </Text>
              <Text style={styles.processingText}>
                {tryOnStep === 'validating_avatar' && 'Preparing your avatar for the try-on session'}
                {tryOnStep === 'processing_image' && 'Analyzing your outfit and fitting it to your avatar'}
                {tryOnStep === 'generating_video' && 'Generating a beautiful video showcase of your look'}
                {tryOnStep === 'finalizing' && 'Adding final touches and saving your results'}
                {tryOnStep === 'complete' && 'Your virtual try-on is complete!'}
              </Text>
              
              {/* Current Step Indicator */}
              {tryOnCurrentStep && (
                <Text style={styles.stepIndicator}>
                  Step: {tryOnCurrentStep.replace(/_/g, ' ').toLowerCase()}
                </Text>
              )}
              
              {/* Show selected items being processed */}
              <View style={styles.processingItemsContainer}>
                {Object.entries(currentOutfit).map(([category, item]) => (
                  item && (
                    <View key={category} style={styles.processingItem}>
                      <Image 
                        source={
                          typeof item.image === 'string' 
                            ? { uri: item.image }
                            : item.image
                        } 
                        style={styles.processingItemImage} 
                      />
                    </View>
                  )
                ))}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Try-On Results Modal */}
      {tryOnResults && (
        <Modal visible={!!tryOnResults} transparent animationType="slide">
          <View style={styles.resultsOverlay}>
            <View style={styles.resultsContainer}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Your Try-On Result</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => {
                    setTryOnResults(null);
                    setTryOnStep('idle');
                  }}
                >
                  <X size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.resultsContent} showsVerticalScrollIndicator={false}>
                {/* Result Image */}
                {console.log('🖼️ Try-on results:', tryOnResults)}
                {tryOnResults?.resultImageUrl ? (
                  <View style={styles.resultImageContainer}>
                    <Image 
                      source={{ uri: tryOnResults.resultImageUrl }} 
                      style={styles.resultImage}
                      resizeMode="contain"
                      onError={(error) => console.log('❌ Image load error:', error)}
                      onLoad={() => console.log('✅ Image loaded successfully')}
                    />
                  </View>
                ) : (
                  <View style={styles.resultImageContainer}>
                    <Text style={{ textAlign: 'center', color: 'gray' }}>
                      No image URL found in results
                    </Text>
                    <Text style={{ fontSize: 10, color: 'gray', marginTop: 5 }}>
                      Results: {JSON.stringify(tryOnResults)}
                    </Text>
                  </View>
                )}
                
                <Text style={styles.resultsDescription}>
                  How does this outfit look on you?
                </Text>
                
                {/* Action buttons */}
                <View style={styles.resultsActions}>
                  <TouchableOpacity style={styles.resultActionButton}>
                    <Save size={20} color={colors.primary} />
                    <Text style={styles.resultActionText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.resultActionButton}>
                    <Share size={20} color={colors.primary} />
                    <Text style={styles.resultActionText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.resultActionButton}>
                    <Bookmark size={20} color={colors.primary} />
                    <Text style={styles.resultActionText}>Add to Wardrobe</Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={styles.tryAnotherButton}
                  onPress={() => {
                    setTryOnResults(null);
                    setTryOnStep('idle');
                  }}
                >
                  <Text style={styles.tryAnotherButtonText}>Try Another Outfit</Text>
                </TouchableOpacity>
                
                {/* Bottom padding for safe scrolling */}
                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}


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
  } as ImageStyle,
  
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

  // Processing Styles
  processingContainer: {
    padding: 20,
  },
  
  processingSpinner: {
    marginBottom: 16,
  },

  progressContainer: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },

  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: colors.background.secondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },

  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  stepIndicator: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  
  processingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  
  processingText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  progressContainer: {
    marginBottom: 16,
  },
  
  progressBar: {
    height: 16,
    backgroundColor: colors.background.off,
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  
  processingPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  } as ImageStyle,
  
  successIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  
  avatarPromptButtonOutline: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  
  avatarPromptButtonTextOutline: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  floatingCloseButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 10,
  },

  photoOptionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  photoOptionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 120,
  },

  cameraCard: {
    backgroundColor: colors.primary,
  },

  galleryCard: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },

  photoOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  galleryIcon: {
    backgroundColor: colors.primary,
  },

  photoOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },

  galleryTitle: {
    color: colors.primary,
  },

  photoOptionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  gallerySubtitle: {
    color: colors.textSecondary,
  },

  // Pose Grid Styles
  poseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  poseButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.off,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  
  selectedPoseButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  poseEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  
  poseButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  
  selectedPoseText: {
    color: '#fff',
  },

  // Selected Control Button Styles
  selectedControlButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  selectedControlButtonText: {
    color: '#fff',
  },

  // Floating Try-On Button - Centered
  floatingTryOnButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -25 }], // Approximate centering adjustment
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  
  floatingTryOnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Processing Overlay Styles
  processingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  processingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  
  processingItemsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  
  processingItem: {
    alignItems: 'center',
  },
  
  processingItemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },

  // Results Modal Styles
  resultsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  
  resultsContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    flex: 1,
  },
  
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  
  closeButton: {
    padding: 8,
  },
  
  resultsContent: {
    padding: 20,
  },
  
  resultImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: colors.background.off,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  resultImage: {
    width: '100%',
    height: 400,
    backgroundColor: colors.background.off,
  },
  
  resultsDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  
  resultsActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  
  resultActionButton: {
    alignItems: 'center',
    gap: 8,
  },
  
  resultActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  
  tryAnotherButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  
  tryAnotherButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // New Horizontal Scrolling Styles
  horizontalScrollContainer: {
    marginTop: 8,
  },
  
  horizontalScrollContent: {
    paddingHorizontal: 8,
    gap: 12,
  },

  // Avatar Option Styles
  avatarOptionContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  
  selectedAvatarContainer: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  
  avatarOptionImage: {
    width: '100%',
    height: '100%',
  },
  
  addAvatarBox: {
    flex: 1,
    backgroundColor: colors.background.off,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  
  addAvatarText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  
  placeholderAvatarBox: {
    flex: 1,
    backgroundColor: colors.background.off,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryAvatarBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 4,
  },

  primaryAvatarBadgeText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Pose Option Styles
  poseOptionContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.light,
    overflow: 'hidden',
    alignItems: 'center',
  },
  
  selectedPoseContainer: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  
  poseOptionImage: {
    width: '100%',
    height: 60,
  },
  
  poseIconContainer: {
    flex: 1,
    backgroundColor: colors.background.off,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 60,
  },
  
  poseOptionText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 4,
    backgroundColor: '#fff',
    width: '100%',
  },

  // Background Option Styles
  backgroundOptionContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  selectedBackgroundContainer: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  
  backgroundIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.background.off,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  
  selectedBackgroundIcon: {
    backgroundColor: colors.primary,
  },
  
  backgroundOptionText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  
  selectedBackgroundText: {
    color: colors.primary,
  },

  // Model Option Styles
  modelOptionContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.light,
    overflow: 'hidden',
    alignItems: 'center',
  },
  
  selectedModelContainer: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  
  modelImageContainer: {
    width: '100%',
    height: 60,
    overflow: 'hidden',
  },
  
  selectedModelImageContainer: {
    // Additional styling for selected state if needed
  },
  
  modelImage: {
    width: '100%',
    height: '100%',
  },
  
  modelOptionText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 4,
    backgroundColor: '#fff',
    width: '100%',
  },
  
  selectedModelText: {
    color: colors.primary,
  },

  modelInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },

  modelDescriptionText: {
    fontSize: 8,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  selectedModelDescriptionText: {
    color: colors.primary,
  },

  // Processing Avatar Styles
  processingAvatarContainer: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  
  processingAvatarBox: {
    flex: 1,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  
  processingAvatarText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.primary,
  },
  
  // Final unified progress styles
  progressBarFinal: {
    width: '80%',
    height: 4,
    backgroundColor: colors.border.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  
  progressFillFinal: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  
  progressTextFinal: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
});