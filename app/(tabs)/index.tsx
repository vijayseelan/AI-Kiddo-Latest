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
import { BlurView } from "expo-blur";
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

// New color palette
const colorPalette = {
  peach: '#faac96',     // RGB: (250, 172, 150)
  mint: '#90dec8',      // RGB: (144, 222, 200)
  lavender: '#9d8bed',  // RGB: (157, 139, 237)
  yellow: '#f8c75e',    // RGB: (248, 199, 94)
  green: '#78d9ad',     // RGB: (120, 217, 173)
  purple: '#cb97e0',    // RGB: (203, 151, 224)
  deepNavy: '#023047'   // Keeping this color for text
};

// For backward compatibility
const designColors = {
  sunflower: colorPalette.yellow,
  orange: colorPalette.peach,
  blue: colorPalette.lavender,
  skyBlue: colorPalette.mint,
  deepNavy: colorPalette.deepNavy
};

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
            readingProgress: {},
            is_active: dbChild.is_active || true
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

  // Preload all practice word images to improve navigation speed
  useEffect(() => {
    // Preload all images in the background using React Native's Image.prefetch
    const preloadImages = async () => {
      console.log('Preloading practice word images...');
      const imagePromises = currentPracticeWords.map((item) => {
        return Image.prefetch(item.imageUrl);
      });
      
      try {
        await Promise.all(imagePromises);
        console.log('All practice word images preloaded successfully');
      } catch (error) {
        console.error('Error preloading images:', error);
      }
    };
    
    preloadImages();
  }, [currentPracticeWords]);

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
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require('@/assets/images/onboarding_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Main gradient background - commented out but kept for reference */}
      {/*
      <LinearGradient
        colors={[
          colorPalette.mint,
          colorPalette.peach,
          colorPalette.yellow,
          colorPalette.lavender
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mainGradient}
      />
      
      // Accent gradient overlay
      <LinearGradient
        colors={[
          'transparent',
          colorPalette.green,
          'transparent',
          colorPalette.purple
        ]}
        locations={[0, 0.3, 0.6, 0.9]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.accentGradient}
      />
      */}
      
      {/* Blur effect overlay */}
      <BlurView intensity={80} tint="light" style={styles.blurOverlay} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top header with greeting and avatar */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
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
        
        {/* Removed hero content with tagline */}
        
        {/* Content area */}
        <View style={styles.contentContainer}>
          
          <View style={styles.progressStatsWrapper}>
            <ProgressStats
              booksRead={activeChild?.totalBooksRead || 0}
              minutesRead={activeChild?.totalMinutesRead || 0}
              streakDays={activeChild?.streakDays || 0}
              pronunciationAccuracy={activeChild?.pronunciationAccuracy || 0}
            />
          </View>

        <View style={styles.cardContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Practice Pronunciation</Text>
          </View>
          
          <WordPronunciationCard
            word={currentPracticeWords[practiceWordIndex].word}
            imageUrl={currentPracticeWords[practiceWordIndex].imageUrl}
            onResult={handlePronunciationResult}
          />
          
          <View style={styles.navigationContainer}>
            <Pressable style={styles.navButton} onPress={handlePreviousWord}>
              <Text style={styles.navButtonText}>←</Text>
            </Pressable>
            <Text style={styles.wordCounter}>
              {practiceWordIndex + 1}/{currentPracticeWords.length}
            </Text>
            <Pressable style={styles.navButton} onPress={handleNextWord}>
              <Text style={styles.navButtonText}>→</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.cardContainer, styles.aiCardContainer]}>
          <View style={styles.aiContent}>
            <Sparkles size={24} color={designColors.deepNavy} />
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
        </View>

        {/* Categories section removed */}

        {activeChild && Object.keys(activeChild.readingProgress || {}).length > 0 && (
          <View style={styles.cardContainer}>
            <Text style={styles.sectionTitle}>Continue Reading</Text>
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

        <View style={styles.cardContainer}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
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
  // Removed lastSection style
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height + 100, // Extra height to ensure full coverage
    zIndex: 0, // Bottom-most layer
  },
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  // New gradient styles
  mainGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  accentGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
    zIndex: 2,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  contentContainer: {
    paddingBottom: spacing.md,
    paddingTop: 24, // Increased top padding
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    zIndex: 10,
  },
  // Removed hero content container and tagline styles
  greeting: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: colorPalette.lavender,
  },
  userName: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: colorPalette.deepNavy,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: "white",
    // Claymorphism shadow
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  progressStatsWrapper: {
    marginBottom: 24, // Consistent spacing between cards
    paddingHorizontal: 0, // Remove any horizontal padding to match cardContainer width
  },
  cardContainer: {
    marginBottom: 24, // Consistent spacing between cards
    backgroundColor: 'white',
    borderRadius: 28,
    padding: spacing.lg,
    // Claymorphism effect
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'white',
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: designColors.skyBlue,
    justifyContent: "center",
    alignItems: "center",
    // Claymorphism effect
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  navButtonText: {
    color: designColors.deepNavy,
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
  },
  wordCounter: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: designColors.deepNavy,
    marginHorizontal: spacing.md,
    minWidth: 40,
    textAlign: 'center',
  },
  // Removed moreButton style
  aiCardContainer: {
    backgroundColor: designColors.skyBlue,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: designColors.deepNavy,
  },
  aiDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: designColors.blue,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: designColors.deepNavy,
    marginBottom: spacing.md,
  },
  booksContainer: {
    paddingBottom: spacing.sm,
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
    backgroundColor: designColors.skyBlue,
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