import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Home, Search, BookOpen, User } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function TabLayout() {
  const { isDarkMode } = useThemeStore();
  const theme = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a237e', // Deep blue from the hero image
        tabBarInactiveTintColor: '#9e9e9e', // Medium gray for inactive tabs
        tabBarStyle: {
          backgroundColor: '#FFFFFF', // Solid white background
          borderTopWidth: 0.5, // Add a subtle top border
          borderTopColor: '#DDDDDD', // Light grey border color
          height: 60, // Increased height
          paddingBottom: 5, // Adjusted bottom padding
          paddingTop: 5, // Reduced top padding to move everything up
        },
        tabBarLabelStyle: {
          fontSize: 11, // Smaller font
          fontWeight: '600',
          marginTop: -5, // Added negative margin to move labels up closer to icons
        },
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Add extra padding to the bottom of screens to account for the floating tab bar
export const TAB_BAR_HEIGHT = 70; // Reduced height for the smaller tab bar