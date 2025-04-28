import React, { useRef, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  Pressable, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle, 
  Animated, 
  Easing,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";
import { useThemeColors } from "@/hooks/useThemeColors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "tertiary" | "outline" | "text";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  animated?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
  animated = false,
}: ButtonProps) {
  const theme = useThemeColors();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const translateYAnim = useRef(new Animated.Value(animated ? 20 : 0)).current;

  // Run entrance animation if animated prop is true
  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [animated]);

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  };

  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      opacity: disabled ? 0.6 : 1,
    };

    // Size styles
    switch (size) {
      case "small":
        baseStyle.paddingVertical = spacing.xs;
        baseStyle.paddingHorizontal = spacing.md;
        baseStyle.borderRadius = 12;
        break;
      case "large":
        baseStyle.paddingVertical = spacing.md;
        baseStyle.paddingHorizontal = spacing.xl;
        baseStyle.borderRadius = 16;
        break;
      default:
        baseStyle.paddingVertical = spacing.sm;
        baseStyle.paddingHorizontal = spacing.lg;
        baseStyle.borderRadius = 14;
    }

    // Variant styles for non-gradient buttons
    if (variant === "outline") {
      baseStyle.backgroundColor = "transparent";
      baseStyle.borderWidth = 2;
      baseStyle.borderColor = theme.primary;
    } else if (variant === "text") {
      baseStyle.backgroundColor = "transparent";
      baseStyle.paddingHorizontal = spacing.xs;
    }

    if (fullWidth) {
      baseStyle.width = "100%";
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle: TextStyle = {
      color: variant === "outline" || variant === "text" ? theme.primary : "white",
      textAlign: "center",
    };

    // Size styles
    switch (size) {
      case "small":
        baseStyle.fontSize = typography.button.small.fontSize;
        baseStyle.fontWeight = "600" as TextStyle["fontWeight"];
        break;
      case "large":
        baseStyle.fontSize = typography.button.large.fontSize;
        baseStyle.fontWeight = "700" as TextStyle["fontWeight"];
        break;
      default:
        baseStyle.fontSize = typography.button.medium.fontSize;
        baseStyle.fontWeight = "600" as TextStyle["fontWeight"];
    }

    return baseStyle;
  };

  // Define default gradient colors as fallback
  const defaultGradient = ["#4F46E5", "#7C3AED"] as const;

  const getGradientColors = (): readonly [string, string] => {
    let gradientColors: readonly [string, string];
    
    switch (variant) {
      case "secondary":
        // Ensure we have at least 2 colors or use defaults
        gradientColors = (colors.secondaryGradient?.length >= 2 
          ? [colors.secondaryGradient[0], colors.secondaryGradient[1]] 
          : defaultGradient) as readonly [string, string];
        break;
      case "tertiary":
        gradientColors = (colors.tertiaryGradient?.length >= 2 
          ? [colors.tertiaryGradient[0], colors.tertiaryGradient[1]] 
          : defaultGradient) as readonly [string, string];
        break;
      default:
        gradientColors = (colors.primaryGradient?.length >= 2 
          ? [colors.primaryGradient[0], colors.primaryGradient[1]] 
          : defaultGradient) as readonly [string, string];
    }
    
    return gradientColors;
  };

  const animatedContainerStyle = {
    opacity: opacityAnim,
    transform: [
      { scale: scaleAnim },
      { translateY: translateYAnim }
    ]
  };

  // For outline and text variants, we don't use gradient
  if (variant === "outline" || variant === "text") {
    return (
      <Animated.View style={[animatedContainerStyle, fullWidth && { width: "100%" }]}>
        <Pressable
          style={[styles.button, getButtonStyle(), style]}
          onPress={onPress}
          disabled={disabled || loading}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {loading ? (
            <ActivityIndicator
              color={theme.primary}
              size="small"
            />
          ) : (
            <>
              {icon && icon}
              <Text style={[getTextStyle(), icon ? { marginLeft: spacing.sm } : {}, textStyle]}>
                {title}
              </Text>
            </>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  // For primary, secondary, and tertiary variants, we use gradient
  return (
    <Animated.View style={[animatedContainerStyle, fullWidth && { width: "100%" }, style]}>
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={fullWidth ? { width: "100%" } : undefined}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, getButtonStyle()]}
        >
          {loading ? (
            <ActivityIndicator
              color="white"
              size="small"
            />
          ) : (
            <>
              {icon && <View style={{ marginRight: spacing.sm }}>{icon}</View>}
              <Text style={[getTextStyle(), textStyle]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});