import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Award, BookOpen, Mic, Clock, Flame, Sparkles } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { Badge } from "@/types/user";

interface BadgeCardProps {
  badge: Badge;
  onPress?: () => void;
  size?: "small" | "medium" | "large";
}

export default function BadgeCard({
  badge,
  onPress,
  size = "medium"
}: BadgeCardProps) {
  const renderIcon = () => {
    const iconSize = size === "small" ? 24 : size === "large" ? 36 : 30;
    const iconColor = "white";
    
    switch (badge.icon) {
      case "award":
        return <Award size={iconSize} color={iconColor} />;
      case "book-open":
        return <BookOpen size={iconSize} color={iconColor} />;
      case "mic":
        return <Mic size={iconSize} color={iconColor} />;
      case "clock":
        return <Clock size={iconSize} color={iconColor} />;
      case "flame":
        return <Flame size={iconSize} color={iconColor} />;
      case "sparkles":
      default:
        return <Sparkles size={iconSize} color={iconColor} />;
    }
  };

  const getContainerSize = () => {
    switch (size) {
      case "small":
        return { width: 100, height: 120 };
      case "large":
        return { width: 160, height: 180 };
      case "medium":
      default:
        return { width: 130, height: 150 };
    }
  };

  const containerSize = getContainerSize();
  const iconContainerSize = size === "small" ? 60 : size === "large" ? 80 : 70;
  
  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  return (
    <Pressable 
      style={[styles.container, { width: containerSize.width, height: containerSize.height }]}
      onPress={onPress}
    >
      <View 
        style={[
          styles.iconContainer, 
          { 
            width: iconContainerSize, 
            height: iconContainerSize,
            borderRadius: iconContainerSize / 2 
          }
        ]}
      >
        {renderIcon()}
      </View>
      
      <Text 
        style={[
          styles.name, 
          size === "small" ? { fontSize: 12 } : size === "large" ? { fontSize: 16 } : {}
        ]}
        numberOfLines={1}
      >
        {badge.name}
      </Text>
      
      <Text 
        style={[
          styles.description,
          size === "small" ? { fontSize: 10 } : size === "large" ? { fontSize: 14 } : {}
        ]}
        numberOfLines={2}
      >
        {badge.description}
      </Text>
      
      <Text 
        style={[
          styles.date,
          size === "small" ? { fontSize: 9 } : size === "large" ? { fontSize: 12 } : {}
        ]}
      >
        {formatDate(badge.dateEarned)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: "center",
    marginBottom: 4,
  },
  date: {
    fontSize: 10,
    color: colors.primary,
    textAlign: "center",
  },
});