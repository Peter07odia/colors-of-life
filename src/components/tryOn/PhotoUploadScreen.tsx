import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import {
  X,
  Plus,
  Camera,
  Upload,
  Check,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { Button } from '../ui/Button';
import { Heading, AppText } from '../ui/Typography';
import { colors } from '../../constants/colors';

interface PhotoUploadScreenProps {
  visible: boolean;
  onClose: () => void;
  onPhotosUploaded: (photos: { front?: string; side?: string; back?: string }) => void;
}

interface PhotoSlot {
  id: 'front' | 'side' | 'back';
  title: string;
  image: string | null;
}

export function PhotoUploadScreen({ visible, onClose, onPhotosUploaded }: PhotoUploadScreenProps) {
  const [photos, setPhotos] = useState<PhotoSlot[]>([
    { id: 'front', title: 'Front View', image: null },
    { id: 'side', title: 'Side View (Optional)', image: null },
    { id: 'back', title: 'Back View (Optional)', image: null },
  ]);

  const [showImagePicker, setShowImagePicker] = useState<string | null>(null);

  // Example images for demonstration - showing different angles
  const frontViewImage = 'https://jiwiclemrwjojoewmcnc.supabase.co/storage/v1/object/public/fashion-items/demo/avatar-sample.png';
  const sideViewImage = require('../../../assets/side-view.png');
  const backViewImage = require('../../../assets/back-view.png');
  
  const exampleImages = [
    frontViewImage, // Front view
    sideViewImage,  // Side view  
    backViewImage,  // Back view
  ];

  const handlePhotoSelection = async (photoId: string, method: 'camera' | 'gallery') => {
    try {
      let result;
      
      if (method === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera access is required to take photos');
          return;
        }
        
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setPhotos(prev => 
          prev.map(photo => 
            photo.id === photoId 
              ? { ...photo, image: result.assets[0].uri }
              : photo
          )
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    } finally {
      setShowImagePicker(null);
    }
  };

  const removePhoto = (photoId: string) => {
    setPhotos(prev => 
      prev.map(photo => 
        photo.id === photoId 
          ? { ...photo, image: null }
          : photo
      )
    );
  };

  const hasMinimumPhotos = photos.find(photo => photo.id === 'front')?.image !== null;

  const handleProcessPhotos = () => {
    const photoData = photos.reduce((acc, photo) => {
      if (photo.image) {
        acc[photo.id] = photo.image;
      }
      return acc;
    }, {} as { front?: string; side?: string; back?: string });

    onPhotosUploaded(photoData);
  };

  const renderPhotoSlot = (photo: PhotoSlot) => (
    <TouchableOpacity
      key={photo.id}
      style={[styles.photoSlot, photo.image && styles.photoSlotFilled]}
      onPress={() => setShowImagePicker(photo.id)}
    >
      {photo.image ? (
        <>
          <Image source={{ uri: photo.image }} style={styles.uploadedImage} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removePhoto(photo.id)}
          >
            <X size={16} color="#fff" />
          </TouchableOpacity>
          <View style={styles.successIndicator}>
            <Check size={16} color="#fff" />
          </View>
        </>
      ) : (
        <>
          <View style={styles.plusIcon}>
            <Plus size={32} color={colors.textSecondary} />
          </View>
          <Text style={styles.photoSlotTitle}>{photo.title}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  const renderImagePickerModal = () => (
    <Modal
      visible={showImagePicker !== null}
      transparent
      animationType="fade"
      onRequestClose={() => setShowImagePicker(null)}
    >
      <BlurView intensity={95} style={styles.pickerOverlay}>
        <View style={styles.pickerModal}>
          <Text style={styles.pickerTitle}>Add Photo</Text>
          
          <View style={styles.pickerOptions}>
            <TouchableOpacity
              style={styles.pickerOption}
              onPress={() => handlePhotoSelection(showImagePicker!, 'camera')}
            >
              <View style={styles.pickerOptionIcon}>
                <Camera size={24} color="#fff" />
              </View>
              <Text style={styles.pickerOptionTitle}>Take Photo</Text>
              <Text style={styles.pickerOptionSubtitle}>Use camera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.pickerOption, styles.pickerOptionSecondary]}
              onPress={() => handlePhotoSelection(showImagePicker!, 'gallery')}
            >
              <View style={[styles.pickerOptionIcon, styles.pickerOptionIconSecondary]}>
                <Upload size={24} color={colors.primary} />
              </View>
              <Text style={[styles.pickerOptionTitle, styles.pickerOptionTitleSecondary]}>Choose from Gallery</Text>
              <Text style={[styles.pickerOptionSubtitle, styles.pickerOptionSubtitleSecondary]}>Select existing photo</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.pickerCloseButton}
            onPress={() => setShowImagePicker(null)}
          >
            <X size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Heading style={styles.title}>Photo Upload</Heading>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Instructions */}
          <View style={styles.instructionsSection}>
            <Text style={styles.subtitle}>Upload your photo for avatar creation</Text>
            
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Full body front view in fitted clothing (Required)</Text>
              <Text style={styles.bulletPoint}>• Side and back views for better accuracy (Optional)</Text>
              <Text style={styles.bulletPoint}>• Plain background recommended</Text>
            </View>
            
            <Text style={styles.privacyNote}>Photos are deleted after processing</Text>
          </View>

          {/* Photo Upload Slots */}
          <View style={styles.photoSlotsContainer}>
            {photos.map(renderPhotoSlot)}
          </View>

          {/* Example Photos */}
          <View style={styles.examplesSection}>
            <Text style={styles.examplesTitle}>See examples of good photos</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.examplesScroll}
              contentContainerStyle={styles.examplesContent}
            >
              {exampleImages.map((image, index) => (
                <View key={index} style={styles.exampleImageContainer}>
                  <Image source={image} style={styles.exampleImage} />
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Process Button */}
        <View style={styles.footer}>
          <Button
            title="Create Avatar"
            onPress={handleProcessPhotos}
            disabled={!hasMinimumPhotos}
            variant={hasMinimumPhotos ? "primary" : "secondary"}
            style={styles.processButton}
          />
          {!hasMinimumPhotos && (
            <Text style={styles.minimumPhotosText}>
              Upload front view photo to continue
            </Text>
          )}
        </View>

        {renderImagePickerModal()}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.off,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  instructionsSection: {
    paddingVertical: 24,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  bulletPoints: {
    marginBottom: 16,
  },
  bulletPoint: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 8,
    paddingLeft: 4,
  },
  privacyNote: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  photoSlotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  photoSlot: {
    width: '30%',
    aspectRatio: 3/4,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.off,
    position: 'relative',
  },
  photoSlotFilled: {
    borderStyle: 'solid',
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  plusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoSlotTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'center',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examplesSection: {
    marginBottom: 32,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  examplesScroll: {
    marginHorizontal: -20,
  },
  examplesContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  exampleImageContainer: {
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.background.off,
  },
  exampleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  processButton: {
    marginBottom: 8,
  },
  minimumPhotosText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Image Picker Modal Styles
  pickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    position: 'relative',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerOption: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  pickerOptionSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  pickerOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickerOptionIconSecondary: {
    backgroundColor: colors.primary,
  },
  pickerOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  pickerOptionTitleSecondary: {
    color: colors.primary,
  },
  pickerOptionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  pickerOptionSubtitleSecondary: {
    color: colors.textSecondary,
  },
  pickerCloseButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
}); 