import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image, User, ShoppingBag } from 'lucide-react-native';
import { AppText } from './Typography';
import { colors } from '../../constants/colors';

interface ImagePlaceholderProps {
  type?: 'feed' | 'avatar' | 'product';
  style?: ViewStyle;
  showIcon?: boolean;
}

export function ImagePlaceholder({ 
  type = 'feed', 
  style,
  showIcon = true 
}: ImagePlaceholderProps) {
  const getPlaceholderContent = () => {
    if (!showIcon) {
      return null;
    }

    switch (type) {
      case 'feed':
        return (
          <View style={styles.iconContainer}>
            <Image color={colors.text.secondary} size={24} />
            <AppText variant="small" style={styles.placeholderText}>
              Image not found
            </AppText>
          </View>
        );
      case 'avatar':
        return (
          <View style={styles.iconContainer}>
            <User color={colors.text.secondary} size={24} />
          </View>
        );
      case 'product':
        return (
          <View style={styles.iconContainer}>
            <ShoppingBag color={colors.text.secondary} size={24} />
          </View>
        );
      default:
        return null;
    }
  };

  const getContainerStyle = () => {
    switch (type) {
      case 'avatar':
        return [styles.container, styles.avatarContainer];
      case 'product':
        return [styles.container, styles.productContainer];
      default:
        return [styles.container, styles.feedContainer];
    }
  };

  return (
    <View style={[getContainerStyle(), style]}>
      {getPlaceholderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.off,
  },
  feedContainer: {
    borderRadius: 8,
  },
  avatarContainer: {
    borderRadius: 50, // Make it circular
  },
  productContainer: {
    borderRadius: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: colors.text.secondary,
    textAlign: 'center',
  },
}); 