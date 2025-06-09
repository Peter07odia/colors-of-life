import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Animated, TouchableOpacity } from 'react-native';
import { 
  MessageCircle, 
  Package, 
  Shirt, 
  User, 
  Compass 
} from 'lucide-react-native';

import { RootTabParamList } from '../types/navigation';
import { colors } from '../constants/colors';

// Import screens
import DiscoverScreen from '../components/screens/DiscoverScreen';
import VirtualChangingRoomScreen from '../components/screens/VirtualChangingRoomScreen';
import AIChatStylistScreen from '../components/screens/AIChatStylistScreen';
import WardrobeScreen from '../components/screens/WardrobeScreen';
import ProfileScreen from '../components/screens/ProfileScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

// Animated Try On Icon Component
const AnimatedTryOnIcon = ({ color, size, focused }: { color: string; size: number; focused: boolean }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      // Pulse animation when focused on Try On tab
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
        pulseAnim.setValue(1);
      };
    }
  }, [focused, pulseAnim]);

  const handleTryOnPress = () => {
    // Animate press feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // TODO: Implement try-on processing logic here
    console.log('Try On activated from tab!');
  };

  return (
    <TouchableOpacity onPress={handleTryOnPress} activeOpacity={0.8}>
      <Animated.View style={{ 
        transform: [
          { scale: focused ? pulseAnim : scaleAnim }
        ] 
      }}>
        <Shirt 
          color={focused ? '#7928CA' : color} 
          size={focused ? 28 : size}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export function TabNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const isDiscoverScreen = route.name === 'Discover';
        
        return {
          tabBarActiveTintColor: '#7928CA',
          tabBarInactiveTintColor: isDiscoverScreen ? '#8E8E93' : '#8E8E93',
          tabBarStyle: {
            backgroundColor: isDiscoverScreen ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
            borderTopWidth: isDiscoverScreen ? 0 : 1,
            borderTopColor: isDiscoverScreen ? 'transparent' : 'rgba(0, 0, 0, 0.1)',
            paddingTop: 6,
            paddingBottom: Math.max(insets.bottom, 2),
            height: 60 + Math.max(insets.bottom, 2),
            position: 'absolute',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: isDiscoverScreen ? 0 : 0.1,
            shadowRadius: 4,
            elevation: isDiscoverScreen ? 0 : 5,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 4,
          },
          headerStyle: {
            backgroundColor: colors.background.main,
            borderBottomWidth: 1,
            borderBottomColor: colors.background.off,
          },
          headerTitleStyle: {
            color: colors.text.primary,
            fontSize: 18,
            fontWeight: '600',
          },
        };
      }}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Compass 
              color={focused ? '#7928CA' : '#8E8E93'} 
              size={focused ? 26 : 24} 
              fill={focused ? '#7928CA' : 'transparent'}
            />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Search"
        component={AIChatStylistScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <MessageCircle 
              color={focused ? '#7928CA' : '#8E8E93'} 
              size={focused ? 26 : 24}
            />
          ),
          headerTitle: 'AI Chat Stylist',
          tabBarLabel: 'AI Chat',
        }}
      />
      <Tab.Screen
        name="TryOn"
        component={VirtualChangingRoomScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTryOnIcon color={color} size={size} focused={focused} />
          ),
          headerTitle: 'Virtual Try-On',
          tabBarLabel: 'Try On',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Wardrobe"
        component={WardrobeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Package 
              color={focused ? '#7928CA' : '#8E8E93'} 
              size={focused ? 26 : 24}
            />
          ),
          headerTitle: 'Your Wardrobe',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <User 
              color={focused ? '#7928CA' : '#8E8E93'} 
              size={focused ? 26 : 24}
            />
          ),
          headerTitle: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
} 