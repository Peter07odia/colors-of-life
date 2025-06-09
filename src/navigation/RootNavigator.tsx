import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabNavigator } from './TabNavigator';
import SearchScreen from '../components/screens/SearchScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={TabNavigator} 
      />
      <Stack.Screen 
        name="SearchScreen" 
        component={SearchScreen}
        options={{
          headerShown: true,
          headerTitle: 'Fashion Search',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTitleStyle: {
            color: '#1C1C1E',
            fontSize: 18,
            fontWeight: '600',
          },
          headerTintColor: '#7928CA',
        }}
      />
    </Stack.Navigator>
  );
} 