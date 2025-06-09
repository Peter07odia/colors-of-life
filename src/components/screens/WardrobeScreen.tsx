import React, { useState } from 'react';
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

const { width } = Dimensions.get('window');

// Categories for filtering
const categories = [
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

  // Filter items based on selected category
  const filteredItems = selectedCategory === 'all' 
    ? sampleWardrobeItems 
    : sampleWardrobeItems.filter(item => item.category === selectedCategory);

  const handleItemPress = (item: any) => {
    console.log('Item selected:', item.name);
    // TODO: Add item to virtual try-on or navigate to item details
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
          {categories.map((category) => (
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
        <View style={styles.itemsGrid}>
          {filteredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.8}
            >
              <View style={styles.itemImageContainer}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                {item.isFavorite && (
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
                  {item.brand}
                </Text>
                <Text style={styles.itemPrice}>${item.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
}); 