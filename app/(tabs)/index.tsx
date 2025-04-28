import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  Pressable, 
  Platform,
  Dimensions 
} from "react-native";
import { useRouter } from "expo-router";
import { TAB_BAR_HEIGHT } from "./_layout";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Mic, BookOpen, Award } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";
import { useUserStore } from "@/store/user-store";
import { useAuth } from "@/hooks/useAuth";
import { getActiveChild, Child as DatabaseChild } from "@/services/database";
import type { Child } from "@/types/user";
import { useThemeStore } from "@/store/theme-store";
import { useThemeColors } from "@/hooks/useThemeColors";
import { categories } from "@/mocks/books";
import { getRecommendedBooks, getNewBooks, practiceWords } from "@/mocks/books";
import BookCard from "@/components/BookCard";
import CategoryCard from "@/components/CategoryCard";
import ProgressStats from "@/components/ProgressStats";
import Button from "@/components/Button";
import MascotGuide from "@/components/MascotGuide";
import WordPronunciationCard from "@/components/WordPronunciationCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isDarkMode } = useThemeStore();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const windowHeight = Dimensions.get('window').height;
  const recommendedBooks = getRecommendedBooks();
  // Removed newBooks as we no longer need the New Arrivals section
  const [showMascot, setShowMascot] = useState(true);
  const [practiceWordIndex, setPracticeWordIndex] = useState(0);
  const [activeChild, setActiveChild] = useState<Child | null>(null);

  // Helper function to safely get book progress
  const getBookProgress = (child: Child | null, bookId: string): number => {
    if (!child?.readingProgress) return 0;
    const progress = child.readingProgress[bookId];
    return progress?.completionPercentage ?? 0;
  };

  useEffect(() => {
    if (user?.id) {
      getActiveChild(user.id).then(dbChild => {
        if (dbChild) {
          // Convert database Child type to app Child type
          const appChild: Child = {
            id: dbChild.id,
            name: dbChild.name,
            age: dbChild.age,
            avatar: dbChild.avatar || '',
            parentId: dbChild.parent_id,
            readingLevel: dbChild.reading_level,
            streakDays: dbChild.streakDays,
            totalBooksRead: dbChild.totalBooksRead,
            totalMinutesRead: dbChild.totalMinutesRead,
            pronunciationAccuracy: dbChild.pronunciationAccuracy,
            lastAssessmentDate: dbChild.created_at,
            badges: dbChild.badges.map(b => ({
              id: b.id,
              name: b.name,
              description: b.description,
              icon: b.imageUrl,
              dateEarned: b.earnedAt
            })),
            favoriteBooks: [],
            readingProgress: {}
          };
          setActiveChild(appChild);
        } else {
          setActiveChild(null);
        }
      });
    }
  }, [user?.id]);

  // Get practice words based on reading level
  const getPracticeWords = () => {
    if (!activeChild) return practiceWords.beginner;
    return practiceWords[activeChild.readingLevel as keyof typeof practiceWords] || practiceWords.beginner;
  };

  const currentPracticeWords = getPracticeWords();

  useEffect(() => {
    // Show mascot guide on first load
    const timer = setTimeout(() => {
      setShowMascot(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleNextWord = () => {
    setPracticeWordIndex((prevIndex) => 
      prevIndex < currentPracticeWords.length - 1 ? prevIndex + 1 : 0
    );
  };

  const handlePreviousWord = () => {
    setPracticeWordIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : currentPracticeWords.length - 1
    );
  };

  const handlePronunciationResult = (result: { accuracy: number; correct: boolean }) => {
    console.log(`Pronunciation score: ${result.accuracy}`);
    // If pronunciation is good, show next word after a delay
    if (result.accuracy >= 80) {
      setTimeout(() => {
        handleNextWord();
      }, 2000);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 0 } // Remove top padding for full-screen hero
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Background Image */}
        <View style={styles.heroSection}>
          {/* Background Image - Using local asset */}
          <Image 
            source={require('@/assets/images/panda-hero.png')} 
            style={styles.heroBackgroundImage}
            resizeMode="cover"
            // Fallback to placeholder if image doesn't exist yet
            onError={() => console.log('Panda hero image not found. Please add it to assets/images/')}
          />
          
          {/* No overlay gradient - showing the original hero image */}
          
          {/* Top header with greeting and avatar */}
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{activeChild?.name || "Reader"}!</Text>
            </View>
            <Pressable onPress={() => router.push("/(tabs)/profile")}>
              <Image
                source={{ uri: activeChild?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(activeChild?.name || 'Guest') }}
                style={styles.avatar}
              />
            </Pressable>
          </View>
          
          {/* Content area for mascot and tagline */}
          <View style={styles.heroContentContainer}>
            {/* Panda mascot image positioned here */}
            <View style={styles.mascotImageContainer}>
              {/* Removed glowing circle and placeholder text */}
            </View>
            <Text style={styles.heroTagline}>Discover the joy of reading!</Text>
          </View>
        </View>

        {/* Blended transition from hero to content */}
        <View style={styles.heroBottomFade}>
          <LinearGradient
            colors={['rgba(13,71,161,0)', 'rgba(13,71,161,0.1)', '#1a237e']} 
            style={styles.fadeGradient}
          />
        </View>
        
        {/* Content area with gradient background */}
        <View style={styles.contentContainer}>
          <LinearGradient
            colors={['#1a237e', '#283593', '#3949ab', '#5c6bc0']} // Deep blue gradient that matches the hero image
            style={styles.contentBackgroundGradient}
          />
          
          <View style={styles.statsContainer}>
            <ProgressStats
              booksRead={activeChild?.totalBooksRead || 0}
              minutesRead={activeChild?.totalMinutesRead || 0}
              streakDays={activeChild?.streakDays || 0}
              pronunciationAccuracy={activeChild?.pronunciationAccuracy || 0}
            />
          </View>

        <View style={styles.pronunciationSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Practice Pronunciation</Text>
            <View style={styles.navigationButtons}>
              <Pressable style={styles.navButton} onPress={handlePreviousWord}>
                <Text style={styles.navButtonText}>←</Text>
              </Pressable>
              <Text style={[styles.wordCounter, { color: theme.textLight }]}>
                {practiceWordIndex + 1}/{currentPracticeWords.length}
              </Text>
              <Pressable style={styles.navButton} onPress={handleNextWord}>
                <Text style={styles.navButtonText}>→</Text>
              </Pressable>
            </View>
          </View>
          
          <WordPronunciationCard
            word={currentPracticeWords[practiceWordIndex].word}
            imageUrl={currentPracticeWords[practiceWordIndex].imageUrl}
            onResult={handlePronunciationResult}
          />
          
          <Button
            title="More Pronunciation Practice"
            icon={<Mic size={18} color="white" />}
            onPress={() => router.push("/pronunciation-practice")}
            style={styles.moreButton}
          />
        </View>

        <LinearGradient
          colors={[colors.tertiaryGradient[0], colors.tertiaryGradient[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.aiSection}
        >
          <View style={styles.aiContent}>
            <Sparkles size={24} color="white" />
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiTitle}>AI Reading Assistant</Text>
              <Text style={styles.aiDescription}>
                Get help with pronunciation, definitions, and comprehension
              </Text>
            </View>
          </View>
          <Button
            title="Try Now"
            variant="secondary"
            size="small"
            onPress={() => {
              // Navigate to a book with AI features
              if (recommendedBooks.length > 0) {
                router.push(`/read/${recommendedBooks[0].id}`);
              }
            }}
          />
        </LinearGradient>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </ScrollView>
        </View>

        {activeChild && Object.keys(activeChild.readingProgress || {}).length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Continue Reading</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.booksContainer}
            >
              {Object.keys(activeChild.readingProgress || {}).map((bookId) => {
                const book = recommendedBooks.find((b) => b.id === bookId);
                if (!book) return null;
                
                return (
                  <BookCard
                    key={book.id}
                    book={book}
                    showProgress
                    progress={getBookProgress(activeChild, bookId)}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={[styles.section, styles.lastSection]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recommended for You</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.booksContainer}
          >
            {recommendedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </ScrollView>
        </View>
        </View>
      </ScrollView>

      {showMascot && (
        <MascotGuide
          message="Welcome to ReadingPal! Practice your pronunciation by tapping the microphone button and reading the word out loud."
          duration={5000}
          onDismiss={() => setShowMascot(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create<any>({
  lastSection: {
    marginBottom: TAB_BAR_HEIGHT + 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#4c669f',
  },
  heroBottomFade: {
    height: 50,
    marginTop: -50,
    position: 'relative',
    zIndex: 5,
  },
  fadeGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  contentContainer: {
    paddingBottom: spacing.md,
  },
  contentBackgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  heroSection: {
    minHeight: 320, // Significantly reduced height for a more compact hero
    position: 'relative', // For absolute positioning of children
  },
  heroBackgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  // Removed heroOverlay style
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    position: 'relative', // To appear above the background
    zIndex: 2,
  },
  heroContentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xl,
    position: 'relative', // To appear above the background
    zIndex: 1,
  },
  mascotImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    height: 120, // Reduced space for the panda image
  },
  mascotImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  glowCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    position: 'absolute',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  heroPlaceholder: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: spacing.lg,
  },
  heroTagline: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  userName: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "white",
  },
  statsContainer: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    zIndex: 10,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(179, 229, 252, 0.5)',
  },
  pronunciationSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(179, 229, 252, 0.5)',
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  navigationButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  navButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  wordCounter: {
    marginHorizontal: spacing.sm,
    fontSize: 14,
  },
  moreButton: {
    marginTop: spacing.sm,
  },
  aiSection: {
    borderRadius: 20,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#1565C0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  aiContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  aiTextContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  aiDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  booksContainer: {
    paddingHorizontal: spacing.md,
  },
  // New Arrivals section styles removed
  badgesContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  badgeItem: {
    alignItems: "center",
    marginRight: spacing.md,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
    backgroundColor: colors.primaryLight,
  },
  badgeName: {
    fontSize: 12,
    textAlign: "center",
  },
  badgeContainer: {
    alignItems: "center",
    marginRight: spacing.lg,
    width: 80,
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  viewAllBadges: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.lg,
  },
  viewAllText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  bottomPadding: {
    height: 80, // Extra padding at the bottom for better scrolling
  },
});