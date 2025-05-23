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

// Colors from design.md
const designColors = {
  sunflower: '#ffb703',
  orange: '#fb8500',
  blue: '#219ebc',
  skyBlue: '#8ecae6',
  deepNavy: '#023047'
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
      {/* Gradient background layers - similar to OnboardingContainer */}
      <View style={styles.gradientBg1} />
      <View style={styles.gradientBg2} />
      <View style={styles.gradientBg3} />
      <View style={styles.gradientBg4} />
      
      {/* Blur effect overlay */}
      <BlurView intensity={100} tint="light" style={styles.blurOverlay} />
      
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
  container: {
    flex: 1,
    backgroundColor: designColors.skyBlue,
    position: 'relative',
    overflow: 'hidden',
  },
  // Gradient background layers - from OnboardingContainer
  gradientBg1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: designColors.skyBlue,
    zIndex: 1,
  },
  gradientBg2: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '80%',
    height: '60%',
    backgroundColor: designColors.blue,
    opacity: 0.3,
    transform: [{ skewX: '-45deg' }, { translateX: 100 }],
    zIndex: 2,
  },
  gradientBg3: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '100%',
    height: '40%',
    backgroundColor: designColors.sunflower,
    opacity: 0.5,
    transform: [{ skewY: '15deg' }, { translateY: 50 }],
    zIndex: 3,
  },
  gradientBg4: {
    position: 'absolute',
    bottom: '20%',
    left: 0,
    width: '70%',
    height: '30%',
    backgroundColor: designColors.orange,
    opacity: 0.3,
    transform: [{ skewY: '-20deg' }, { translateX: -50 }],
    zIndex: 4,
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
    color: designColors.blue,
  },
  userName: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: designColors.deepNavy,
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