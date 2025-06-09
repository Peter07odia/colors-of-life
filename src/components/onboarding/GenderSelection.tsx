import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Animated,
} from 'react-native';
import { User, Users } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface GenderSelectionProps {
  onGenderSelect: (gender: string) => void;
  onBack?: () => void;
}

const genderOptions = [
  { 
    id: 'male', 
    label: 'Male', 
    icon: User,
  },
  { 
    id: 'female', 
    label: 'Female', 
    icon: User,
  },
  { 
    id: 'other', 
    label: 'Other', 
    icon: Users,
  },
];

export default function GenderSelection({ onGenderSelect, onBack }: GenderSelectionProps) {
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [animatedValues] = useState(
    genderOptions.map(() => new Animated.Value(1))
  );

  const handleSelect = (genderId: string, index: number) => {
    setSelectedGender(genderId);
    
    // Animate the selected card
    Animated.sequence([
      Animated.timing(animatedValues[index], {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Proceed to next step after animation
    setTimeout(() => {
      onGenderSelect(genderId);
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Gender</Text>
        </View>

        {/* Gender Options */}
        <View style={styles.optionsContainer}>
          {genderOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <Animated.View
                key={option.id}
                style={[
                  styles.optionWrapper,
                  {
                    transform: [{ scale: animatedValues[index] }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    selectedGender === option.id && styles.selectedCard,
                  ]}
                  onPress={() => handleSelect(option.id, index)}
                  activeOpacity={0.7}
                >
                  {/* Icon */}
                  <IconComponent 
                    size={32} 
                    color={selectedGender === option.id ? '#7928CA' : '#6B7280'} 
                  />
                  
                  {/* Label */}
                  <Text style={[
                    styles.optionLabel,
                    selectedGender === option.id && styles.selectedLabel
                  ]}>
                    {option.label}
                  </Text>

                  {/* Selection Indicator */}
                  {selectedGender === option.id && (
                    <View style={styles.selectionIndicator}>
                      <View style={styles.checkmarkContainer}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressWrapper}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '33%' }]} />
            </View>
            <Text style={styles.progressText}>Step 1 of 3</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    lineHeight: 38,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
  optionWrapper: {
    height: 100,
  },
  optionCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCard: {
    borderColor: '#7928CA',
    backgroundColor: '#F5F0FF',
    shadowColor: '#7928CA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  optionLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 16,
  },
  selectedLabel: {
    color: '#7928CA',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7928CA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  progressWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7928CA',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
}); 