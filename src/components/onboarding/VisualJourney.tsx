import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface VisualJourneyProps {
  gender: string;
  onStylesSelect: (styles: string[]) => void;
  onBack?: () => void;
  onSkip?: () => void;
}

const allStyleCategories = [
  {
    id: 'casual',
    label: 'Casual',
    description: 'Everyday comfort with a relaxed vibe',
    gradient: ['#FF6B9D', '#FF8E9B'],
    maleImage: require('../../../assets/style folder/Casual Attire male.png'),
    femaleImage: require('../../../assets/style folder/Casual attire female.png'),
    gender: 'both',
  },
  {
    id: 'professional',
    label: 'Professional',
    description: 'Polished looks for the workplace',
    gradient: ['#6C5CE7', '#A29BFE'],
    maleImage: require('../../../assets/style folder/Professional Portrait male.png'),
    femaleImage: require('../../../assets/style folder/Professional Portrait female.png'),
    gender: 'both',
  },
  {
    id: 'bohemian',
    label: 'Bohemian',
    description: 'Free-spirited with artistic flair',
    gradient: ['#00B894', '#55A3FF'],
    maleImage: require('../../../assets/style folder/Bohemian Style male.png'),
    femaleImage: require('../../../assets/style folder/Bohemian Style female.png'),
    gender: 'both',
  },
  {
    id: 'minimalist',
    label: 'Minimalist',
    description: 'Clean lines and understated elegance',
    gradient: ['#636E72', '#B2BEC3'],
    maleImage: require('../../../assets/style folder/Minimalist Outfit Style male.png'),
    femaleImage: require('../../../assets/style folder/Minimalist Fashion Style female.png'),
    gender: 'both',
  },
  {
    id: 'vintage',
    label: 'Vintage',
    description: 'Timeless styles from the past',
    gradient: ['#FDCB6E', '#E17055'],
    maleImage: require('../../../assets/style folder/Vintage Style Portrait male.png'),
    femaleImage: require('../../../assets/style folder/Vintage Style Portrait female.png'),
    gender: 'both',
  },
  {
    id: 'glamorous',
    label: 'Glamorous',
    description: 'Bold, eye-catching statement pieces',
    gradient: ['#FD79A8', '#E84393'],
    maleImage: require('../../../assets/style folder/glamorous style male.png'),
    femaleImage: require('../../../assets/style folder/Glamorous Style Portrait female.png'),
    gender: 'both',
  },
  {
    id: 'athleisure',
    label: 'Athleisure',
    description: 'Athletic meets leisure for active lifestyles',
    gradient: ['#74B9FF', '#0984E3'],
    maleImage: require('../../../assets/style folder/athleisure male.png'),
    femaleImage: require('../../../assets/style folder/athleisure female.png'),
    gender: 'both',
  },
  {
    id: 'streetwear',
    label: 'Streetwear',
    description: 'Urban-inspired casual coolness',
    gradient: ['#2D3436', '#636E72'],
    maleImage: require('../../../assets/style folder/Streetwear Style Portrait male.png'),
    femaleImage: require('../../../assets/style folder/Streetwear Style Portrait female.png'),
    gender: 'both',
  },
];

export default function VisualJourney({ gender, onStylesSelect, onBack, onSkip }: VisualJourneyProps) {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  // Filter styles based on gender (for now showing all, but ready for gender-specific filtering)
  const styleCategories = allStyleCategories.filter(style => 
    style.gender === 'both' || style.gender === gender
  );

  const stylesPerPage = 4;
  const totalPages = Math.ceil(styleCategories.length / stylesPerPage);
  
  const getCurrentPageStyles = () => {
    const startIndex = currentPage * stylesPerPage;
    return styleCategories.slice(startIndex, startIndex + stylesPerPage);
  };

  const getImageForStyle = (style: any) => {
    // Return appropriate image based on gender
    if (gender === 'male') {
      return style.maleImage;
    } else if (gender === 'female') {
      return style.femaleImage;
    } else {
      // For 'other', default to female image or could alternate
      return style.femaleImage;
    }
  };

  const handleStyleToggle = (styleId: string) => {
    setSelectedStyles(prev => {
      if (prev.includes(styleId)) {
        return prev.filter(id => id !== styleId);
      } else {
        return [...prev, styleId];
      }
    });
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleContinue = () => {
    if (selectedStyles.length > 0) {
      onStylesSelect(selectedStyles);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const currentPageStyles = getCurrentPageStyles();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header with Skip Button */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Find Your Style</Text>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            Select the styles that resonate with you
          </Text>
        </View>

        {/* Style Cards Grid */}
        <View style={styles.gridContainer}>
          {currentPageStyles.map((style, index) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.styleCard,
                selectedStyles.includes(style.id) && styles.selectedStyleCard,
              ]}
              onPress={() => handleStyleToggle(style.id)}
            >
              <View style={styles.cardContent}>
                {/* Style Image */}
                <View style={styles.imageContainer}>
                  <Image
                    source={getImageForStyle(style)}
                    style={styles.styleImage}
                    resizeMode="cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.gradientOverlay}
                  />
                  
                  {/* Label */}
                  <View style={styles.labelContainer}>
                    <Text style={styles.styleLabel}>{style.label}</Text>
                  </View>
                  
                  {/* Selection Indicator */}
                  {selectedStyles.includes(style.id) && (
                    <View style={styles.heartContainer}>
                      <Text style={styles.heart}>❤️</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected Styles Count */}
        <View style={styles.selectedCount}>
          <Text style={styles.selectedText}>
            {selectedStyles.length} style{selectedStyles.length !== 1 ? 's' : ''} selected
          </Text>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, currentPage === 0 && styles.disabledButton]}
            onPress={handlePrevious}
            disabled={currentPage === 0}
          >
            <Text style={[styles.navButtonText, currentPage === 0 && styles.disabledText]}>
              Previous
            </Text>
          </TouchableOpacity>

          {currentPage < totalPages - 1 ? (
            <TouchableOpacity
              style={styles.navButton}
              onPress={handleNext}
            >
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.continueButton,
                selectedStyles.length === 0 && styles.disabledButton,
              ]}
              onPress={handleContinue}
              disabled={selectedStyles.length === 0}
            >
              <LinearGradient
                colors={selectedStyles.length > 0 ? ['#7928CA', '#FF0080'] : ['#E5E7EB', '#E5E7EB']}
                style={styles.continueGradient}
              >
                <Text style={[
                  styles.continueButtonText,
                  selectedStyles.length === 0 && styles.disabledText,
                ]}>
                  Continue
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress for overall onboarding */}
        <View style={styles.overallProgress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '66%' }]} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  gridContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  styleCard: {
    width: (width - 60) / 2, // 2 columns with margins
    height: 200, // Increased from 140
    borderRadius: 20,
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  selectedStyleCard: {
    transform: [{ scale: 1.02 }],
    elevation: 10,
    shadowOpacity: 0.3,
  },
  cardContent: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  styleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  labelContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  styleLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heartContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heart: {
    fontSize: 20,
  },
  selectedCount: {
    alignItems: 'center',
    marginVertical: 20,
  },
  selectedText: {
    fontSize: 16,
    color: '#7928CA',
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  navButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueGradient: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  continueButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#9CA3AF',
  },
  overallProgress: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7928CA',
    borderRadius: 2,
  },
}); 