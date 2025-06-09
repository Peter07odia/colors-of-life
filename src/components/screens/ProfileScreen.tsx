import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Heart,
  ShoppingBag,
  Bookmark,
  Shirt,
  Settings,
  Edit3
} from 'lucide-react-native';

import { Card, CardContent } from '../ui/Card';
import { Heading, AppText } from '../ui/Typography';
import { Button } from '../ui/Button';
import { colors } from '../../constants/colors';
import { ImagePlaceholder } from '../ui/ImagePlaceholder';

const { width: screenWidth } = Dimensions.get('window');
const itemWidth = (screenWidth - 48) / 3; // 3 columns with padding

type TabType = 'tryOn' | 'saved' | 'orders' | 'liked';

interface ContentItem {
  id: string;
  image?: string;
  title: string;
}

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('tryOn');
  const [profileDescription, setProfileDescription] = useState('Fashion enthusiast & style explorer');

  const user = {
    username: '@zaray',
    name: 'Zaray',
    profileImage: null,
    followers: 1204,
    following: 567,
  };

  // Mock data for different tabs
  const contentData: Record<TabType, ContentItem[]> = {
    tryOn: [
      { id: '1', title: 'Summer Dress' },
      { id: '2', title: 'Casual Jeans' },
      { id: '3', title: 'Evening Gown' },
      { id: '4', title: 'Sports Outfit' },
      { id: '5', title: 'Business Suit' },
      { id: '6', title: 'Beach Wear' },
    ],
    saved: [
      { id: '7', title: 'Winter Coat' },
      { id: '8', title: 'Party Dress' },
      { id: '9', title: 'Casual Outfit' },
      { id: '10', title: 'Work Attire' },
    ],
    orders: [
      { id: '11', title: 'White Sneakers' },
      { id: '12', title: 'Blue Shirt' },
      { id: '13', title: 'Black Jacket' },
    ],
    liked: [
      { id: '14', title: 'Red Dress' },
      { id: '15', title: 'Designer Bag' },
      { id: '16', title: 'Sunglasses' },
      { id: '17', title: 'Gold Watch' },
      { id: '18', title: 'Heels' },
    ],
  };

  const handleEditProfile = () => {
    console.log('Edit profile');
  };

  const handleSettings = () => {
    console.log('Settings');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderContentItem = ({ item }: { item: ContentItem }) => (
    <TouchableOpacity style={styles.contentItem}>
      <View style={styles.contentImageContainer}>
        <ImagePlaceholder 
          style={styles.contentImage}
          showIcon={false}
        />
      </View>
      <AppText variant="small" style={styles.contentTitle} numberOfLines={2}>
        {item.title}
      </AppText>
    </TouchableOpacity>
  );

  const renderTabButton = (tab: TabType, label: string, icon: React.ReactNode) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <View style={styles.tabContent}>
        {icon}
        <AppText 
          variant="small" 
          style={[
            styles.tabLabel,
            activeTab === tab && styles.activeTabLabel
          ]}
        >
          {label}
        </AppText>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {/* Main Profile Row - Profile photo, username, stats, and settings on same level */}
          <View style={styles.mainProfileRow}>
            {/* Left: Avatar and Name */}
            <View style={styles.avatarSection}>
              <View style={styles.profileImageContainer}>
                {user.profileImage ? (
                  <View style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <User color={colors.text.secondary} size={24} />
                  </View>
                )}
              </View>
              <View style={styles.nameSection}>
                <AppText variant="body" style={styles.username}>
                  {user.name}
                </AppText>
                <AppText variant="small" style={styles.usernameHandle}>
                  {user.username}
                </AppText>
              </View>
            </View>

            {/* Center: Stats */}
            <View style={styles.statsSection}>
              <TouchableOpacity style={styles.statColumn}>
                <AppText variant="body" style={styles.statNumber}>
                  {formatNumber(user.followers)}
                </AppText>
                <AppText variant="small" style={styles.statLabel}>
                  Followers
                </AppText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.statColumn}>
                <AppText variant="body" style={styles.statNumber}>
                  {formatNumber(user.following)}
                </AppText>
                <AppText variant="small" style={styles.statLabel}>
                  Following
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Right: Settings */}
            <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
              <Settings color={colors.text.primary} size={20} />
            </TouchableOpacity>
          </View>

          {/* Bio Text - Centralized */}
          <View style={styles.bioSection}>
            <AppText variant="body" style={styles.bioText}>
              {profileDescription}
            </AppText>
          </View>

          {/* Edit Profile Button */}
          <View style={styles.editButtonSection}>
            <Button
              title="Edit Profile"
              variant="primary"
              size="md"
              onPress={handleEditProfile}
              style={styles.editProfileButton}
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {renderTabButton('tryOn', 'Try On', 
            <Shirt 
                                color={activeTab === 'tryOn' ? colors.primary : colors.text.secondary} 
              size={16} 
            />
          )}
          {renderTabButton('saved', 'Saved', 
            <Bookmark 
                                color={activeTab === 'saved' ? colors.primary : colors.text.secondary} 
              size={16} 
            />
          )}
          {renderTabButton('orders', 'Orders', 
            <ShoppingBag 
                                color={activeTab === 'orders' ? colors.primary : colors.text.secondary} 
              size={16} 
            />
          )}
          {renderTabButton('liked', 'Liked', 
            <Heart 
                                color={activeTab === 'liked' ? colors.primary : colors.text.secondary} 
              size={16} 
            />
          )}
        </View>

        {/* Content Grid */}
        <View style={styles.contentContainer}>
          <FlatList
            data={contentData[activeTab]}
            renderItem={renderContentItem}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.gridRow}
            ItemSeparatorComponent={() => <View style={styles.gridSeparator} />}
            showsVerticalScrollIndicator={false}
          />
        </View>

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
  profileHeader: {
    backgroundColor: colors.background.main,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  mainProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImageContainer: {
    marginRight: 12,
    marginBottom: 0,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background.off,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background.off,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  nameSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  username: {
    fontWeight: '600',
    color: colors.text.primary,
    fontSize: 16,
    marginBottom: 2,
  },
  usernameHandle: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statColumn: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 18,
  },
  statLabel: {
    color: colors.text.secondary,
    marginTop: 2,
    fontSize: 12,
  },
  settingsButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bioSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  bioText: {
    color: colors.text.primary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  editButtonSection: {
    marginBottom: 0,
  },
  editProfileButton: {
    width: '100%',
    borderRadius: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.off,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
          borderBottomColor: colors.primary,
  },
  tabContent: {
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  activeTabLabel: {
          color: colors.primary,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  gridContainer: {
    padding: 16,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridSeparator: {
    height: 16,
  },
  contentItem: {
    width: itemWidth,
    alignItems: 'center',
  },
  contentImageContainer: {
    width: itemWidth,
    height: itemWidth,
    marginBottom: 8,
  },
  contentImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  contentTitle: {
    textAlign: 'center',
    color: colors.text.primary,
  },
  bottomPadding: {
    height: 100, // Extra space for bottom navigation
  },
}); 