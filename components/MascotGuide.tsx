import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View, Animated, Easing, Pressable } from "react-native";
import { Lightbulb, X, AlertCircle, HelpCircle } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useThemeStore } from "@/store/theme-store";
import { useThemeColors } from "@/hooks/useThemeColors";

interface MascotGuideProps {
  message: string;
  duration?: number;
  onDismiss?: () => void;
  type?: "tip" | "alert" | "help";
  position?: "top" | "bottom" | "center";
}

export default function MascotGuide({
  message,
  duration = 0,
  onDismiss,
  type = "tip",
  position = "top",
}: MascotGuideProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(position === "bottom" ? 50 : -50)).current;
  const { isDarkMode } = useThemeStore();
  const theme = useThemeColors();

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after duration if specified
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    // Fade out animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: position === "bottom" ? 50 : -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  const getIcon = () => {
    switch (type) {
      case "alert":
        return <AlertCircle size={24} color="white" />;
      case "help":
        return <HelpCircle size={24} color="white" />;
      case "tip":
      default:
        return <Lightbulb size={24} color="white" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "alert":
        return colors.error;
      case "help":
        return colors.info;
      case "tip":
      default:
        return colors.primary;
    }
  };

  const getPositionStyle = () => {
    switch (position) {
      case "bottom":
        return { bottom: spacing.xl };
      case "center":
        return { top: "40%" };
      case "top":
      default:
        return { top: spacing.xl };
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          backgroundColor: getBackgroundColor(),
          ...getPositionStyle(),
        },
      ]}
    >
      <View style={styles.iconContainer}>{getIcon()}</View>
      <Text style={styles.message}>{message}</Text>
      <Pressable style={styles.closeButton} onPress={handleDismiss}>
        <X size={18} color="white" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1000,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    color: "white",
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    padding: spacing.xs,
  },
});