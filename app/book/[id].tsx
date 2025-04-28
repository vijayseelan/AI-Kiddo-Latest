import React, { useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { StyleSheet, Text, View, ScrollView, Image, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Book as LucideBook, Clock, User, Award, ArrowLeft } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import type { Book } from "@/types/book";
import { getBookById } from "@/mocks/books";
import { useUserStore } from "@/store/user-store";
import { useBooksStore } from "@/store/books-store";
import { useThemeColors } from "@/hooks/useThemeColors";
import Button from "@/components/Button";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book>();
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUserStore();
  const { toggleFavorite, isFavorite, addToRecentlyViewed } = useBooksStore();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();

  // Load book data
  useEffect(() => {
    async function loadBook() {
      if (id) {
        const loadedBook = await getBookById(id);
        setBook(loadedBook);
        setIsLoading(false);
      }
    }
    loadBook();
  }, [id]);
  
  const favorite = isFavorite(id);
  const readingProgress = user.readingProgress[id];
  
  React.useEffect(() => {
    if (id) {
      addToRecentlyViewed(id);
    }
  }, [id]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.notFound}>
          <ActivityIndicator color={theme.text} />
          <Text style={[styles.notFoundText, { color: theme.text }]}>Loading book...</Text>
        </View>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: theme.text }]}>Book not found</Text>
        </View>
      </View>
    );
  }

  const handleStartReading = () => {
    router.push(`/read/${id}`);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(id);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Book Details</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={styles.bookHeader}>
          <Image source={{ uri: book.coverUrl }} style={styles.coverImage} />
          <View style={styles.bookInfo}>
            <Text style={[styles.title, { color: theme.text }]}>{book.title}</Text>
            <Text style={[styles.author, { color: theme.textLight }]}>by {book.author}</Text>
            
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <LucideBook size={16} color={theme.textLight} />
                <Text style={[styles.detailText, { color: theme.textLight }]}>
                  {book.isGenerated ? 'AI Generated' : `${book.pages?.length || 0} pages`}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <User size={16} color={theme.textLight} />
                <Text style={[styles.detailText, { color: theme.textLight }]}>Ages {book.ageRange}</Text>
              </View>
              <View style={styles.detailItem}>
                <Award size={16} color={theme.textLight} />
                <Text style={[styles.detailText, { color: theme.textLight }]}>{book.readingLevel}</Text>
              </View>
            </View>
            
            {readingProgress && (
              <View style={styles.progressContainer}>
                <ReadingProgressBar
                  progress={readingProgress.completionPercentage}
                  height={8}
                />
              </View>
            )}
            
            <View style={styles.buttonsContainer}>
              <Button
                title={readingProgress ? "Continue Reading" : "Start Reading"}
                onPress={handleStartReading}
                fullWidth
              />
              <Button
                title={favorite ? "Remove from Favorites" : "Add to Favorites"}
                variant="outline"
                onPress={handleToggleFavorite}
                style={styles.favoriteButton}
                fullWidth
              />
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About this Book</Text>
          <Text style={[styles.description, { color: theme.text }]}>{book.description}</Text>
        </View>
        
        {book.categories && book.categories.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
            <View style={styles.categoriesContainer}>
              {book.categories.map((category: string) => (
                <View key={category} style={[styles.categoryChip, { backgroundColor: theme.card }]}>
                  <Text style={[styles.categoryText, { color: theme.primary }]}>{category}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {!book.isGenerated && book.pages && book.pages.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Preview</Text>
            <View style={[styles.previewContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.previewText, { color: theme.text }]}>
                {book.pages[0].content}
              </Text>
              <Button
                title="Read More"
                variant="text"
                onPress={handleStartReading}
                style={styles.readMoreButton}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  bookHeader: {
    padding: spacing.lg,
  },
  coverImage: {
    width: "100%",
    height: 300,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  bookInfo: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  author: {
    fontSize: 16,
    marginBottom: spacing.md,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    marginLeft: spacing.xs,
  },
  progressContainer: {
    width: "100%",
    marginBottom: spacing.md,
  },
  buttonsContainer: {
    width: "100%",
  },
  favoriteButton: {
    marginTop: spacing.sm,
  },
  section: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryText: {
    fontWeight: "500",
  },
  previewContainer: {
    padding: spacing.md,
    borderRadius: 12,
  },
  previewText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
  },
  readMoreButton: {
    alignSelf: "flex-end",
    marginTop: spacing.sm,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundText: {
    fontSize: 18,
  },
});