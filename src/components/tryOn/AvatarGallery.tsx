import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
import { BlurView } from 'expo-blur';
import {
  Plus,
  X,
  User,
  Star,
  Trash2,
  Edit,
  Download,
  Share,
  MoreVertical,
  Camera,
  Check
} from 'lucide-react-native';

import { Button } from '../ui/Button';
import { Heading, AppText } from '../ui/Typography';
import { colors } from '../../constants/colors';
import { enhancedVirtualTryOnService } from '../../services/enhancedVirtualTryOnService';
import { defaultModelService } from '../../services/defaultModelService';
import { AvatarCreationFlow } from './AvatarCreationFlow';

interface AvatarGalleryProps {
  onClose: () => void;
  onSelectAvatar: (avatar: any) => void;
  selectedAvatarId?: string;
  userId: string;
}

interface Avatar {
  id: string;
  avatar_url: string;
  avatar_type: 'professional' | 'casual' | 'formal' | 'generic' | 'ai_generated' | 'custom';
  processing_status: 'completed' | 'processing' | 'failed';
  quality_score?: number;
  created_at: string;
  is_primary: boolean;
  metadata?: {
    style?: string;
    background?: string;
    lighting?: string;
    bodyType?: string;
    name?: string;
    description?: string;
    isDefaultModel?: boolean;
  };
}

export function AvatarGallery({ 
  onClose, 
  onSelectAvatar, 
  selectedAvatarId, 
  userId 
}: AvatarGalleryProps) {
  // State management
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [defaultModels, setDefaultModels] = useState<Avatar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAvatarCreation, setShowAvatarCreation] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(selectedAvatarId || null);
  const [activeTab, setActiveTab] = useState<'default' | 'custom'>('default');

  // Load user avatars and default models
  const loadAvatars = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load default models and user avatars in parallel
      const [defaultModelsData, userAvatars] = await Promise.all([
        defaultModelService.getDefaultModelsForUser(userId),
        enhancedVirtualTryOnService.getUserAvatars()
      ]);
      
      // Filter out custom avatars (exclude default models that might be in user avatars)
      const customAvatars = userAvatars.filter(avatar => 
        avatar.avatar_type !== 'generic' || !avatar.metadata?.isDefaultModel
      );
      
      setDefaultModels(defaultModelsData as Avatar[]);
      setAvatars(customAvatars);
      
      // Set default selected avatar if none selected
      if (!selectedAvatar) {
        if (defaultModelsData.length > 0) {
          // Try to find user's primary avatar first
          const primaryAvatar = [...defaultModelsData, ...customAvatars].find(avatar => avatar.is_primary);
          if (primaryAvatar) {
            setSelectedAvatar(primaryAvatar.id);
          } else {
            // Default to recommended model or first default model
            const recommended = await defaultModelService.getRecommendedDefaultModel(userId);
            setSelectedAvatar(recommended?.id || defaultModelsData[1]?.id || defaultModelsData[0]?.id);
          }
        } else if (customAvatars.length > 0) {
          setSelectedAvatar(customAvatars[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load avatars:', error);
      Alert.alert('Error', 'Failed to load avatars');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAvatar, userId]);

  // Refresh avatars
  const refreshAvatars = useCallback(async () => {
    setIsRefreshing(true);
    await loadAvatars();
    setIsRefreshing(false);
  }, [loadAvatars]);

  // Load avatars on mount
  useEffect(() => {
    loadAvatars();
  }, [loadAvatars]);

  // Handle avatar creation completion
  const handleAvatarCreated = useCallback((avatarData: any) => {
    setShowAvatarCreation(false);
    refreshAvatars();
    
    // Auto-select the newly created avatar
    if (avatarData.avatarId) {
      setSelectedAvatar(avatarData.avatarId);
    }
  }, [refreshAvatars]);

  // Handle avatar selection
  const handleAvatarSelect = useCallback((avatar: Avatar) => {
    setSelectedAvatar(avatar.id);
    onSelectAvatar(avatar);
  }, [onSelectAvatar]);

  // Delete avatar
  const deleteAvatar = useCallback(async (avatarId: string) => {
    Alert.alert(
      'Delete Avatar',
      'Are you sure you want to delete this avatar? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement avatar deletion
              Alert.alert('Success', 'Avatar deleted successfully');
              refreshAvatars();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete avatar');
            }
          },
        },
      ]
    );
  }, [refreshAvatars]);

  // Set as default avatar
  const setAsDefault = useCallback(async (avatarId: string) => {
    try {
      // TODO: Implement set as default functionality
      Alert.alert('Success', 'Default avatar updated');
      refreshAvatars();
    } catch (error) {
      Alert.alert('Error', 'Failed to update default avatar');
    }
  }, [refreshAvatars]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get avatar type display name
  const getAvatarTypeDisplay = (avatar: Avatar) => {
    if (avatar.metadata?.isDefaultModel && avatar.metadata?.name) {
      return avatar.metadata.name;
    }
    
    switch (avatar.avatar_type) {
      case 'professional': return 'Professional';
      case 'casual': return 'Casual';
      case 'formal': return 'Formal';
      case 'generic': return 'Default Model';
      case 'ai_generated': return 'AI Generated';
      case 'custom': return 'Custom';
      default: return 'Standard';
    }
  };

  // Render avatar item
  const renderAvatarItem = ({ item: avatar }: { item: Avatar }) => (
    <TouchableOpacity
      style={[
        styles.avatarItem,
        selectedAvatar === avatar.id && styles.avatarItemSelected,
      ]}
      onPress={() => handleAvatarSelect(avatar)}
    >
      {/* Avatar Image */}
      <View style={styles.avatarImageContainer}>
        <Image source={{ uri: avatar.avatar_url }} style={styles.avatarImage} />
        
        {/* Selection Indicator */}
        {selectedAvatar === avatar.id && (
          <View style={styles.selectionIndicator}>
            <Check size={16} color="#fff" />
          </View>
        )}

        {/* Primary Badge */}
        {avatar.is_primary && (
          <View style={styles.defaultBadge}>
            <Star size={12} color="#FFD700" fill="#FFD700" />
          </View>
        )}

        {/* Quality Score */}
        {avatar.quality_score && (
          <View style={styles.qualityBadge}>
            <AppText style={styles.qualityText}>
              {Math.round(avatar.quality_score)}%
            </AppText>
          </View>
        )}
      </View>

      {/* Avatar Details */}
      <View style={styles.avatarDetails}>
        <AppText style={styles.avatarType}>
          {getAvatarTypeDisplay(avatar)}
        </AppText>
        {avatar.metadata?.description ? (
          <AppText style={styles.avatarDescription} numberOfLines={2}>
            {avatar.metadata.description}
          </AppText>
        ) : (
          <AppText style={styles.avatarDate}>
            {formatDate(avatar.created_at)}
          </AppText>
        )}
      </View>

      {/* Actions Menu */}
      <TouchableOpacity
        style={styles.actionsButton}
        onPress={() => {
          Alert.alert(
            'Avatar Actions',
            'Choose an action',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Set as Default',
                onPress: () => setAsDefault(avatar.id),
              },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteAvatar(avatar.id),
              },
            ]
          );
        }}
      >
        <MoreVertical size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <User size={48} color={colors.textSecondary} />
      <Heading style={styles.emptyTitle}>No Avatars Yet</Heading>
      <AppText style={styles.emptyDescription}>
        Create your first avatar to start using virtual try-on features!
      </AppText>
      <Button
        style={[styles.actionButton, styles.primaryButton]}
        onPress={() => setShowAvatarCreation(true)}
      >
        <Camera size={20} color="#fff" />
        <AppText style={styles.buttonText}>Create Avatar</AppText>
      </Button>
    </View>
  );

  // Render loading state
  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <AppText>Loading avatars...</AppText>
    </View>
  );

  // Main render
  return (
    <View style={styles.container}>
      <BlurView intensity={95} style={styles.blurOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Heading style={styles.title}>Choose Avatar</Heading>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'default' && styles.activeTab]}
              onPress={() => setActiveTab('default')}
            >
              <AppText style={[styles.tabText, activeTab === 'default' && styles.activeTabText]}>
                Default Models ({defaultModels.length})
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'custom' && styles.activeTab]}
              onPress={() => setActiveTab('custom')}
            >
              <AppText style={[styles.tabText, activeTab === 'custom' && styles.activeTabText]}>
                Your Avatars ({avatars.length})
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Avatar Grid */}
          {isLoading ? (
            renderLoadingState()
          ) : (
            <View style={styles.avatarGrid}>
              {activeTab === 'default' ? (
                defaultModels.length === 0 ? (
                  <View style={styles.emptyState}>
                    <User size={48} color={colors.textSecondary} />
                    <Heading style={styles.emptyTitle}>Loading Default Models</Heading>
                    <AppText style={styles.emptyDescription}>
                      Setting up your default avatar models...
                    </AppText>
                  </View>
                ) : (
                  <FlatList
                    data={defaultModels}
                    renderItem={renderAvatarItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.avatarRow}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={refreshAvatars}
                        tintColor={colors.primary}
                      />
                    }
                  />
                )
              ) : (
                avatars.length === 0 ? (
                  <View style={styles.emptyState}>
                    <User size={48} color={colors.textSecondary} />
                    <Heading style={styles.emptyTitle}>No Custom Avatars Yet</Heading>
                    <AppText style={styles.emptyDescription}>
                      Create your first custom avatar to get started!
                    </AppText>
                    <Button
                      style={[styles.actionButton, styles.primaryButton]}
                      onPress={() => setShowAvatarCreation(true)}
                    >
                      <Camera size={20} color="#fff" />
                      <AppText style={styles.buttonText}>Create Avatar</AppText>
                    </Button>
                  </View>
                ) : (
                  <FlatList
                    data={avatars}
                    renderItem={renderAvatarItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.avatarRow}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={refreshAvatars}
                        tintColor={colors.primary}
                      />
                    }
                  />
                )
              )}
            </View>
          )}

          {/* Create Avatar Button for Custom Tab */}
          {activeTab === 'custom' && avatars.length > 0 && (
            <View style={styles.createAvatarSection}>
              <Button
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => setShowAvatarCreation(true)}
              >
                <Plus size={20} color={colors.primary} />
                <AppText style={[styles.buttonText, { color: colors.primary }]}>
                  Create New Avatar
                </AppText>
              </Button>
            </View>
          )}

          {/* Action Buttons */}
          {(defaultModels.length > 0 || avatars.length > 0) && (
            <View style={styles.actionButtons}>
              <Button
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={onClose}
              >
                <AppText style={[styles.buttonText, { color: colors.primary }]}>
                  Cancel
                </AppText>
              </Button>

              <Button
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() => {
                  const allAvatars = [...defaultModels, ...avatars];
                  const avatar = allAvatars.find(a => a.id === selectedAvatar);
                  if (avatar) {
                    // If it's a default model, set it as primary
                    if (avatar.metadata?.isDefaultModel) {
                      defaultModelService.setDefaultModelAsPrimary(userId, avatar.id);
                    }
                    onSelectAvatar(avatar);
                    onClose();
                  }
                }}
                disabled={!selectedAvatar}
              >
                <Check size={20} color="#fff" />
                <AppText style={styles.buttonText}>Select Avatar</AppText>
              </Button>
            </View>
          )}
        </View>
      </BlurView>

      {/* Avatar Creation Modal */}
      {showAvatarCreation && (
        <AvatarCreationFlow
          onAvatarCreated={handleAvatarCreated}
          onCancel={() => setShowAvatarCreation(false)}
          userId={userId}
        />
      )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: '#fff',
  },
  createAvatarSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  avatarDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  avatarGrid: {
    flex: 1,
    marginBottom: 20,
  },
  avatarRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  avatarItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarItemSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  avatarImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  selectionIndicator: {
    position: 'absolute',
    top: -4,
    right: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultBadge: {
    position: 'absolute',
    top: -4,
    left: 20,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qualityBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  qualityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  avatarDetails: {
    alignItems: 'center',
  },
  avatarType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  avatarDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionsButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
    marginBottom: 24,
  },
}); 