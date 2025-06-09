import React from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TextInput,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search as SearchIcon, Filter } from 'lucide-react-native';

import { Card, CardContent } from '../ui/Card';
import { Heading, AppText } from '../ui/Typography';
import { Button } from '../ui/Button';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    // Simulate API search
    setTimeout(() => {
      const mockResults = [
        {
          id: '1',
          name: 'Vintage Denim Jacket',
          brand: 'Style Co.',
          price: '$89',
          category: 'Outerwear',
        },
        {
          id: '2',
          name: 'Floral Summer Dress',
          brand: 'Trendy Fashion',
          price: '$65',
          category: 'Dresses',
        },
        {
          id: '3',
          name: 'Classic White Sneakers',
          brand: 'Comfort Shoes',
          price: '$120',
          category: 'Footwear',
        },
      ];
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };

  const categories = [
    'Tops', 'Bottoms', 'Dresses', 'Outerwear', 
    'Shoes', 'Accessories', 'Bags', 'Jewelry'
  ];

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
              placeholder="Search fashion items..."
              placeholderTextColor={colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearch(searchQuery)}
              returnKeyType="search"
            />
            <Button
              title="Filter"
              variant="text"
              size="sm"
              onPress={() => console.log('Filter pressed')}
              style={styles.filterButton}
            />
          </View>
        </View>

        {/* Quick Categories */}
        <View style={styles.categoriesSection}>
          <Heading level={4} style={styles.sectionTitle}>
            Browse Categories
          </Heading>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <Button
                key={category}
                title={category}
                variant="outline"
                size="sm"
                onPress={() => handleSearch(category)}
                style={styles.categoryButton}
              />
            ))}
          </ScrollView>
        </View>

        {/* Search Results */}
        {searchQuery.length > 0 && (
          <View style={styles.resultsSection}>
            <Heading level={4} style={styles.sectionTitle}>
              {isSearching ? 'Searching...' : `Results for "${searchQuery}"`}
            </Heading>
            
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <AppText variant="body" color="secondary">
                  Finding the perfect items for you...
                </AppText>
              </View>
            ) : searchResults.length > 0 ? (
              <View style={styles.resultsGrid}>
                {searchResults.map((item) => (
                  <Card key={item.id} variant="elevated" style={styles.resultCard}>
                    {/* Placeholder for product image */}
                    <View style={styles.productImagePlaceholder}>
                      <AppText variant="small" color="secondary">
                        Product Image
                      </AppText>
                    </View>
                    
                    <CardContent style={styles.productContent}>
                      <AppText variant="small" color="secondary" style={styles.productBrand}>
                        {item.brand}
                      </AppText>
                      <Heading level={6} style={styles.productName}>
                        {item.name}
                      </Heading>
                      <AppText variant="body" style={styles.productPrice}>
                        {item.price}
                      </AppText>
                      
                      <View style={styles.productActions}>
                        <Button
                          title="Try On"
                          variant="primary"
                          size="sm"
                          onPress={() => console.log('Try on:', item.id)}
                          style={styles.tryOnButton}
                        />
                      </View>
                    </CardContent>
                  </Card>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <AppText variant="body" color="secondary">
                  No items found. Try a different search term.
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
              {['Summer Dresses', 'Casual Sneakers', 'Business Attire', 'Vintage Jackets'].map((trend) => (
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

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.off,
  },
  scrollView: {
    flex: 1,
  },
  searchHeader: {
    backgroundColor: colors.background.main,
    padding: 16,
    paddingTop: 8,
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
  filterButton: {
    paddingHorizontal: 8,
  },
  categoriesSection: {
    backgroundColor: colors.background.main,
    paddingBottom: 16,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesScroll: {
    paddingLeft: 16,
  },
  categoryButton: {
    marginRight: 8,
    minWidth: 80,
  },
  resultsSection: {
    padding: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  resultCard: {
    width: (width - 44) / 2, // Account for padding and gap
    marginBottom: 4,
  },
  productImagePlaceholder: {
    height: 140,
    backgroundColor: colors.background.off,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productContent: {
    padding: 12,
  },
  productBrand: {
    marginBottom: 2,
  },
  productName: {
    marginBottom: 4,
    fontSize: 14,
  },
  productPrice: {
    fontWeight: '600',
    marginBottom: 12,
  },
  productActions: {
    width: '100%',
  },
  tryOnButton: {
    width: '100%',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  trendingSection: {
    padding: 16,
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