import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../ui/Button';
import { colors } from '../../constants/colors';
import { DEFAULT_MODELS } from '../../constants/defaultModels';
import { defaultModelService } from '../../services/defaultModelService';
import { supabase } from '../../lib/supabase';

export default function DefaultModelsTestScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [defaultModels, setDefaultModels] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
      console.log('Current user:', session?.user?.id);
    } catch (error) {
      console.error('Failed to get user session:', error);
    }
  };

  const createDefaultModels = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'Please sign in first');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Creating default models for user:', currentUser.id);
      
      const models = await defaultModelService.createDefaultModelsForUser(currentUser.id);
      setDefaultModels(models);
      
      Alert.alert('Success', `Created ${models.length} default models!`);
      console.log('Created models:', models);
    } catch (error) {
      console.error('Failed to create default models:', error);
      Alert.alert('Error', `Failed to create default models: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultModels = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'Please sign in first');
      return;
    }

    try {
      setIsLoading(true);
      const models = await defaultModelService.getDefaultModelsForUser(currentUser.id);
      setDefaultModels(models);
      console.log('Loaded default models:', models);
    } catch (error) {
      console.error('Failed to load default models:', error);
      Alert.alert('Error', `Failed to load default models: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Default Models Test</Text>
        
        <Text style={styles.description}>
          This screen tests the default model integration. It will upload your asset images 
          to Supabase storage and create database records.
        </Text>

        <View style={styles.userInfo}>
          <Text style={styles.userText}>
            {currentUser ? `User: ${currentUser.email}` : 'Not signed in'}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            style={styles.button}
            onPress={createDefaultModels}
            disabled={isLoading || !currentUser}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Creating...' : 'Create Default Models'}
            </Text>
          </Button>

          <Button 
            style={styles.button}
            onPress={loadDefaultModels}
            disabled={isLoading || !currentUser}
          >
            <Text style={styles.buttonText}>Load Default Models</Text>
          </Button>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Local Models Available: {DEFAULT_MODELS.length}
          </Text>
          <Text style={styles.statusText}>
            Database Models: {defaultModels.length}
          </Text>
        </View>

        {/* Show available local models */}
        <View style={styles.modelsContainer}>
          <Text style={styles.sectionTitle}>Available Local Models:</Text>
          {DEFAULT_MODELS.map((model) => (
            <View key={model.id} style={styles.modelCard}>
              <Image source={model.localPath} style={styles.modelImage} />
              <View style={styles.modelInfo}>
                <Text style={styles.modelName}>{model.name}</Text>
                <Text style={styles.modelBodyType}>{model.bodyType}</Text>
                <Text style={styles.modelDescription}>{model.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Show created database models */}
        {defaultModels.length > 0 && (
          <View style={styles.modelsContainer}>
            <Text style={styles.sectionTitle}>Created Database Models:</Text>
            {defaultModels.map((model) => (
              <View key={model.id} style={styles.modelCard}>
                <Image source={{ uri: model.avatar_url }} style={styles.modelImage} />
                <View style={styles.modelInfo}>
                  <Text style={styles.modelName}>
                    {model.metadata?.name || model.id}
                  </Text>
                  <Text style={styles.modelBodyType}>
                    {model.metadata?.bodyType || 'Unknown'}
                  </Text>
                  <Text style={styles.modelDescription}>
                    {model.metadata?.description || 'No description'}
                  </Text>
                  <Text style={styles.modelStatus}>
                    Status: {model.processing_status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  userInfo: {
    backgroundColor: colors.backgroundAlt,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  userText: {
    fontSize: 14,
    color: colors.text.primary,
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
  modelsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.text.primary,
  },
  modelCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border?.light || '#e0e0e0',
  },
  modelImage: {
    width: 60,
    height: 80,
    borderRadius: 6,
    marginRight: 12,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.text.primary,
  },
  modelBodyType: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: colors.primary,
  },
  modelDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  modelStatus: {
    fontSize: 12,
    color: colors.textSecondary,
  },
}); 