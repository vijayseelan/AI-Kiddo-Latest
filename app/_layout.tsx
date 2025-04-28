import React, { useEffect } from "react";
import * as Font from 'expo-font';
import { fonts } from '@/constants/fonts';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useThemeStore } from "@/store/theme-store";
import { useThemeColors } from "@/hooks/useThemeColors";
import { View, StyleSheet } from "react-native";
import { AuthProvider, useAuth } from '@/hooks/useAuth'; // Import useAuth
import { useRouter, useSegments } from "expo-router"; // Import useRouter and useSegments

// Custom hook to handle navigation based on auth state
function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    // Only protect authenticated routes
    // Let the AuthProvider handle other navigation
    if (!session && inAuthGroup) {
      router.replace('/login');
    }
  }, [session, loading, segments]);
}

export default function RootLayout() {
  const { isDarkMode } = useThemeStore();
  const theme = useThemeColors();

  // Load fonts
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync(fonts);
      } catch (error) {
        console.error('Error loading fonts:', error);
      }
    }
    loadFonts();
  }, []);

  // Call the hook to activate protection
  useProtectedRoute();

  return (
    <AuthProvider>{/* Wrap with AuthProvider */}
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.background,
            },
            headerTintColor: theme.text,
            headerTitleStyle: {
              fontFamily: 'Poppins-Bold',
            },
            contentStyle: {
              backgroundColor: theme.background,
            },

          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="book/[id]"
            options={{
              title: "Book Details",
              presentation: "card",
            }}
          />
          <Stack.Screen
            name="read/[id]"
            options={{
              title: "Reading",
              headerShown: false,
              fullScreenGestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="category/[id]"
            options={{
              title: "Category",
            }}
          />
          <Stack.Screen
            name="login"
            options={{
              title: "Login",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="signup"
            options={{
              title: "Sign Up",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="pronunciation-practice"
            options={{
              title: "Pronunciation Practice",
            }}
          />
          <Stack.Screen
            name="assessment"
            options={{
              title: "Reading Assessment",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="badges"
            options={{
              title: "Achievements",
            }}
          />
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="assessment-processing"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="assessment-results"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="add-profile"
            options={{
              title: "Add Profile",
            }}
          />
          <Stack.Screen
            name="edit-profile"
            options={{
              title: "Edit Profile",
            }}
          />
        </Stack>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});