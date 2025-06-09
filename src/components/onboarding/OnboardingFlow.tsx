import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import GenderSelection from './GenderSelection';
import VisualJourney from './VisualJourney';
import Welcome from './Welcome';

export type OnboardingStep = 'gender' | 'styles' | 'welcome';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface UserPreferences {
  gender: string;
  styles: string[];
  completed: boolean;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('gender');
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    gender: '',
    styles: [],
    completed: false,
  });

  const handleGenderSelect = (gender: string) => {
    setUserPreferences(prev => ({ ...prev, gender }));
    setCurrentStep('styles');
  };

  const handleStylesSelect = (styles: string[]) => {
    setUserPreferences(prev => ({ ...prev, styles }));
    setCurrentStep('welcome');
  };

  const handleSkip = async () => {
    // Skip onboarding and mark as completed with default preferences
    const defaultPreferences = {
      gender: 'other',
      styles: [],
      completed: true,
    };

    try {
      await AsyncStorage.setItem('userPreferences', JSON.stringify(defaultPreferences));
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      onComplete();
    } catch (error) {
      console.error('Error saving default preferences:', error);
      onComplete();
    }
  };

  const handleComplete = async () => {
    const finalPreferences = {
      ...userPreferences,
      completed: true,
    };

    try {
      // Save user preferences to AsyncStorage
      await AsyncStorage.setItem('userPreferences', JSON.stringify(finalPreferences));
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      
      // Call the completion callback to navigate to main app
      onComplete();
    } catch (error) {
      console.error('Error saving user preferences:', error);
      // Still proceed to main app even if storage fails
      onComplete();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'gender':
        return (
          <GenderSelection
            onGenderSelect={handleGenderSelect}
          />
        );
      case 'styles':
        return (
          <VisualJourney
            gender={userPreferences.gender}
            onStylesSelect={handleStylesSelect}
            onBack={() => setCurrentStep('gender')}
            onSkip={handleSkip}
          />
        );
      case 'welcome':
        return (
          <Welcome
            gender={userPreferences.gender}
            selectedStyles={userPreferences.styles}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderCurrentStep()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 