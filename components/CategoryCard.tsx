import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Compass, PawPrint, Sparkles, FlaskConical, Landmark } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";
import { useThemeStore } from "@/store/theme-store";
import { Category } from "@/types/book";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();

  const handlePress = () => {
    router.push(`/category/${category.id}`);
  };

  const renderIcon = () => {
    switch (category.icon) {
      case "compass":
        return <Compass size={24} color="white" />;
      case "paw-print":
        return <PawPrint size={24} color="white" />;
      case "sparkles":
        return <Sparkles size={24} color="white" />;
      case "flask-conical":
        return <FlaskConical size={24} color="white" />;
      case "landmark":
        return <Landmark size={24} color="white" />;
      default:
        return <Compass size={24} color="white" />;
    }
  };

  // Get gradient colors based on category
  const getGradientColors = () => {
    const baseColor = category.color;
    // Create a lighter version for the gradient
    // For dark mode, make the gradient slightly darker
    if (isDarkMode) {
      return [baseColor, baseColor + "CC"];
    }
    return [baseColor, baseColor + "99"];
  };

  return (
    <Pressable onPress={handlePress}>
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.iconContainer}>
          {renderIcon()}
        </View>
        <Text style={styles.name}>{category.name}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 110,
    height: 110,
    borderRadius: 20,
    padding: spacing.sm,
    marginRight: spacing.md,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});