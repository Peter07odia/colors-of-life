import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button } from '../ui/Button';
import { Heading, AppText } from '../ui/Typography';
import { colors } from '../../constants/colors';
import { defaultModelService } from '../../services/defaultModelService';
import { AvatarGallery } from '../tryOn/AvatarGallery';

interface DefaultModelsTestProps {
  userId: string;
}

export function DefaultModelsTest({ userId }: DefaultModelsTestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatarGallery, setShowAvatarGallery] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<any>(null);
  const [defaultModels, setDefaultModels] = useState<any[]>([]);

  const createDefaultModels = async () => {
    try {
      setIsLoading(true);
      const models = await defaultModelService.createDefaultModelsForUser(userId);
      setDefaultModels(models);
      Alert.alert('Success', `Created ${models.length} default models!`);
    } catch (error) {
      console.error('Failed to create default models:', error);
      Alert.alert('Error', 'Failed to create default models');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultModels = async () => {
    try {
      setIsLoading(true);
      const models = await defaultModelService.getDefaultModelsForUser(userId);
      setDefaultModels(models);
    } catch (error) {
      console.error('Failed to load default models:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDefaultModels();
  }, [userId]);

  const handleAvatarSelect = (avatar: any) => {
    setSelectedAvatar(avatar);
    console.log('Selected avatar:', avatar);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Heading style={styles.title}>Default Models Test</Heading>
        
        <AppText style={styles.description}>
          Test the default model integration. This will upload the images from assets/default models/ 
          to Supabase storage and create database records.
        </AppText>

        <View style={styles.buttonContainer}>
          <Button 
            style={styles.button}
            onPress={createDefaultModels}
            disabled={isLoading}
          >
            <AppText style={styles.buttonText}>
              {isLoading ? 'Creating...' : 'Create Default Models'}
            </AppText>
          </Button>

          <Button 
            style={styles.button}
            onPress={() => setShowAvatarGallery(true)}
          >
            <AppText style={styles.buttonText}>Open Avatar Gallery</AppText>
          </Button>
        </View>

        <View style={styles.statusContainer}>
          <AppText style={styles.statusText}>
            Default Models: {defaultModels.length}/6
          </AppText>
          
          {selectedAvatar && (
            <View style={styles.selectedContainer}>
              <AppText style={styles.selectedTitle}>Selected Avatar:</AppText>
              <AppText style={styles.selectedText}>
                {selectedAvatar.metadata?.name || selectedAvatar.id}
              </AppText>
              <AppText style={styles.selectedSubtext}>
                Type: {selectedAvatar.avatar_type}
              </AppText>
              {selectedAvatar.metadata?.description && (
                <AppText style={styles.selectedSubtext}>
                  {selectedAvatar.metadata.description}
                </AppText>
              )}
            </View>
          )}
        </View>

        {/* Avatar Gallery Modal */}
        {showAvatarGallery && (
          <AvatarGallery
            onClose={() => setShowAvatarGallery(false)}
            onSelectAvatar={handleAvatarSelect}
            selectedAvatarId={selectedAvatar?.id}
            userId={userId}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text.primary,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    color: colors.textSecondary,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    backgroundColor: colors.backgroundAlt,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text.primary,
  },
  selectedContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.text.primary,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: colors.primary,
  },
  selectedSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
}); 