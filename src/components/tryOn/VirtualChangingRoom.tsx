import React, { useState, useRef, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Share, 
  ShoppingBag, 
  Bookmark,
  User,
  Shirt,
  Package,
  Sparkles,
  Camera,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';

// Sample avatar data - will be replaced with n8n workflow
const sampleAvatar = {
  id: 'user-avatar-1',
  name: 'Your Avatar',
  image: '/models/20250408_1616_Stylish_Simplicity_Display_remix_01jrbgr0zrf1887vc81r8rs7ky.png',
  customizations: {
    background: 'studio',
    pose: 'standing',
    zoom: 1
  }
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

interface VirtualChangingRoomProps {
  userHasAvatar?: boolean;
}

export function VirtualChangingRoom({ userHasAvatar = false }: VirtualChangingRoomProps) {
  // State management
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentOutfit, setCurrentOutfit] = useState(initialOutfitState);
  const [avatarSettings, setAvatarSettings] = useState(sampleAvatar.customizations);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showAvatarPrompt, setShowAvatarPrompt] = useState(!userHasAvatar);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileWardrobe, setShowMobileWardrobe] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);

  // Check for mobile viewport (React Native version)
  useEffect(() => {
    const { width } = Dimensions.get('window');
    setIsMobile(width < 768);
  }, []);

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

  // Handle item try-on
  const handleTryOnItem = (item: any) => {
    setCurrentOutfit(prev => ({
      ...prev,
      [item.category]: item
    }));
    if (isMobile) {
      setShowMobileWardrobe(false);
    }
  };

  // Handle remove item from outfit
  const handleRemoveItem = (category: string) => {
    setCurrentOutfit(prev => ({
      ...prev,
      [category]: null
    }));
  };

  // Handle virtual try-on process
  const handleVirtualTryOn = () => {
    if (!hasClothesForTryOn) return;
    
    // Convert current outfit to clothing items array
    const clothingItems = Object.values(currentOutfit)
      .filter(Boolean)
      .flat();
    
    // TODO: Trigger VirtualTryOnEngine component
    console.log('Starting virtual try-on with outfit:', clothingItems);
    // This would open the VirtualTryOnEngine modal
  };

  // Avatar creation prompt
  const AvatarCreationPrompt = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <Text variant="large" className="font-semibold mb-2">Create Your Avatar</Text>
        <Text variant="body" className="text-gray-600 mb-6">
          To get started with the virtual changing room, you'll need to create your personalized avatar.
        </Text>
        <div className="space-y-3">
          <Button 
            className="w-full"
            onClick={() => {
              // TODO: Trigger AvatarCreationFlow component
              setShowAvatarPrompt(false);
              // This would open the AvatarCreationFlow modal
            }}
          >
            Create Avatar
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowAvatarPrompt(false)}
          >
            Use Default Avatar
          </Button>
        </div>
      </div>
    </div>
  );

  // Mobile Bottom Sheet for Wardrobe
  const MobileWardrobeSheet = () => (
    <div className={`fixed inset-0 z-40 transition-transform duration-300 ${
      showMobileWardrobe ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setShowMobileWardrobe(false)}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-4 border-b border-gray-200">
          <Text variant="large" className="font-semibold">Your Wardrobe</Text>
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 pb-bottom-nav">
          <div className="grid grid-cols-3 gap-3 pb-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden active:scale-95 transition-transform"
                onClick={() => handleTryOnItem(item)}
              >
                <div className="aspect-square relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                  {item.isFavorite && (
                    <Heart className="absolute top-2 right-2 w-3 h-3 text-red-500 fill-current" />
                  )}
                </div>
                <div className="p-2">
                  <Text variant="small" className="font-medium text-gray-900 line-clamp-1 text-xs">
                    {item.name}
                  </Text>
                  <Text variant="small" className="text-gray-500 text-xs">
                    ${item.price}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Bottom Sheet for Actions
  const MobileActionsSheet = () => (
    <div className={`fixed inset-0 z-40 transition-transform duration-300 ${
      showMobileActions ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setShowMobileActions(false)}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-4 border-b border-gray-200">
          <Text variant="large" className="font-semibold">Current Look</Text>
        </div>

        {/* Current Outfit Display */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-bottom-nav">
          {/* Outfit Items */}
          <div className="space-y-3">
            {Object.entries(currentOutfit).map(([category, item]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Text variant="small" className="font-medium capitalize text-gray-900">
                    {category}
                  </Text>
                  {item && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(category)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      ×
                    </Button>
                  )}
                </div>
                {item ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 relative rounded-md overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text variant="small" className="font-medium text-gray-900 line-clamp-1">
                        {item.name}
                      </Text>
                      <Text variant="small" className="text-gray-500 text-xs">
                        ${item.price}
                      </Text>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-12 bg-gray-50 rounded-md border-2 border-dashed border-gray-300">
                    <Text variant="small" className="text-gray-400 text-xs">
                      No item selected
                    </Text>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Total Price */}
          {totalOutfitPrice > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <Text variant="small" className="font-medium text-gray-900">
                  Total Outfit Price
                </Text>
                <Text variant="body" className="font-semibold text-gray-900">
                  ${totalOutfitPrice.toFixed(2)}
                </Text>
              </div>
            </div>
          )}

          {/* Extra padding at bottom */}
          <div className="pb-4"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 p-4 pb-8">
          {/* Main Try-On Button */}
          <Button 
            className={`w-full flex items-center justify-center space-x-2 transition-all duration-300 transform ${
              hasClothesForTryOn
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-105' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } ${hasClothesForTryOn ? 'animate-pulse' : ''}`}
            style={hasClothesForTryOn ? { 
              boxShadow: '0 0 20px rgba(147, 51, 234, 0.4), 0 0 40px rgba(147, 51, 234, 0.2), 0 0 80px rgba(147, 51, 234, 0.1)' 
            } : {}}
            onClick={handleVirtualTryOn}
            disabled={!hasClothesForTryOn}
          >
            <Shirt className="w-5 h-5" />
            <span className="font-semibold">
              {hasClothesForTryOn ? 'Try On Virtual Look' : 'Add Clothes to Try On'}
            </span>
          </Button>

          <Button className="w-full flex items-center justify-center space-x-2">
            <Heart className="w-4 h-4" />
            <span>Save This Look</span>
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="flex items-center justify-center space-x-1">
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>
            <Button variant="outline" className="flex items-center justify-center space-x-1">
              <Bookmark className="w-4 h-4" />
              <span>Wishlist</span>
            </Button>
          </div>

          <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Shop These Items</span>
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        {/* Avatar Creation Prompt */}
        {showAvatarPrompt && <AvatarCreationPrompt />}

        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 p-4 safe-area-top">
          <div className="flex items-center justify-between">
            <Text variant="large" className="font-semibold">Virtual Changing Room</Text>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="p-2">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Avatar Canvas */}
        <div className="flex-1 flex items-center justify-center p-4 pb-6">
          <div className="relative w-full max-w-sm h-full max-h-[65vh] bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100" />
            
            {/* Avatar Display */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative w-4/5 h-4/5">
                <Image
                  src={sampleAvatar.image}
                  alt="Your Avatar"
                  fill
                  className="object-contain"
                  sizes="300px"
                  priority
                />
              </div>
            </div>

            {/* Avatar Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3">
                <Text variant="small" className="font-medium text-gray-900">
                  {sampleAvatar.name}
                </Text>
                <Text variant="small" className="text-gray-500 text-xs">
                  Studio Background • Standing Pose
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="absolute left-4 right-4 flex justify-center space-x-3 z-10" style={{ bottom: '92px' }}>
          <Button
            variant="outline"
            className="bg-white shadow-lg flex items-center space-x-2 px-4 py-2"
            onClick={() => setShowMobileWardrobe(true)}
          >
            <Shirt className="w-4 h-4" />
            <span>Wardrobe</span>
          </Button>
          <Button
            variant="outline"
            className="bg-white shadow-lg flex items-center space-x-2 px-4 py-2"
            onClick={() => setShowMobileActions(true)}
          >
            <Heart className="w-4 h-4" />
            <span>Current Look</span>
          </Button>
        </div>

        {/* Mobile Bottom Sheets */}
        <MobileWardrobeSheet />
        <MobileActionsSheet />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Avatar Creation Prompt */}
      {showAvatarPrompt && <AvatarCreationPrompt />}

      {/* Left Sidebar - Wardrobe & Tools */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isLeftSidebarCollapsed ? 'w-16' : 'w-80'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!isLeftSidebarCollapsed && (
                <Text variant="large" className="font-semibold">Your Wardrobe</Text>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
                className="p-2"
              >
                {isLeftSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
              </Button>
            </div>
          </div>

          {!isLeftSidebarCollapsed && (
            <>
              {/* Category Filter */}
              <div className="p-4 border-b border-gray-200">
                <div className="space-y-2">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 mr-2" />
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wardrobe Items */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-3">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={() => handleTryOnItem(item)}
                    >
                      <div className="aspect-square relative">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="150px"
                        />
                        {item.isFavorite && (
                          <Heart className="absolute top-2 right-2 w-4 h-4 text-red-500 fill-current" />
                        )}
                        {hoveredItem === item.id && (
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                            <Text variant="small" className="text-white font-medium">Try On</Text>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <Text variant="small" className="font-medium text-gray-900 line-clamp-1">
                          {item.name}
                        </Text>
                        <Text variant="small" className="text-gray-500 text-xs">
                          ${item.price}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Canvas Area - Avatar Display */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-100 to-gray-200">
        {/* Canvas Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <Text variant="large" className="font-semibold">Virtual Changing Room</Text>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="p-2">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Avatar Canvas */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="relative w-full max-w-md h-full max-h-[600px] bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100" />
            
            {/* Avatar Display */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative w-4/5 h-4/5">
                <Image
                  src={sampleAvatar.image}
                  alt="Your Avatar"
                  fill
                  className="object-contain"
                  sizes="400px"
                  priority
                />
                
                {/* Drop Zones - Visual indicators for drag & drop */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Top area for tops/outerwear */}
                  <div className="absolute top-1/4 left-1/4 right-1/4 h-1/3 border-2 border-dashed border-transparent hover:border-blue-300 transition-colors" />
                  
                  {/* Bottom area for bottoms */}
                  <div className="absolute bottom-1/4 left-1/3 right-1/3 h-1/3 border-2 border-dashed border-transparent hover:border-blue-300 transition-colors" />
                  
                  {/* Feet area for shoes */}
                  <div className="absolute bottom-0 left-1/3 right-1/3 h-1/6 border-2 border-dashed border-transparent hover:border-blue-300 transition-colors" />
                </div>
              </div>
            </div>

            {/* Avatar Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3">
                <Text variant="small" className="font-medium text-gray-900">
                  {sampleAvatar.name}
                </Text>
                <Text variant="small" className="text-gray-500 text-xs">
                  Studio Background • Standing Pose
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Actions & Current Look */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <Text variant="large" className="font-semibold">Current Look</Text>
        </div>

        {/* Current Outfit Display */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Outfit Items */}
          <div className="space-y-3">
            {Object.entries(currentOutfit).map(([category, item]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Text variant="small" className="font-medium capitalize text-gray-900">
                    {category}
                  </Text>
                  {item && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(category)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      ×
                    </Button>
                  )}
                </div>
                {item ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 relative rounded-md overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text variant="small" className="font-medium text-gray-900 line-clamp-1">
                        {item.name}
                      </Text>
                      <Text variant="small" className="text-gray-500 text-xs">
                        ${item.price}
                      </Text>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-12 bg-gray-50 rounded-md border-2 border-dashed border-gray-300">
                    <Text variant="small" className="text-gray-400 text-xs">
                      No item selected
                    </Text>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Total Price */}
          {totalOutfitPrice > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <Text variant="small" className="font-medium text-gray-900">
                  Total Outfit Price
                </Text>
                <Text variant="body" className="font-semibold text-gray-900">
                  ${totalOutfitPrice.toFixed(2)}
                </Text>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          {/* Main Try-On Button */}
          <Button 
            className={`w-full flex items-center justify-center space-x-2 transition-all duration-300 transform ${
              hasClothesForTryOn
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-105' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } ${hasClothesForTryOn ? 'animate-pulse' : ''}`}
            style={hasClothesForTryOn ? { 
              boxShadow: '0 0 20px rgba(147, 51, 234, 0.4), 0 0 40px rgba(147, 51, 234, 0.2), 0 0 80px rgba(147, 51, 234, 0.1)' 
            } : {}}
            onClick={handleVirtualTryOn}
            disabled={!hasClothesForTryOn}
          >
            <Shirt className="w-5 h-5" />
            <span className="font-semibold">
              {hasClothesForTryOn ? 'Try On Virtual Look' : 'Add Clothes to Try On'}
            </span>
          </Button>
          
          <Button className="w-full flex items-center justify-center space-x-2">
            <Heart className="w-4 h-4" />
            <span>Save This Look</span>
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="flex items-center justify-center space-x-1">
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>
            <Button variant="outline" className="flex items-center justify-center space-x-1">
              <Bookmark className="w-4 h-4" />
              <span>Wishlist</span>
            </Button>
          </div>

          <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Shop These Items</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 