import React from "react";
import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";
import { useBooksStore } from "@/store/books-store";
import { useThemeStore } from "@/store/theme-store";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Book } from "@/types/book";

interface BookCardProps {
  book: Book;
  size?: "small" | "medium" | "large";
  showProgress?: boolean;
  progress?: number;
}

export default function BookCard({ 
  book, 
  size = "medium", 
  showProgress = false,
  progress = 0
}: BookCardProps) {
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useBooksStore();
  const { isDarkMode } = useThemeStore();
  const theme = useThemeColors();
  const favorite = isFavorite(book.id);

  const handlePress = () => {
    router.push(`/book/${book.id}`);
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    toggleFavorite(book.id);
  };

  const getCardSize = () => {
    switch (size) {
      case "small":
        return { width: 120, height: 160 };
      case "large":
        return { width: 180, height: 240 };
      case "medium":
      default:
        return { width: 150, height: 200 };
    }
  };

  const cardSize = getCardSize();

  return (
    <Pressable
      style={[styles.container, { width: cardSize.width }]}
      onPress={handlePress}
    >
      <View style={[
        styles.imageContainer, 
        { height: cardSize.height, backgroundColor: theme.card }
      ]}>
        <Image
          source={{ uri: book.coverUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <Pressable
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
        >
          <Heart
            size={22}
            color={favorite ? colors.error : theme.textLight}
            fill={favorite ? colors.error : "transparent"}
          />
        </Pressable>
        
        {book.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        
        {showProgress && progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{book.title}</Text>
        <Text style={[styles.author, { color: theme.textLight }]} numberOfLines={1}>{book.author}</Text>
        <Text style={styles.ageRange}>Ages {book.ageRange}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: spacing.md,
    marginBottom: spacing.md,
  },
  imageContainer: {
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 6,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 1,
  },
  newBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  progressContainer: {
    position: "absolute",
    bottom: 8,
    right: 8,
    zIndex: 1,
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  infoContainer: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  title: {
    ...typography.body.medium,
    fontWeight: "600",
    marginBottom: 2,
  },
  author: {
    ...typography.body.small,
    marginBottom: 2,
  },
  ageRange: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "500",
  },
});