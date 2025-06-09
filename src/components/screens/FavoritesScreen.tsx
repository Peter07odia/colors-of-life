import React from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ShoppingBag } from 'lucide-react-native';

import { Card, CardContent } from '../ui/Card';
import { Heading, AppText } from '../ui/Typography';
import { Button } from '../ui/Button';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

export default function FavoritesScreen() {
  const [favorites, setFavorites] = React.useState([
    {
      id: '1',
      name: 'Vintage Denim Jacket',
      brand: 'Style Co.',
      price: '$89',
      type: 'item',
      savedDate: '2 days ago',
    },
    {
      id: '2',
      name: 'Summer Casual Look',
      description: 'Floral dress + white sneakers',
      type: 'outfit',
      savedDate: '1 week ago',
    },
    {
      id: '3',
      name: 'Classic White Sneakers',
      brand: 'Comfort Shoes',
      price: '$120',
      type: 'item',
      savedDate: '3 days ago',
    },
  ]);

  const handleRemoveFavorite = (id: string) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  const handleTryOn = (id: string) => {
    console.log('Try on favorite:', id);
  };

  const favoriteItems = favorites.filter(item => item.type === 'item');
  const favoriteOutfits = favorites.filter(item => item.type === 'outfit');

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Heart color={colors.text.secondary} size={64} style={styles.emptyIcon} />
          <Heading level={3} style={styles.emptyTitle}>
            No Favorites Yet
          </Heading>
          <AppText variant="body" color="secondary" style={styles.emptyText}>
            Save items and outfits you love to see them here
          </AppText>
          <Button
            title="Discover Styles"
            variant="primary"
            onPress={() => console.log('Navigate to discover')}
            style={styles.discoverButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Favorite Items */}
        {favoriteItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
                              <ShoppingBag color={colors.primary} size={20} />
              <Heading level={4} style={styles.sectionTitle}>
                Favorite Items ({favoriteItems.length})
              </Heading>
            </View>
            
            <View style={styles.itemsGrid}>
              {favoriteItems.map((item) => (
                <Card key={item.id} variant="elevated" style={styles.itemCard}>
                  {/* Placeholder for product image */}
                  <View style={styles.itemImagePlaceholder}>
                    <AppText variant="small" color="secondary">
                      Item Image
                    </AppText>
                  </View>
                  
                  <CardContent style={styles.itemContent}>
                    <AppText variant="small" color="secondary" style={styles.itemBrand}>
                      {item.brand}
                    </AppText>
                    <Heading level={6} style={styles.itemName}>
                      {item.name}
                    </Heading>
                    <AppText variant="body" style={styles.itemPrice}>
                      {item.price}
                    </AppText>
                    <AppText variant="small" color="secondary" style={styles.savedDate}>
                      Saved {item.savedDate}
                    </AppText>
                    
                    <View style={styles.itemActions}>
                      <Button
                        title="Try On"
                        variant="primary"
                        size="sm"
                        onPress={() => handleTryOn(item.id)}
                        style={styles.tryOnButton}
                      />
                      <Button
                        title="Remove"
                        variant="text"
                        size="sm"
                        onPress={() => handleRemoveFavorite(item.id)}
                        style={styles.removeButton}
                      />
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Favorite Outfits */}
        {favoriteOutfits.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
                                  <Heart color={colors.primary} size={20} />
              <Heading level={4} style={styles.sectionTitle}>
                Favorite Outfits ({favoriteOutfits.length})
              </Heading>
            </View>
            
            <View style={styles.outfitsContainer}>
              {favoriteOutfits.map((outfit) => (
                <Card key={outfit.id} variant="elevated" style={styles.outfitCard}>
                  {/* Placeholder for outfit image */}
                  <View style={styles.outfitImagePlaceholder}>
                    <AppText variant="small" color="secondary">
                      Outfit Preview
                    </AppText>
                  </View>
                  
                  <CardContent>
                    <Heading level={5} style={styles.outfitName}>
                      {outfit.name}
                    </Heading>
                    <AppText variant="body" color="secondary" style={styles.outfitDescription}>
                      {outfit.description}
                    </AppText>
                    <AppText variant="small" color="secondary" style={styles.savedDate}>
                      Saved {outfit.savedDate}
                    </AppText>
                    
                    <View style={styles.outfitActions}>
                      <Button
                        title="Try Complete Look"
                        variant="primary"
                        size="md"
                        onPress={() => handleTryOn(outfit.id)}
                        style={styles.tryCompleteButton}
                      />
                      <Button
                        title="Remove"
                        variant="text"
                        size="sm"
                        onPress={() => handleRemoveFavorite(outfit.id)}
                        style={styles.removeButton}
                      />
                    </View>
                  </CardContent>
                </Card>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 32,
  },
  discoverButton: {
    paddingHorizontal: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.background.main,
  },
  sectionTitle: {
    marginLeft: 8,
    marginBottom: 0,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    justifyContent: 'space-between',
  },
  itemCard: {
    width: (width - 44) / 2,
    marginBottom: 4,
  },
  itemImagePlaceholder: {
    height: 140,
    backgroundColor: colors.background.off,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    padding: 12,
  },
  itemBrand: {
    marginBottom: 2,
  },
  itemName: {
    marginBottom: 4,
    fontSize: 14,
  },
  itemPrice: {
    fontWeight: '600',
    marginBottom: 4,
  },
  savedDate: {
    marginBottom: 12,
  },
  itemActions: {
    gap: 8,
  },
  tryOnButton: {
    width: '100%',
  },
  removeButton: {
    width: '100%',
  },
  outfitsContainer: {
    padding: 16,
    gap: 16,
  },
  outfitCard: {
    marginBottom: 4,
  },
  outfitImagePlaceholder: {
    height: 180,
    backgroundColor: colors.background.off,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outfitName: {
    marginBottom: 8,
  },
  outfitDescription: {
    marginBottom: 8,
  },
  outfitActions: {
    gap: 8,
    marginTop: 8,
  },
  tryCompleteButton: {
    width: '100%',
  },
  bottomPadding: {
    height: 20,
  },
}); 