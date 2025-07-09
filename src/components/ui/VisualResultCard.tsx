import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Text,
} from 'react-native';
import { Heart, Eye, Share2, ShoppingBag } from 'lucide-react-native';
import { AppText } from './Typography';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Account for padding and gap

interface VisualResultCardProps {
  id: string;
  title: string;
  brand?: string;
  price?: string;
  originalPrice?: string;
  image?: string;
  source?: 'web' | 'database';
  onPress?: () => void;
  onTryOn?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  isSaved?: boolean;
  discount?: number;
  isVideo?: boolean;
}

export default function VisualResultCard({
  id,
  title,
  brand,
  price,
  originalPrice,
  image,
  source = 'database',
  onPress,
  onTryOn,
  onSave,
  onShare,
  isSaved = false,
  discount,
  isVideo = false,
}: VisualResultCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleSave = () => {
    onSave?.();
  };

  const handleShare = () => {
    onShare?.();
  };

  const handleTryOn = () => {
    onTryOn?.();
  };

  // Calculate dynamic height based on content
  const getCardHeight = () => {
    const baseHeight = 200;
    const titleHeight = Math.ceil(title.length / 30) * 20;
    const brandHeight = brand ? 16 : 0;
    const priceHeight = 20;
    return baseHeight + titleHeight + brandHeight + priceHeight;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { height: getCardHeight() }]}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={styles.imageContainer}>
        {!hasError ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
            onLoad={handleImageLoad}
            onError={handleImageError}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <ShoppingBag size={32} color={colors.text.secondary} />
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingSpinner} />
          </View>
        )}

        {/* Video indicator */}
        {isVideo && (
          <View style={styles.videoIndicator}>
            <AppText variant="tiny" style={styles.videoText}>
              VIDEO
            </AppText>
          </View>
        )}

        {/* Source indicator */}
        <View style={[styles.sourceIndicator, source === 'web' && styles.webSource]}>
          <AppText variant="tiny" style={styles.sourceText}>
            {source === 'web' ? 'WEB' : 'SHOP'}
          </AppText>
        </View>

        {/* Quick actions overlay */}
        <View style={styles.actionsOverlay}>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Heart
              size={16}
              color={isSaved ? '#FF0080' : colors.background.main}
              fill={isSaved ? '#FF0080' : 'none'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Share2 size={16} color={colors.background.main} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTryOn}
            activeOpacity={0.7}
          >
            <Eye size={16} color={colors.background.main} />
          </TouchableOpacity>
        </View>

        {/* Discount badge */}
        {discount && discount > 0 && (
          <View style={styles.discountBadge}>
            <AppText variant="tiny" style={styles.discountText}>
              -{discount}%
            </AppText>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        {brand && (
          <AppText variant="small" color="secondary" style={styles.brand}>
            {brand}
          </AppText>
        )}
        
        <AppText variant="body" style={styles.title} numberOfLines={2}>
          {title}
        </AppText>

        <View style={styles.priceContainer}>
          {price && (
            <AppText variant="body" style={styles.price}>
              {price}
            </AppText>
          )}
          {originalPrice && originalPrice !== price && (
            <AppText variant="small" style={styles.originalPrice}>
              {originalPrice}
            </AppText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.background.main,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.off,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.off,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.background.main,
    borderTopColor: '#7928CA',
  },
  videoIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoText: {
    color: colors.background.main,
    fontSize: 10,
    fontWeight: '600',
  },
  sourceIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  webSource: {
    backgroundColor: '#7928CA',
  },
  sourceText: {
    color: colors.background.main,
    fontSize: 10,
    fontWeight: '600',
  },
  actionsOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'column',
    gap: 6,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: colors.background.main,
    fontSize: 10,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 12,
    flex: 1,
  },
  brand: {
    marginBottom: 2,
    fontSize: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 16,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7928CA',
  },
  originalPrice: {
    fontSize: 12,
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
});

export { VisualResultCard };