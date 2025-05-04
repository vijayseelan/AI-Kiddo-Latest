import React, { useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { StyleSheet, Text, View, ScrollView, Image, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Book as LucideBook, ArrowLeft, User, Award, Heart } from "lucide-react-native";
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
import { BlurView } from "expo-blur";

// Design system colors
const designColors = {
  sunflower: "#ffb703",
  orange: "#fb8500",
  blue: "#219ebc",
  skyBlue: "#8ecae6",
  deepNavy: "#023047"
};

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
        console.log('[BookDetail] Loading book with ID:', id);
        try {
          const loadedBook = await getBookById(id);
          console.log('[BookDetail] Book loaded:', loadedBook ? 'success' : 'not found');
          if (loadedBook) {
            console.log('[BookDetail] Book title:', loadedBook.title);
          }
          setBook(loadedBook);
        } catch (error) {
          console.error('[BookDetail] Error loading book:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.error('[BookDetail] No book ID provided');
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
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.text} />
          </Pressable>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: theme.text }]}>Book not found</Text>
          <Text style={[styles.notFoundSubText, { color: theme.textMuted }]}>
            The book you're looking for could not be found.
          </Text>
          <Button
            title="Return to Library"
            onPress={() => router.push('/library')}
            style={{ marginTop: spacing.lg }}
          />
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
    <View style={styles.container}>
      <View style={styles.gradientBg1} />
      <View style={styles.gradientBg2} />
      <View style={styles.gradientBg3} />
      <View style={styles.gradientBg4} />
      <BlurView intensity={100} tint="light" style={styles.blurOverlay} />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingTop: insets.top }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.text} />
            </Pressable>
            <View style={{ width: 24 }} />
          </View>
          {book ? (
            <View style={styles.bookHeader}>
              <Image
                source={{ uri: book?.coverUrl || '' }}
                style={styles.coverImage}
                resizeMode="cover"
              />
              <View style={styles.bookInfo}>
                <Text style={[styles.title, { color: theme.text }]}>{book?.title || ''}</Text>
                <Text style={[styles.author, { color: theme.textMuted }]}>{book?.author || ''}</Text>
                <Text style={[styles.description, { color: theme.text }]}>{book?.description || ''}</Text>
                {book?.pages && book.pages.length > 0 && (
                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <LucideBook size={16} color={theme.textLight} />
                      <Text style={[styles.detailText, { color: theme.textLight }]}>
                        {`${book.pages.length} pages`}
                      </Text>
                    </View>
                  </View>
                )}
                <View style={[styles.metadata, { marginTop: spacing.md }]}>
                  <View style={[styles.metadataCard, { backgroundColor: 'rgba(255, 183, 3, 0.2)' }]}>
                    <View style={[styles.metadataIconContainer, { backgroundColor: designColors.sunflower }]}>
                      <User size={18} color="white" />
                    </View>
                    <View style={styles.metadataContent}>
                      <Text style={[styles.metadataLabel, { color: theme.textMuted }]}>Age Range</Text>
                      <Text style={[styles.metadataValue, { color: theme.text }]}>{book?.ageRange || ''}</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.metadataCard, { backgroundColor: 'rgba(33, 158, 188, 0.2)' }]}>
                    <View style={[styles.metadataIconContainer, { backgroundColor: designColors.blue }]}>
                      <Award size={18} color="white" />
                    </View>
                    <View style={styles.metadataContent}>
                      <Text style={[styles.metadataLabel, { color: theme.textMuted }]}>Reading Level</Text>
                      <Text style={[styles.metadataValue, { color: theme.text }]}>{book?.readingLevel || ''}</Text>
                    </View>
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
                  <Pressable 
                    style={[styles.customButton, styles.primaryButton]} 
                    onPress={handleStartReading}
                  >
                    <LucideBook size={18} color="white" />
                    <Text style={styles.primaryButtonText}>
                      {readingProgress ? "Continue Reading" : "Start Reading"}
                    </Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.customButton, styles.secondaryButton]} 
                    onPress={handleToggleFavorite}
                  >
                    <Heart size={18} color={designColors.orange} />
                    <Text style={styles.secondaryButtonText}>
                      {favorite ? "Remove from Favorites" : "Add to Favorites"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.notFound}>
              <Text style={[styles.notFoundText, { color: theme.text }]}>Book not found</Text>
              <Text style={[styles.notFoundSubText, { color: theme.textMuted }]}>
                The book you're looking for could not be found.
              </Text>
            </View>
          )}

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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designColors.skyBlue,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  gradientBg1: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '50%',
    backgroundColor: designColors.blue,
    transform: [{ skewY: '-15deg' }],
    opacity: 0.8,
  },
  gradientBg2: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '70%',
    height: '45%',
    backgroundColor: designColors.sunflower,
    transform: [{ skewY: '15deg' }],
    opacity: 0.7,
  },
  gradientBg3: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '60%',
    height: '40%',
    backgroundColor: designColors.orange,
    transform: [{ skewY: '-15deg' }],
    opacity: 0.6,
  },
  gradientBg4: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '50%',
    height: '30%',
    backgroundColor: designColors.deepNavy,
    transform: [{ skewY: '15deg' }],
    opacity: 0.5,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  bookHeader: {
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  coverImage: {
    width: "100%",
    height: 300,
    borderRadius: 28,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  bookInfo: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  author: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Regular',
    marginLeft: spacing.xs,
  },
  progressContainer: {
    width: "100%",
    marginBottom: spacing.md,
  },
  buttonsContainer: {
    flexDirection: "row",
    width: "100%",
    gap: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  customButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: designColors.blue,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: designColors.orange,
  },
  primaryButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
  secondaryButtonText: {
    color: designColors.orange,
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
  section: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Medium',
  },
  previewContainer: {
    padding: spacing.md,
    borderRadius: 12,
  },
  previewText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Bold',
    textAlign: "center",
  },
  notFoundSubText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginTop: spacing.sm,
    textAlign: "center",
  },
  metadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    width: "100%",
    gap: spacing.md,
  },
  metadataCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metadataIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  metadataContent: {
    flex: 1,
  },
  metadataLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginBottom: spacing.xs,
  },
  metadataValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});
