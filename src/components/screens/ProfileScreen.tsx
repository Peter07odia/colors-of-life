import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Heart,
  ShoppingBag,
  Bookmark,
  Shirt,
  Settings,
  Edit3,
  Bell,
  MoreVertical,
  Share,
  Download,
  Video
} from 'lucide-react-native';

import { Card, CardContent } from '../ui/Card';
import { Heading, AppText } from '../ui/Typography';
import { Button } from '../ui/Button';
import { colors } from '../../constants/colors';
import { ImagePlaceholder } from '../ui/ImagePlaceholder';
import { useAuth } from '../../contexts/AuthContext';
import { virtualTryOnService, TryOnResult } from '../../services/virtualTryOnService';

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
  const [tryOnResults, setTryOnResults] = useState<TryOnResult[]>([]);
  const [loadingTryOns, setLoadingTryOns] = useState(false);
  
  // Get authentication state
  const { user: authUser, isAuthenticated, signIn, signOut } = useAuth();

  const user = {
    username: authUser?.email ? `@${authUser.email.split('@')[0]}` : '@guest',
    name: authUser?.email?.split('@')[0] || 'Guest User',
    profileImage: null,
    followers: 0,
    following: 0,
  };

  // Load try-on results when component mounts or when tryOn tab is selected
  useEffect(() => {
    if (isAuthenticated) {
      loadTryOnResults();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'tryOn') {
      loadTryOnResults();
    }
  }, [activeTab]);

  const loadTryOnResults = async () => {
    console.log('🔄 Loading try-on results...');
    setLoadingTryOns(true);
    try {
      const results = await virtualTryOnService.getTryOnResults();
      console.log('📸 Loaded try-on results:', results.length, results);
      setTryOnResults(results);
    } catch (error) {
      console.error('❌ Failed to load try-on results:', error);
    } finally {
      setLoadingTryOns(false);
    }
  };

  // Mock data for different tabs (empty for now)
  const contentData: Record<TabType, ContentItem[]> = {
    tryOn: [], // Will use real try-on results
    saved: [],
    orders: [],
    liked: [],
  };

  const handleEditProfile = () => {
    // For now, show a simple alert with edit options
    // This can be replaced with a proper modal later
    Alert.alert(
      'Edit Profile',
      'Choose what to edit:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Profile Picture', 
          onPress: () => handleEditProfilePicture()
        },
        { 
          text: 'Name & Handle', 
          onPress: () => handleEditNameAndHandle()
        },
        { 
          text: 'Description', 
          onPress: () => handleEditDescription()
        }
      ]
    );
  };

  const handleEditProfilePicture = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => console.log('Take Photo') },
        { text: 'Choose from Library', onPress: () => console.log('Choose from Library') },
        { text: 'Remove Photo', style: 'destructive', onPress: () => console.log('Remove Photo') }
      ]
    );
  };

  const handleEditNameAndHandle = () => {
    Alert.prompt(
      'Edit Name',
      'Enter your display name:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: (name) => {
            if (name) {
              Alert.prompt(
                'Edit Handle',
                'Enter your handle (without @):',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Save', 
                    onPress: (handle) => {
                      if (handle) {
                        console.log('Save name:', name, 'handle:', handle);
                        // Here you would update the user profile
                      }
                    }
                  }
                ]
              );
            }
          }
        }
      ],
      'plain-text',
      user.name
    );
  };

  const handleEditDescription = () => {
    Alert.prompt(
      'Edit Description',
      'Enter your bio:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: (description) => {
            if (description) {
              setProfileDescription(description);
              console.log('Save description:', description);
              // Here you would update the user profile
            }
          }
        }
      ],
      'plain-text',
      profileDescription
    );
  };

  const handleSettings = () => {
    const options = [
      'Cancel',
      ...(isAuthenticated ? ['Sign Out'] : ['Sign In']),
      'Privacy Policy',
      'Terms of Service',
      'Help & Support'
    ];

    Alert.alert(
      'Settings',
      'Choose an option:',
      [
        { text: 'Cancel', style: 'cancel' },
        ...(isAuthenticated ? [
          { 
            text: 'Sign Out', 
            style: 'destructive',
            onPress: handleSignOut
          }
        ] : [
          { 
            text: 'Sign In', 
            onPress: handleSignIn
          }
        ]),
        { 
          text: 'Privacy Policy', 
          onPress: () => console.log('Privacy Policy') 
        },
        { 
          text: 'Terms of Service', 
          onPress: () => console.log('Terms of Service') 
        },
        { 
          text: 'Help & Support', 
          onPress: () => console.log('Help & Support') 
        }
      ]
    );
  };

  const handleSignIn = async () => {
    try {
      // For now, we'll use a simple email/password prompt
      // You can replace this with your preferred auth method
      Alert.prompt(
        'Sign In',
        'Enter your email:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign In', 
            onPress: async (email) => {
              if (email) {
                Alert.prompt(
                  'Password',
                  'Enter your password:',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Sign In', 
                      onPress: async (password) => {
                        if (password) {
                          const result = await signIn(email, password);
                          if (result.error) {
                            Alert.alert('Error', result.error.message);
                          }
                        }
                      }
                    }
                  ],
                  'secure-text'
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            const result = await signOut();
            if (result.error) {
              Alert.alert('Error', result.error.message);
            }
          }
        }
      ]
    );
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

  const renderTryOnItem = ({ item }: { item: TryOnResult }) => (
    <TouchableOpacity 
      style={styles.tryOnItem}
      onPress={() => handleTryOnItemPress(item)}
    >
      <View style={styles.tryOnImageContainer}>
        {item.result_image_url ? (
          <Image 
            source={{ uri: item.result_image_url }} 
            style={styles.tryOnImage}
            resizeMode="cover"
          />
        ) : (
          <ImagePlaceholder 
            style={styles.tryOnImage}
            showIcon={false}
          />
        )}
        
        {/* Status indicator */}
        <View style={[
          styles.statusIndicator, 
          { backgroundColor: item.processing_status === 'completed' ? '#4CAF50' : '#FF9800' }
        ]}>
          <AppText variant="tiny" style={styles.statusText}>
            {item.processing_status === 'completed' ? '✓' : '•'}
          </AppText>
        </View>

        {/* Video indicator if video exists */}
        {item.result_video_url && (
          <View style={styles.videoIndicator}>
            <Video size={12} color="white" />
          </View>
        )}
      </View>
      
      <AppText variant="tiny" style={styles.tryOnDate} numberOfLines={1}>
        {new Date(item.created_at).toLocaleDateString()}
      </AppText>
    </TouchableOpacity>
  );

  const handleTryOnItemPress = (item: TryOnResult) => {
    Alert.alert(
      'Try-On Result',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Full Size', onPress: () => console.log('View:', item.id) },
        { text: 'Share', onPress: () => console.log('Share:', item.id) },
        { text: 'Save to Device', onPress: () => console.log('Save:', item.id) },
        ...(item.result_video_url ? [
          { text: 'View Video', onPress: () => console.log('Video:', item.id) }
        ] : [])
      ]
    );
  };

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
      {/* Top Header with Name and Icons - Fixed at top */}
      <View style={styles.topHeader}>
        <AppText variant="heading" style={styles.accountName}>
          {user.name}
        </AppText>
        <View style={styles.topIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Notifications')}>
            <Bell color={colors.text.primary} size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSettings}>
            <MoreVertical color={colors.text.primary} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            {/* Left: Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.profileImageContainer}>
                {user.profileImage ? (
                  <View style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <User color={colors.text.secondary} size={32} />
                  </View>
                )}
              </View>
              <AppText variant="small" style={styles.usernameHandle}>
                {user.username}
              </AppText>
            </View>

            {/* Right: Stats */}
            <View style={styles.statsSection}>
              <TouchableOpacity style={styles.statColumn}>
                <AppText variant="body" style={styles.statNumber}>
                  0
                </AppText>
                <AppText variant="small" style={styles.statLabel}>
                  Posts
                </AppText>
              </TouchableOpacity>
              
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
          </View>



          {/* Action Buttons */}
          <View style={styles.actionButtonsSection}>
            <Button
              title="Edit Profile"
              variant="outline"
              size="sm"
              onPress={handleEditProfile}
              style={styles.editProfileButton}
            />
            <Button
              title="Get Pro"
              variant="primary"
              size="md"
              onPress={() => console.log('Get Pro')}
              style={styles.getProButton}
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
          {loadingTryOns && activeTab === 'tryOn' ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <AppText style={styles.loadingText}>Loading your try-ons...</AppText>
            </View>
          ) : (
            <FlatList
              data={activeTab === 'tryOn' ? tryOnResults : contentData[activeTab]}
              renderItem={activeTab === 'tryOn' ? renderTryOnItem : renderContentItem}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.gridContainer}
              columnWrapperStyle={styles.gridRow}
              ItemSeparatorComponent={() => <View style={styles.gridSeparator} />}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                activeTab === 'tryOn' ? (
                  <View style={styles.emptyContainer}>
                    <Shirt size={48} color={colors.text.secondary} />
                    <AppText style={styles.emptyText}>No try-on results yet</AppText>
                    <AppText variant="small" style={styles.emptySubtext}>
                      Start trying on clothes to see your results here!
                    </AppText>
                  </View>
                ) : null
              }
            />
          )}
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  accountName: {
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 20,
  },
  topIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    backgroundColor: colors.background.main,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  profileImageContainer: {
    marginBottom: 8,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.off,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.off,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  usernameHandle: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
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

  actionButtonsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  editProfileButton: {
    flex: 0.4,
    borderRadius: 8,
  },
  getProButton: {
    flex: 0.6,
    borderRadius: 8,
    backgroundColor: colors.success,
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

  // Try-on specific styles
  tryOnItem: {
    width: itemWidth,
    backgroundColor: colors.background.main,
    borderRadius: 8,
    overflow: 'hidden',
  },

  tryOnImageContainer: {
    position: 'relative',
    aspectRatio: 3/4,
    backgroundColor: colors.background.off,
  },

  tryOnImage: {
    width: '100%',
    height: '100%',
  },

  statusIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  videoIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 4,
  },

  tryOnDate: {
    marginTop: 4,
    textAlign: 'center',
    color: colors.text.secondary,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    marginTop: 12,
    color: colors.text.secondary,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  emptyText: {
    marginTop: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },

  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
    color: colors.text.secondary,
    paddingHorizontal: 20,
  },
}); 