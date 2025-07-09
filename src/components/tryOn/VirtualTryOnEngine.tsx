import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, Animated } from 'react-native';
import { Video } from 'expo-av';
import { BlurView } from 'expo-blur';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Share,
  Heart,
  Star,
  Zap,
  Sparkles,
  RefreshCw,
  X,
  Check,
  Camera,
  Settings
} from 'lucide-react-native';

import { Button } from '../ui/Button';
import { Heading, AppText } from '../ui/Typography';
import { colors } from '../../constants/colors';
import { enhancedVirtualTryOnService } from '../../services/enhancedVirtualTryOnService';

interface VirtualTryOnEngineProps {
  avatarId: string;
  avatarUrl: string;
  clothingItems: any[];
  onComplete: (result: any) => void;
  onCancel: () => void;
  userId: string;
}

interface TryOnResult {
  success: boolean;
  imageUrl?: string;
  videoUrl?: string;
  enhancedUrl?: string;
  qualityScore?: number;
  processingTime?: number;
}

export function VirtualTryOnEngine({ 
  avatarId, 
  avatarUrl, 
  clothingItems, 
  onComplete, 
  onCancel, 
  userId 
}: VirtualTryOnEngineProps) {
  // State management
  const [step, setStep] = useState<'preview' | 'processing' | 'result' | 'error'>('preview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [tryOnResult, setTryOnResult] = useState<TryOnResult | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [qualityLevel, setQualityLevel] = useState<'standard' | 'high' | 'ultra'>('high');
  const [outputFormat, setOutputFormat] = useState<'image' | 'video' | 'both'>('both');
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Video ref
  const videoRef = useRef<Video>(null);

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Update progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: processingProgress / 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [processingProgress]);

  // Start virtual try-on process
  const startTryOn = useCallback(async () => {
    if (clothingItems.length === 0) {
      Alert.alert('Error', 'Please select at least one clothing item to try on.');
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    setProcessingProgress(0);
    setError(null);

    try {
      // For now, handle single clothing item (can be extended for multiple items)
      const clothingItem = clothingItems[0];

      const result = await enhancedVirtualTryOnService.enhancedVirtualTryOn(
        avatarId,
        clothingItem,
        (status: string, progress?: number) => {
          setProcessingStatus(status);
          if (progress !== undefined) {
            setProcessingProgress(progress);
          } else {
            // Simulate progress based on status
            if (status.includes('Starting')) setProcessingProgress(10);
            else if (status.includes('Analyzing')) setProcessingProgress(25);
            else if (status.includes('Generating')) setProcessingProgress(50);
            else if (status.includes('Enhancing')) setProcessingProgress(75);
            else if (status.includes('Finalizing')) setProcessingProgress(90);
            else if (status.includes('completed')) setProcessingProgress(100);
          }
        }
      );

      if (result.success) {
        setTryOnResult(result);
        setStep('result');
        onComplete(result);
      } else {
        throw new Error(result.message || 'Virtual try-on failed');
      }
    } catch (error) {
      console.error('Virtual try-on error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setStep('error');
    } finally {
      setIsProcessing(false);
    }
  }, [avatarId, clothingItems, onComplete]);

  // Retry try-on process
  const retryTryOn = useCallback(() => {
    setError(null);
    setStep('preview');
    startTryOn();
  }, [startTryOn]);

  // Handle video playback
  const toggleVideoPlayback = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (isVideoPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsVideoPlaying(!isVideoPlaying);
    } catch (error) {
      console.error('Video playback error:', error);
    }
  }, [isVideoPlaying]);

  // Save result to favorites
  const saveToFavorites = useCallback(async () => {
    if (!tryOnResult) return;

    try {
      // TODO: Implement save to favorites functionality
      Alert.alert('Saved!', 'This look has been saved to your favorites.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save to favorites.');
    }
  }, [tryOnResult]);

  // Share result
  const shareResult = useCallback(async () => {
    if (!tryOnResult) return;

    try {
      // TODO: Implement sharing functionality
      Alert.alert('Share', 'Sharing functionality will be implemented here.');
    } catch (error) {
      Alert.alert('Error', 'Failed to share result.');
    }
  }, [tryOnResult]);

  // Render preview step
  const renderPreview = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Heading style={styles.stepTitle}>Virtual Try-On Preview</Heading>
      
      {/* Avatar Preview */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        <View style={styles.avatarOverlay}>
          <AppText style={styles.avatarLabel}>Your Avatar</AppText>
        </View>
      </View>

      {/* Clothing Items Preview */}
      <View style={styles.clothingPreviewContainer}>
        <AppText style={styles.sectionTitle}>Items to Try On:</AppText>
        <View style={styles.clothingItemsList}>
          {clothingItems.map((item, index) => (
            <View key={index} style={styles.clothingItemPreview}>
              <Image source={{ uri: item.image || item.imageUrl }} style={styles.clothingItemImage} />
              <AppText style={styles.clothingItemName} numberOfLines={2}>
                {item.name}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      {/* Settings Panel */}
      {showSettings && (
        <View style={styles.settingsPanel}>
          <AppText style={styles.settingsTitle}>Try-On Settings</AppText>
          
          <View style={styles.settingRow}>
            <AppText style={styles.settingLabel}>Quality Level:</AppText>
            <View style={styles.settingOptions}>
              {(['standard', 'high', 'ultra'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.settingOption,
                    qualityLevel === level && styles.settingOptionActive,
                  ]}
                  onPress={() => setQualityLevel(level)}
                >
                  <AppText
                    style={[
                      styles.settingOptionText,
                      qualityLevel === level && styles.settingOptionTextActive,
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <AppText style={styles.settingLabel}>Output Format:</AppText>
            <View style={styles.settingOptions}>
              {(['image', 'video', 'both'] as const).map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.settingOption,
                    outputFormat === format && styles.settingOptionActive,
                  ]}
                  onPress={() => setOutputFormat(format)}
                >
                  <AppText
                    style={[
                      styles.settingOptionText,
                      outputFormat === format && styles.settingOptionTextActive,
                    ]}
                  >
                    {format.charAt(0).toUpperCase() + format.slice(1)}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowSettings(!showSettings)}
        >
          <Settings size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <Button
          style={[styles.actionButton, styles.primaryButton]}
          onPress={startTryOn}
          disabled={isProcessing}
        >
          <Sparkles size={20} color="#fff" />
          <AppText style={styles.buttonText}>Start Virtual Try-On</AppText>
        </Button>
      </View>
    </Animated.View>
  );

  // Render processing step
  const renderProcessing = () => (
    <View style={styles.stepContainer}>
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Zap size={32} color={colors.primary} style={styles.processingIcon} />
      </View>

      <Heading style={styles.stepTitle}>Creating Your Virtual Try-On</Heading>
      <AppText style={styles.processingStatus}>{processingStatus}</AppText>

      {/* Animated Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]} 
          />
        </View>
        <AppText style={styles.progressText}>{Math.round(processingProgress)}%</AppText>
      </View>

      {/* Processing Steps */}
      <View style={styles.processingSteps}>
        <View style={[styles.processingStep, processingProgress >= 25 && styles.processingStepComplete]}>
          <AppText style={styles.processingStepText}>Analyzing clothing item</AppText>
        </View>
        <View style={[styles.processingStep, processingProgress >= 50 && styles.processingStepComplete]}>
          <AppText style={styles.processingStepText}>Generating virtual try-on</AppText>
        </View>
        <View style={[styles.processingStep, processingProgress >= 75 && styles.processingStepComplete]}>
          <AppText style={styles.processingStepText}>Enhancing quality</AppText>
        </View>
        <View style={[styles.processingStep, processingProgress >= 100 && styles.processingStepComplete]}>
          <AppText style={styles.processingStepText}>Finalizing result</AppText>
        </View>
      </View>

      <AppText style={styles.stepDescription}>
        Our AI is working to create a realistic virtual try-on experience. 
        This usually takes 30-60 seconds.
      </AppText>
    </View>
  );

  // Render result step
  const renderResult = () => (
    <View style={styles.stepContainer}>
      <Heading style={styles.stepTitle}>Your Virtual Try-On Result</Heading>

      {/* Result Display */}
      <View style={styles.resultContainer}>
        {tryOnResult?.videoUrl ? (
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              source={{ uri: tryOnResult.videoUrl }}
              style={styles.resultVideo}
              shouldPlay={false}
              isLooping
              resizeMode="contain"
              onPlaybackStatusUpdate={(status) => {
                if ('isPlaying' in status) {
                  setIsVideoPlaying(status.isPlaying || false);
                }
              }}
            />
            <TouchableOpacity
              style={styles.videoPlayButton}
              onPress={toggleVideoPlayback}
            >
              {isVideoPlaying ? (
                <Pause size={24} color="#fff" />
              ) : (
                <Play size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        ) : tryOnResult?.imageUrl ? (
          <Image source={{ uri: tryOnResult.imageUrl }} style={styles.resultImage} />
        ) : null}

        {/* Quality Score */}
        {tryOnResult?.qualityScore && (
          <View style={styles.qualityBadge}>
            <Star size={16} color="#FFD700" fill="#FFD700" />
            <AppText style={styles.qualityScore}>
              {Math.round(tryOnResult.qualityScore * 100)}% Quality
            </AppText>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.resultActions}>
        <TouchableOpacity style={styles.actionIcon} onPress={saveToFavorites}>
          <Heart size={24} color={colors.primary} />
          <AppText style={styles.actionIconText}>Save</AppText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionIcon} onPress={shareResult}>
          <Share size={24} color={colors.primary} />
          <AppText style={styles.actionIconText}>Share</AppText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionIcon} onPress={retryTryOn}>
          <RefreshCw size={24} color={colors.primary} />
          <AppText style={styles.actionIconText}>Retry</AppText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionIcon}>
          <Download size={24} color={colors.primary} />
          <AppText style={styles.actionIconText}>Download</AppText>
        </TouchableOpacity>
      </View>

      <Button
        style={[styles.actionButton, styles.primaryButton]}
        onPress={() => onComplete(tryOnResult)}
      >
        <Check size={20} color="#fff" />
        <AppText style={styles.buttonText}>Done</AppText>
      </Button>
    </View>
  );

  // Render error step
  const renderError = () => (
    <View style={styles.stepContainer}>
      <View style={styles.errorContainer}>
        <X size={48} color={colors.error} />
      </View>

      <Heading style={styles.stepTitle}>Try-On Failed</Heading>
      <AppText style={styles.errorMessage}>{error}</AppText>

      <View style={styles.buttonContainer}>
        <Button
          style={[styles.actionButton, styles.primaryButton]}
          onPress={retryTryOn}
        >
          <RefreshCw size={20} color="#fff" />
          <AppText style={styles.buttonText}>Try Again</AppText>
        </Button>

        <Button
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={onCancel}
        >
          <AppText style={[styles.buttonText, { color: colors.primary }]}>Cancel</AppText>
        </Button>
      </View>
    </View>
  );

  // Main render
  return (
    <View style={styles.container}>
      <BlurView intensity={95} style={styles.blurOverlay}>
        <View style={styles.modalContent}>
          {step === 'preview' && renderPreview()}
          {step === 'processing' && renderProcessing()}
          {step === 'result' && renderResult()}
          {step === 'error' && renderError()}

          {step !== 'processing' && (
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
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
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    maxHeight: '90%',
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: -8,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  avatarLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  clothingPreviewContainer: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  clothingItemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  clothingItemPreview: {
    alignItems: 'center',
    width: 80,
  },
  clothingItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 4,
  },
  clothingItemName: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  settingsPanel: {
    width: '100%',
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  settingRow: {
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 8,
  },
  settingOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  settingOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  settingOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  settingOptionText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  settingOptionTextActive: {
    color: '#fff',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  settingsButton: {
    alignSelf: 'flex-end',
    padding: 8,
    borderRadius: 8,
    backgroundColor: `${colors.textSecondary}20`,
  },
  actionButton: {
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
  processingContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  processingIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -16,
    marginLeft: -16,
  },
  processingStatus: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: `${colors.primary}20`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  processingSteps: {
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  processingStep: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: `${colors.textSecondary}20`,
  },
  processingStepComplete: {
    backgroundColor: `${colors.success}20`,
  },
  processingStepText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  resultContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  videoContainer: {
    position: 'relative',
    width: 250,
    height: 350,
    borderRadius: 12,
    overflow: 'hidden',
  },
  resultVideo: {
    width: '100%',
    height: '100%',
  },
  videoPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultImage: {
    width: 250,
    height: 350,
    borderRadius: 12,
  },
  qualityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  qualityScore: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  actionIcon: {
    alignItems: 'center',
    gap: 4,
  },
  actionIconText: {
    fontSize: 12,
    color: colors.primary,
  },
  errorContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.error}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  cancelButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 