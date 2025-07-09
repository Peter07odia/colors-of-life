import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Heart,
  Shirt,
  Package,
  Sparkles,
} from 'lucide-react-native';

import { colors } from '../../constants/colors';
import { fashionItemService, FashionItem, Category } from '../../services/fashionItemService';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

// Default categories for fallback
const defaultCategories = [
  { id: 'all', label: 'All items' },
  { id: 'tops', label: 'Tops' },
  { id: 'bottoms', label: 'Bottoms' },
  { id: 'dresses', label: 'Dresses' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'accessory', label: 'Accessory' },
];

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
    dateAdded: '2024-01-15',
  },
  {
    id: 'item-2',
    name: 'Blue Denim Jeans',
    category: 'bottoms',
    price: 79.99,
    brand: 'Denim Brand',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=400&fit=crop',
    isFavorite: false,
    dateAdded: '2024-01-14',
  },
  {
    id: 'item-3',
    name: 'Black Leather Jacket',
    category: 'outerwear',
    price: 199.99,
    brand: 'Premium Leather',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=400&fit=crop',
    isFavorite: true,
    dateAdded: '2024-01-13',
  },
  {
    id: 'item-4',
    name: 'White Sneakers',
    category: 'footwear',
    price: 89.99,
    brand: 'Sport Brand',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop',
    isFavorite: false,
    dateAdded: '2024-01-12',
  },
  {
    id: 'item-5',
    name: 'Red Summer Dress',
    category: 'dresses',
    price: 49.99,
    brand: 'Summer Co.',
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=300&h=400&fit=crop',
    isFavorite: true,
    dateAdded: '2024-01-11',
  },
  {
    id: 'item-6',
    name: 'Gold Necklace',
    category: 'accessory',
    price: 79.99,
    brand: 'Jewelry Co.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=400&fit=crop',
    isFavorite: false,
    dateAdded: '2024-01-10',
  },
];

export default function WardrobeScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [fashionItems, setFashionItems] = useState<FashionItem[]>([]);
  const [favorites, setFavorites] = useState<FashionItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);


  const loadItems = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading wardrobe items, favorites, and categories...');
      
      // Load items, favorites, and categories
      const [items, favs, cats] = await Promise.all([
        fashionItemService.getFashionItems(20),
        fashionItemService.getUserFavorites('wardrobe'),
        fashionItemService.getCategories()
      ]);
      
      console.log('📦 Loaded data:', {
        items: items.length,
        favorites: favs.length,
        categories: cats.length
      });
      
      // Log demo items if found
      const demoItems = items.filter(item => 
        item.name?.includes('Classic White T-Shirt') ||
        item.name?.includes('Black Tailored Pants') ||
        item.name?.includes('Blue Denim Jacket') ||
        item.name?.includes('Graphic Denim Shorts')
      );
      
      if (demoItems.length > 0) {
        console.log('🎯 Found demo items:', demoItems.map(item => ({
          name: item.name,
          category_id: item.category_id,
          price: item.price
        })));
      }
      
      setFashionItems(items);
      setFavorites(favs);
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load items:', error);
      // Fallback to sample data
      setFashionItems([]);
      setFavorites([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Create category options from database categories
  const categoryOptions = categories.length > 0 
    ? [
        { id: 'all', label: 'All items' },
        ...categories.map(cat => ({ id: cat.name, label: cat.name.charAt(0).toUpperCase() + cat.name.slice(1) }))
      ]
    : defaultCategories;

  // Use real fashion items if available, otherwise fallback to sample
  const displayItems = fashionItems.length > 0 ? fashionItems : sampleWardrobeItems;
  
  // Filter items based on selected category
  const filteredItems = selectedCategory === 'all' 
    ? [...favorites, ...displayItems] // Show favorites first, then all items
    : displayItems.filter(item => {
        // For demo items, use the category field directly
        if ((item as any).is_demo) {
          return (item as any).category === selectedCategory;
        }
        // For database items, use category lookup
        if (item.category_id && categories.length > 0) {
          const category = categories.find(cat => cat.id === item.category_id);
          return category?.name === selectedCategory;
        }
        // For sample items, use the category field
        return (item as any).category === selectedCategory;
      });

  const handleItemPress = async (item: any) => {
    console.log('Selected wardrobe item:', item.id);
    
    // Get category name for logging
    let categoryName = 'unknown';
    if (item.is_demo) {
      categoryName = item.category;
    } else if (item.category_id && categories.length > 0) {
      const category = categories.find(cat => cat.id === item.category_id);
      categoryName = category?.name || 'unknown';
    } else if (item.category) {
      categoryName = item.category;
    }
    
    // Log the selection details
    console.log('Wardrobe item details:', {
      id: item.id,
      name: item.name,
      category: categoryName,
      brand: item.brand || 'Unknown Brand',
      price: item.price || 'N/A',
      isDemoItem: !!item.is_demo,
      isDatabaseItem: !!item.category_id
    });

    // Add to wardrobe collection for easy access during try-on
    if (item.id) {
      const success = await fashionItemService.addToWardrobe(item.id, `Selected for try-on - ${categoryName}`);
      if (success) {
        console.log('✅ Item added to wardrobe successfully');
        if (!item.is_demo) {
          await loadItems(); // Refresh the list for database items
        }
      } else {
        console.log('❌ Failed to add item to wardrobe');
      }
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Your Wardrobe
        </Text>
      </View>

      {/* Category Filter Buttons */}
      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categoryOptions.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => handleCategoryPress(category.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Items Grid */}
      <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading items...</Text>
          </View>
        )}
        
        {!loading && filteredItems.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptyText}>
              {fashionItems.length === 0 
                ? 'No fashion items available. Check your database connection or add some items.'
                : 'No items match the selected category.'
              }
            </Text>
            <Text style={styles.debugText}>
              Debug: {fashionItems.length} fashion items, {favorites.length} favorites, {categories.length} categories
            </Text>
            <Text style={styles.debugText}>
              Selected category: {selectedCategory}
            </Text>
            <Text style={styles.debugText}>
              Display items: {displayItems.length}
            </Text>
            <Text style={styles.debugText}>
              Filtered items: {filteredItems.length}
            </Text>
          </View>
        )}
        
        <View style={styles.itemsGrid}>
          {filteredItems.map((item) => {
            const imageUri = (item as any).image || 
                           (item.images && item.images[0]) || 
                           'https://via.placeholder.com/300x400';
            
            console.log('Rendering item:', {
              id: item.id,
              name: item.name,
              imageUri,
              is_demo: (item as any).is_demo,
              category: (item as any).category
            });
            
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.itemCard}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.8}
              >
                <View style={styles.itemImageContainer}>
                  <Image 
                    source={{ uri: imageUri }} 
                    style={styles.itemImage}
                    onLoad={() => console.log('✅ Image loaded successfully:', item.name)}
                    onError={(error) => console.log('❌ Image failed to load:', item.name, error.nativeEvent.error)}
                  />
                {((item as any).isFavorite || favorites.some(fav => fav.id === item.id)) && (
                  <View style={styles.favoriteIndicator}>
                    <Heart color="#FF3B30" size={12} fill="#FF3B30" />
                  </View>
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemBrand} numberOfLines={1}>
                  {(item as any).brand || 'Unknown Brand'}
                </Text>
                <Text style={styles.itemPrice}>
                  {item.price ? `$${item.price}` : 'Price N/A'}
                </Text>
              </View>
            </TouchableOpacity>
            );
          })}
        </View>
        {/* Bottom safe area padding to prevent content from being blocked by tab navigation */}
        <View style={{ height: Math.max(insets.bottom, 16) + 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  
  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.off,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 0,
  },

  // Category Filter
  categoryContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.off,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#F3F3F3',
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#7928CA',
    borderColor: '#7928CA',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Items Grid
  itemsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemCard: {
    width: (width - 56) / 2,
    backgroundColor: colors.background.main,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.background.off,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImageContainer: {
    aspectRatio: 1,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.background.main,
    borderRadius: 12,
    padding: 4,
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  itemBrand: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },

  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  debugText: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
}); 