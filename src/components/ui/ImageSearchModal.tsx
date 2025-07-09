import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Camera, Image as ImageIcon, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { AppText } from './Typography';
import { Button } from './Button';
import { colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

interface ImageSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelect: (imageUri: string) => void;
}

export default function ImageSearchModal({ 
  visible, 
  onClose, 
  onImageSelect 
}: ImageSearchModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to search with images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera permissions to take photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImageFromLibrary = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleSearch = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    try {
      // Call the image search service
      onImageSelect(selectedImage);
      onClose();
    } catch (error) {
      console.error('Error searching with image:', error);
      Alert.alert('Error', 'Failed to search with image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <AppText variant="h3" style={styles.title}>
            Search with Image
          </AppText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <X size={20} color={colors.background.main} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Upload size={48} color={colors.text.secondary} />
              <AppText variant="body" color="secondary" style={styles.placeholderText}>
                Upload an image to find similar fashion items
              </AppText>
              <AppText variant="small" color="secondary" style={styles.hintText}>
                Take a photo or choose from your gallery
              </AppText>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Take Photo"
              variant="outline"
              onPress={takePhoto}
              style={styles.actionButton}
              leftIcon={<Camera size={20} color="#7928CA" />}
            />
            <Button
              title="Choose from Gallery"
              variant="outline"
              onPress={pickImageFromLibrary}
              style={styles.actionButton}
              leftIcon={<ImageIcon size={20} color="#7928CA" />}
            />
          </View>

          {selectedImage && (
            <Button
              title={isUploading ? "Searching..." : "Search Similar Items"}
              variant="primary"
              onPress={handleSearch}
              disabled={isUploading}
              style={styles.searchButton}
            />
          )}
        </View>

        <View style={styles.footer}>
          <AppText variant="tiny" color="secondary" style={styles.footerText}>
            We'll analyze your image to find similar colors, patterns, and styles
          </AppText>
        </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.off,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  imageContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 32,
  },
  selectedImage: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 12,
    backgroundColor: colors.background.off,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 8,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  placeholderText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
  },
  hintText: {
    textAlign: 'center',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  searchButton: {
    marginTop: 8,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
  },
});

export { ImageSearchModal };