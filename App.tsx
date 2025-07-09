import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-gesture-handler';

import { RootNavigator } from './src/navigation/RootNavigator';
import CustomSplashScreen from './src/components/SplashScreen';
import OnboardingFlow from './src/components/onboarding/OnboardingFlow';
import AuthScreen from './src/components/auth/AuthScreen';
import { TryOnProvider } from './src/contexts/TryOnContext';
import { AuthProvider } from './src/contexts/AuthContext';
import ProtectedRoute from './src/components/auth/ProtectedRoute';

type AppState = 'splash' | 'onboarding' | 'auth' | 'main';

export default function App() {
  const [appState, setAppState] = useState<AppState>('splash');


  const handleSplashFinish = async () => {
    try {
      // Check if user has completed onboarding and is authenticated
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
      
      if (hasCompletedOnboarding === 'true' && isAuthenticated === 'true') {
        // User has completed onboarding and is authenticated, go to main app
        setAppState('main');
      } else if (hasCompletedOnboarding === 'true') {
        // User completed onboarding but not authenticated, show auth
        setAppState('auth');
      } else {
        // User hasn't completed onboarding, show onboarding flow
        setAppState('onboarding');
      }
    } catch (error) {
      console.error('Error checking app state:', error);
      // Default to onboarding if we can't check
      setAppState('onboarding');
    }
  };

  const handleOnboardingComplete = () => {
    setAppState('auth');
  };

  const handleAuthComplete = () => {
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

  if (appState === 'auth') {
    return (
      <SafeAreaProvider>
        <AuthProvider>
          <AuthScreen onSkip={handleAuthComplete} />
        </AuthProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProtectedRoute>
          <TryOnProvider>
            <NavigationContainer>
              <RootNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </TryOnProvider>
        </ProtectedRoute>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

 