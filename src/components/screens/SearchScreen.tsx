import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TextInput,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search as SearchIcon, Image as ImageIcon } from 'lucide-react-native';

import { Heading, AppText } from '../ui/Typography';
import { Button } from '../ui/Button';
import { ColorPalette } from '../ui/ColorPalette';
import { ImageSearchModal } from '../ui/ImageSearchModal';
import { VisualResultCard } from '../ui/VisualResultCard';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

interface SearchResult {
  id: string;
  title: string;
  brand?: string;
  price?: string;
  originalPrice?: string;
  image?: string;
  source?: 'web' | 'database';
  discount?: number;
  isVideo?: boolean;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [currentColorName, setCurrentColorName] = useState<string | null>(null);
  const [colorFilterEnabled, setColorFilterEnabled] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [searchMode, setSearchMode] = useState<'text' | 'image'>('text');

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchMode('text');
    
    // Enhanced mock results with visual data
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Vintage Denim Jacket with Distressed Details',
          brand: 'Style Co.',
          price: '$89',
          originalPrice: '$120',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
          source: 'database',
          discount: 26,
        },
        {
          id: '2',
          title: 'Floral Summer Dress',
          brand: 'Trendy Fashion',
          price: '$65',
          image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
          source: 'web',
        },
        {
          id: '3',
          title: 'Classic White Leather Sneakers',
          brand: 'Comfort Shoes',
          price: '$120',
          image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=600&fit=crop',
          source: 'database',
        },
        {
          id: '4',
          title: 'Casual Button-Down Shirt',
          brand: 'Urban Style',
          price: '$45',
          image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=600&fit=crop',
          source: 'web',
        },
        {
          id: '5',
          title: 'High-Waisted Black Jeans',
          brand: 'Denim Co.',
          price: '$78',
          originalPrice: '$95',
          image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=600&fit=crop',
          source: 'database',
          discount: 18,
        },
        {
          id: '6',
          title: 'Bohemian Maxi Dress',
          brand: 'Free Spirit',
          price: '$92',
          image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
          source: 'web',
          isVideo: true,
        },
      ];
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };

  const handleImageSearch = async (imageUri: string) => {
    setIsSearching(true);
    setSearchMode('image');
    setSearchQuery('Image search results');
    
    // Mock image search results
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: 'img1',
          title: 'Similar Red Dress',
          brand: 'Fashion Find',
          price: '$85',
          image: 'https://images.unsplash.com/photo-1566479179817-3b3e56b2c3e4?w=400&h=600&fit=crop',
          source: 'web',
        },
        {
          id: 'img2',
          title: 'Matching Red Top',
          brand: 'Style Match',
          price: '$42',
          image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&h=600&fit=crop',
          source: 'database',
        },
      ];
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1500);
  };

  const handleColorSelect = (colorName: string | null) => {
    setSelectedColor(colorName);
    if (colorName && searchQuery) {
      handleSearch(`${searchQuery} ${colorName}`);
    }
  };

  const handleColorChange = (colorName: string | null) => {
    setCurrentColorName(colorName);
  };

  const getSearchPlaceholder = () => {
    if (searchMode === 'image') return 'Image search results';
    if (currentColorName) return `Search ${currentColorName} fashion items...`;
    return 'Search fashion items...';
  };

  const trendingSearches = [
    'Summer Dresses', 'Casual Sneakers', 'Business Attire', 'Vintage Jackets',
    'Boho Style', 'Minimalist Fashion', 'Streetwear', 'Formal Wear'
  ];

  const renderResultItem = ({ item }: { item: SearchResult }) => (
    <VisualResultCard
      key={item.id}
      id={item.id}
      title={item.title}
      brand={item.brand}
      price={item.price}
      originalPrice={item.originalPrice}
      image={item.image}
      source={item.source}
      discount={item.discount}
      isVideo={item.isVideo}
      onPress={() => console.log('Item pressed:', item.id)}
      onTryOn={() => console.log('Try on:', item.id)}
      onSave={() => console.log('Save:', item.id)}
      onShare={() => console.log('Share:', item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <View style={styles.searchInputContainer}>
            <SearchIcon 
              color={colors.text.secondary} 
              size={20} 
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={getSearchPlaceholder()}
              placeholderTextColor={colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearch(searchQuery)}
              returnKeyType="search"
              editable={searchMode === 'text'}
            />
            <TouchableOpacity
              style={styles.imageSearchButton}
              onPress={() => setShowImageModal(true)}
              activeOpacity={0.7}
            >
              <ImageIcon size={20} color="#7928CA" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Color Palette */}
        <ColorPalette
          selectedColor={selectedColor}
          onColorSelect={handleColorSelect}
          onColorChange={handleColorChange}
          enabled={colorFilterEnabled}
          onEnabledChange={setColorFilterEnabled}
        />


        {/* Search Results */}
        {searchQuery.length > 0 && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Heading level={4} style={styles.sectionTitle}>
                {isSearching ? 'Searching...' : searchMode === 'image' ? 'Visual Search Results' : `Results for "${searchQuery}"`}
              </Heading>
              {selectedColor && (
                <View style={styles.colorFilter}>
                  <AppText variant="small" color="secondary">
                    Filtered by: {selectedColor}
                  </AppText>
                </View>
              )}
            </View>
            
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinner} />
                <AppText variant="body" color="secondary" style={styles.loadingText}>
                  {searchMode === 'image' ? 'Analyzing image...' : 'Finding perfect items...'}
                </AppText>
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderResultItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.resultsGrid}
                columnWrapperStyle={styles.resultRow}
                showsVerticalScrollIndicator={false}
                initialNumToRender={6}
                maxToRenderPerBatch={6}
                windowSize={10}
              />
            ) : (
              <View style={styles.emptyState}>
                <AppText variant="body" color="secondary">
                  No items found. Try a different search term or adjust your filters.
                </AppText>
              </View>
            )}
          </View>
        )}

        {/* Trending Searches */}
        {searchQuery.length === 0 && (
          <View style={styles.trendingSection}>
            <Heading level={4} style={styles.sectionTitle}>
              Trending Searches
            </Heading>
            <View style={styles.trendingGrid}>
              {trendingSearches.map((trend) => (
                <Button
                  key={trend}
                  title={trend}
                  variant="secondary"
                  size="md"
                  onPress={() => {
                    setSearchQuery(trend);
                    handleSearch(trend);
                  }}
                  style={styles.trendingButton}
                />
              ))}
            </View>
          </View>
        )}

        {/* Image Search Modal */}
        <ImageSearchModal
          visible={showImageModal}
          onClose={() => setShowImageModal(false)}
          onImageSelect={handleImageSearch}
        />

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  scrollView: {
    flex: 1,
  },
  searchHeader: {
    backgroundColor: colors.background.main,
    padding: 16,
    paddingTop: 0,
    marginTop: -10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.off,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  imageSearchButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  colorFilter: {
    backgroundColor: colors.background.off,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultsSection: {
    padding: 16,
    backgroundColor: colors.background.main,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.background.off,
    borderTopColor: '#7928CA',
    marginBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
  },
  resultsGrid: {
    paddingBottom: 20,
  },
  resultRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  trendingSection: {
    padding: 16,
    backgroundColor: colors.background.main,
  },
  trendingGrid: {
    gap: 12,
  },
  trendingButton: {
    marginBottom: 8,
  },
  bottomPadding: {
    height: 20,
  },
}); 