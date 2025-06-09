import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import AuthScreen from './AuthScreen';
import { colors } from '../../constants/colors';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [guestMode, setGuestMode] = useState(false);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Show protected content if authenticated or in guest mode
  if (isAuthenticated || guestMode) {
    return <>{children}</>;
  }

  // Show auth screen with skip option if not authenticated
  const handleSkip = () => {
    setGuestMode(true);
  };

  return <AuthScreen onSkip={handleSkip} />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default ProtectedRoute; 