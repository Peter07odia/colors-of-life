import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import {
  Clock,
  Heart,
  Share,
  Download,
  Star,
  Filter,
  Search,
  X,
  Play,
  Image as ImageIcon,
  Calendar,
  Trash2,
  MoreVertical
} from 'lucide-react-native';

import { Button } from '../ui/Button';
import { Heading, AppText } from '../ui/Typography';
import { colors } from '../../constants/colors';
import { enhancedVirtualTryOnService } from '../../services/enhancedVirtualTryOnService';

interface TryOnHistoryProps {
  onClose: () => void;
  onSelectResult: (result: any) => void;
}

interface TryOnHistoryItem {
  id: string;
  result_image_url?: string;
  result_video_url?: string;
  clothing_item_data: any;
  user_rating?: number;
  is_saved: boolean;
  created_at: string;
  processing_time_seconds?: number;
  quality_score?: number;
  user_avatars?: {
    avatar_url: string;
    avatar_type: string;
  };
}

export function TryOnHistory({ onClose, onSelectResult }: TryOnHistoryProps) {
  // State management
  const [historyItems, setHistoryItems] = useState<TryOnHistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<TryOnHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'favorites' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Load try-on history
  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const history = await enhancedVirtualTryOnService.getTryOnHistory(50);
      setHistoryItems(history);
      setFilteredItems(history);
    } catch (error) {
      console.error('Failed to load try-on history:', error);
      Alert.alert('Error', 'Failed to load try-on history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh history
  const refreshHistory = useCallback(async () => {
    setIsRefreshing(true);
    await loadHistory();
    setIsRefreshing(false);
  }, [loadHistory]);

  // Filter and search items
  useEffect(() => {
    let filtered = [...historyItems];

    // Apply filter
    if (selectedFilter === 'favorites') {
      filtered = filtered.filter(item => item.is_saved);
    } else if (selectedFilter === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(item => new Date(item.created_at) > oneWeekAgo);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.clothing_item_data?.name?.toLowerCase().includes(query) ||
        item.clothing_item_data?.brand?.toLowerCase().includes(query) ||
        item.clothing_item_data?.category?.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  }, [historyItems, selectedFilter, searchQuery]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (item: TryOnHistoryItem) => {
    try {
      const success = await enhancedVirtualTryOnService.saveToFavorites(item.id);
      if (success) {
        setHistoryItems(prev => 
          prev.map(historyItem => 
            historyItem.id === item.id 
              ? { ...historyItem, is_saved: !historyItem.is_saved }
              : historyItem
          )
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite status');
    }
  }, []);

  // Rate try-on result
  const rateResult = useCallback(async (item: TryOnHistoryItem, rating: number) => {
    try {
      const success = await enhancedVirtualTryOnService.rateTryOnResult(item.id, rating);
      if (success) {
        setHistoryItems(prev => 
          prev.map(historyItem => 
            historyItem.id === item.id 
              ? { ...historyItem, user_rating: rating }
              : historyItem
          )
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to rate result');
    }
  }, []);

  // Share result
  const shareResult = useCallback(async (item: TryOnHistoryItem) => {
    try {
      // TODO: Implement sharing functionality
      Alert.alert('Share', 'Sharing functionality will be implemented here.');
    } catch (error) {
      Alert.alert('Error', 'Failed to share result');
    }
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Render history item
  const renderHistoryItem = ({ item }: { item: TryOnHistoryItem }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => onSelectResult(item)}
    >
      {/* Result Image/Video */}
      <View style={styles.resultContainer}>
        {item.result_image_url ? (
          <Image source={{ uri: item.result_image_url }} style={styles.resultImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <ImageIcon size={24} color={colors.textSecondary} />
          </View>
        )}
        
        {item.result_video_url && (
          <View style={styles.videoIndicator}>
            <Play size={12} color="#fff" fill="#fff" />
          </View>
        )}

        {/* Quality Score */}
        {item.quality_score && (
          <View style={styles.qualityBadge}>
            <Star size={12} color="#FFD700" fill="#FFD700" />
            <AppText style={styles.qualityText}>
              {Math.round(item.quality_score)}%
            </AppText>
          </View>
        )}
      </View>

      {/* Item Details */}
      <View style={styles.itemDetails}>
        <AppText style={styles.itemName} numberOfLines={2}>
          {item.clothing_item_data?.name || 'Virtual Try-On'}
        </AppText>
        
        {item.clothing_item_data?.brand && (
          <AppText style={styles.itemBrand} numberOfLines={1}>
            {item.clothing_item_data.brand}
          </AppText>
        )}

        <View style={styles.itemMeta}>
          <View style={styles.metaItem}>
            <Clock size={12} color={colors.textSecondary} />
            <AppText style={styles.metaText}>
              {formatDate(item.created_at)}
            </AppText>
          </View>

          {item.processing_time_seconds && (
            <View style={styles.metaItem}>
              <AppText style={styles.metaText}>
                {item.processing_time_seconds}s
              </AppText>
            </View>
          )}
        </View>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <TouchableOpacity
              key={rating}
              onPress={() => rateResult(item, rating)}
            >
              <Star
                size={14}
                color={rating <= (item.user_rating || 0) ? '#FFD700' : colors.border.light}
                fill={rating <= (item.user_rating || 0) ? '#FFD700' : 'transparent'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleFavorite(item)}
        >
          <Heart
            size={18}
            color={item.is_saved ? colors.error : colors.textSecondary}
            fill={item.is_saved ? colors.error : 'transparent'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => shareResult(item)}
        >
          <Share size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MoreVertical size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render filter chips
  const renderFilterChips = () => (
    <View style={styles.filterChips}>
      {(['all', 'favorites', 'recent'] as const).map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterChip,
            selectedFilter === filter && styles.filterChipActive,
          ]}
          onPress={() => setSelectedFilter(filter)}
        >
          <AppText
            style={[
              styles.filterChipText,
              selectedFilter === filter && styles.filterChipTextActive,
            ]}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Clock size={48} color={colors.textSecondary} />
      <Heading style={styles.emptyTitle}>No Try-On History</Heading>
      <AppText style={styles.emptyDescription}>
        Start trying on clothes to see your history here!
      </AppText>
    </View>
  );

  return (
    <View style={styles.container}>
      <BlurView intensity={95} style={styles.blurOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Heading style={styles.title}>Try-On History</Heading>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search and Filters */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInput}>
              <Search size={16} color={colors.textSecondary} />
              <AppText
                style={styles.searchText}
                placeholder="Search try-ons..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {showFilters && renderFilterChips()}

          {/* History List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <AppText>Loading history...</AppText>
            </View>
          ) : filteredItems.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={filteredItems}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.id}
              style={styles.historyList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={refreshHistory}
                  tintColor={colors.primary}
                />
              }
            />
          )}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 20,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.textSecondary}10`,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: `${colors.textSecondary}20`,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultContainer: {
    position: 'relative',
    marginRight: 12,
  },
  resultImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: `${colors.textSecondary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qualityBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    gap: 2,
  },
  qualityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  itemBrand: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  itemActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.textSecondary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 