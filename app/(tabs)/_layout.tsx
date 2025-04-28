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
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // White with transparency for glass effect
          borderTopWidth: 0,
          height: 55, // Smaller height
          paddingBottom: 8,
          paddingTop: 8,
          position: 'absolute',
          bottom: 15,
          alignSelf: 'center', // Center horizontally using alignSelf
          borderRadius: 25, // More rounded corners
          width: '60%', // Set width to 60% of screen width
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 5,
          borderWidth: 0.5,
          borderColor: 'rgba(255, 255, 255, 0.5)', // Subtle border for glass effect
          backdropFilter: 'blur(10px)', // Glass blur effect (works on iOS)
        },
        tabBarLabelStyle: {
          fontSize: 11, // Smaller font
          fontWeight: '600',
          marginBottom: 2,
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