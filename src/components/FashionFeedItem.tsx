import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Verified, Shirt, Star, ShoppingCart } from 'lucide-react-native';
import { FashionPost } from '../services/fashionDataService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface FashionFeedItemProps {
  post: FashionPost;
  isActive: boolean;
}

export default function FashionFeedItem({ post, isActive }: FashionFeedItemProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const insets = useSafeAreaInsets();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  // New handler functions for the new buttons
  const handleTryOn = () => {
    console.log('Try-on clicked for post:', post.id);
    // TODO: Implement try-on functionality
  };

  const handleReviews = () => {
    console.log('Reviews clicked for post:', post.id);
    // TODO: Implement reviews functionality
  };

  const handleBuy = () => {
    console.log('Buy clicked for post:', post.id);
    // TODO: Implement buy functionality
  };

  const handleProfile = () => {
    console.log('Profile clicked for user:', post.user.username);
    // TODO: Navigate to profile page
  };

  const truncatedDescription = post.description.length > 100 
    ? post.description.substring(0, 100) + '...' 
    : post.description;

  // Calculate bottom spacing for tab bar with updated safe area handling
  const tabBarBaseHeight = 88;
  const safeAreaBottom = Math.max(insets.bottom, 8);
  const totalTabBarHeight = tabBarBaseHeight + safeAreaBottom;
  const bottomSpacing = totalTabBarHeight;

  return (
    <View style={styles.container}>
      {/* Main Image - Full Screen */}
      <Image
        source={{ uri: post.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'transparent', 'transparent', 'rgba(0,0,0,0.3)']}
        style={[styles.gradient, { height: bottomSpacing }]}
      />

      {/* Right Side Actions */}
      <View style={[styles.rightActions, { bottom: bottomSpacing - 30 }]}>
        {/* User Avatar */}
        <TouchableOpacity style={styles.avatarContainer} onPress={handleProfile}>
          <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
          <View style={styles.followButton}>
            <Text style={styles.followButtonText}>+</Text>
          </View>
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Heart
            size={30}
            color={isLiked ? '#FF3040' : 'white'}
            fill={isLiked ? '#FF3040' : 'transparent'}
          />
          <Text style={styles.actionText}>{formatNumber(post.likes + (isLiked ? 1 : 0))}</Text>
        </TouchableOpacity>

        {/* Try-on Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handleTryOn}>
          <Shirt size={30} color="white" />
          <Text style={styles.actionText}>Try On</Text>
        </TouchableOpacity>

        {/* Reviews Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handleReviews}>
          <Star size={30} color="white" />
          <Text style={styles.actionText}>4.{Math.floor(Math.random() * 9) + 1}</Text>
        </TouchableOpacity>

        {/* Buy Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handleBuy}>
          <ShoppingCart size={30} color="white" />
          <Text style={styles.actionText}>${Math.floor(Math.random() * 100) + 29}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Content */}
      <View style={[styles.bottomContent, { bottom: bottomSpacing - 15 }]}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.username}>
            @{post.user.username}
            {post.user.verified && (
              <Verified size={16} color="#1DA1F2" fill="#1DA1F2" style={styles.verifiedIcon} />
            )}
          </Text>
        </View>

        {/* Description - Limited to 11 words, hashtags in "see more" */}
        <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
          <Text style={styles.description}>
            {showFullDescription ? (
              post.description
            ) : (
              post.description.split(' ').filter(word => !word.startsWith('#')).slice(0, 11).join(' ') + '...'
            )}
            {(post.description.split(' ').filter(word => !word.startsWith('#')).length > 11 || 
              post.description.split(' ').some(word => word.startsWith('#'))) && (
              <Text style={styles.seeMore}>
                {showFullDescription ? ' See less' : ' See more'}
              </Text>
            )}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    position: 'relative',
    backgroundColor: 'black',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  rightActions: {
    position: 'absolute',
    right: 12,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: 'white',
  },
  followButton: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#FF3040',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomContent: {
    position: 'absolute',
    left: 16,
    right: 80,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  username: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  title: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    color: 'white',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  seeMore: {
    color: '#ccc',
    fontWeight: '600',
  },
  tagsContainer: {
    marginBottom: 10,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
  },
  tagText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#7928CA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
}); 