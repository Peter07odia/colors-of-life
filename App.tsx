import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-gesture-handler';

import { RootNavigator } from './src/navigation/RootNavigator';
import CustomSplashScreen from './src/components/SplashScreen';
import OnboardingFlow from './src/components/onboarding/OnboardingFlow';
import { TryOnProvider } from './src/contexts/TryOnContext';

type AppState = 'splash' | 'onboarding' | 'main';

export default function App() {
  const [appState, setAppState] = useState<AppState>('splash');

  const handleSplashFinish = async () => {
    try {
      // Check if user has completed onboarding
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      
      if (hasCompletedOnboarding === 'true') {
        // User has completed onboarding, go directly to main app
        setAppState('main');
      } else {
        // User hasn't completed onboarding, show onboarding flow
        setAppState('onboarding');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to onboarding if we can't check
      setAppState('onboarding');
    }
  };

  const handleOnboardingComplete = () => {
    setAppState('main');
  };

  if (appState === 'splash') {
    return (
      <SafeAreaProvider>
        <CustomSplashScreen onFinish={handleSplashFinish} />
      </SafeAreaProvider>
    );
  }

  if (appState === 'onboarding') {
    return (
      <SafeAreaProvider>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <TryOnProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
      </TryOnProvider>
    </SafeAreaProvider>
  );
} 