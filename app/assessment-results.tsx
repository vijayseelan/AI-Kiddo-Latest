import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  Image,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  BookOpen, 
  Award, 
  BarChart3, 
  Sparkles, 
  Clock, 
  BookText, 
  ChevronRight,
  Calendar
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import Button from '@/components/Button';
import { useUserStore } from '@/store/user-store';
import { useBooksStore } from '@/store/books-store';

const { width } = Dimensions.get('window');

// Mock reading plan data
const readingPlan = {
  level: 'Intermediate',
  strengths: ['Word recognition', 'Reading comprehension'],
  areasToImprove: ['Pronunciation', 'Reading fluency'],
  recommendedBooks: [1, 2, 3], // IDs from the books store
  dailyGoal: 20, // minutes
  weeklyTarget: 5, // books
};

export default function AssessmentResultsScreen() {
  const router = useRouter();
  const { activeChild, activeChildId } = useUserStore();
  const { books } = useBooksStore();
  
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Get recommended books from the store
  const recommendedBooks = readingPlan.recommendedBooks
    .map(id => books.find(book => book.id === id))
    .filter(Boolean);
  
  useEffect(() => {
    // Run entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 0.75, // Reading level progress (75%)
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  const handleStartReading = () => {
    router.replace('/(tabs)');
  };
  
  const handleBookPress = (bookId: number) => {
    router.push(`/book/${bookId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundGradient[0], colors.backgroundGradient[1]]}
        style={styles.gradientBackground}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.title}>Your Reading Profile</Text>
            <Text style={styles.subtitle}>
              {activeChild?.name ? `Personalized for ${activeChild.name}` : 'Your personalized reading plan'}
            </Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.levelCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.levelHeader}>
              <BookOpen size={24} color={colors.primary} />
              <Text style={styles.levelTitle}>Reading Level</Text>
            </View>
            
            <View style={styles.levelContent}>
              <Text style={styles.levelValue}>{readingPlan.level}</Text>
              
              <View style={styles.progressContainer}>
                <Animated.View 
                  style={[
                    styles.progressBar,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      })
                    }
                  ]}
                />
              </View>
              
              <View style={styles.levelLabels}>
                <Text style={styles.levelLabel}>Beginner</Text>
                <Text style={styles.levelLabel}>Advanced</Text>
              </View>
            </View>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.sectionCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('strengths')}
            >
              <View style={styles.sectionHeaderLeft}>
                <Award size={20} color={colors.success} />
                <Text style={styles.sectionTitle}>Your Strengths</Text>
              </View>
              <ChevronRight 
                size={20} 
                color={colors.textLight}
                style={{ 
                  transform: [{ 
                    rotate: expandedSection === 'strengths' ? '90deg' : '0deg' 
                  }]
                }}
              />
            </TouchableOpacity>
            
            {expandedSection === 'strengths' && (
              <View style={styles.sectionContent}>
                {readingPlan.strengths.map((strength, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <View style={[styles.bullet, { backgroundColor: colors.success }]} />
                    <Text style={styles.bulletText}>{strength}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.sectionCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('improve')}
            >
              <View style={styles.sectionHeaderLeft}>
                <BarChart3 size={20} color={colors.warning} />
                <Text style={styles.sectionTitle}>Areas to Improve</Text>
              </View>
              <ChevronRight 
                size={20} 
                color={colors.textLight}
                style={{ 
                  transform: [{ 
                    rotate: expandedSection === 'improve' ? '90deg' : '0deg' 
                  }]
                }}
              />
            </TouchableOpacity>
            
            {expandedSection === 'improve' && (
              <View style={styles.sectionContent}>
                {readingPlan.areasToImprove.map((area, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <View style={[styles.bullet, { backgroundColor: colors.warning }]} />
                    <Text style={styles.bulletText}>{area}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.sectionCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('goals')}
            >
              <View style={styles.sectionHeaderLeft}>
                <Calendar size={20} color={colors.tertiary} />
                <Text style={styles.sectionTitle}>Reading Goals</Text>
              </View>
              <ChevronRight 
                size={20} 
                color={colors.textLight}
                style={{ 
                  transform: [{ 
                    rotate: expandedSection === 'goals' ? '90deg' : '0deg' 
                  }]
                }}
              />
            </TouchableOpacity>
            
            {expandedSection === 'goals' && (
              <View style={styles.sectionContent}>
                <View style={styles.goalItem}>
                  <Clock size={20} color={colors.tertiary} />
                  <Text style={styles.goalText}>
                    <Text style={styles.goalHighlight}>{readingPlan.dailyGoal} minutes</Text> of reading daily
                  </Text>
                </View>
                
                <View style={styles.goalItem}>
                  <BookText size={20} color={colors.tertiary} />
                  <Text style={styles.goalText}>
                    Complete <Text style={styles.goalHighlight}>{readingPlan.weeklyTarget} books</Text> weekly
                  </Text>
                </View>
              </View>
            )}
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.recommendedSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.recommendedTitle}>Recommended Books</Text>
            <Text style={styles.recommendedSubtitle}>
              Based on your reading level and interests
            </Text>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.booksScrollContent}
            >
              {recommendedBooks.map((book, index) => (
                <TouchableOpacity
                  key={book?.id || index}
                  style={styles.bookCard}
                  onPress={() => book && handleBookPress(book.id)}
                >
                  <Image
                    source={{ uri: book?.coverImage }}
                    style={styles.bookCover}
                    resizeMode="cover"
                  />
                  <Text style={styles.bookTitle} numberOfLines={2}>
                    {book?.title || 'Book Title'}
                  </Text>
                  <Text style={styles.bookAuthor} numberOfLines={1}>
                    {book?.author || 'Author Name'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Button
              title="Start Your Reading Journey"
              onPress={handleStartReading}
              variant="primary"
              size="large"
              fullWidth
              icon={<Sparkles size={18} color="white" />}
              style={styles.startButton}
            />
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body.large,
    color: colors.textLight,
  },
  levelCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelTitle: {
    ...typography.heading.h4,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  levelContent: {
    alignItems: 'center',
  },
  levelValue: {
    ...typography.heading.h2,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  progressContainer: {
    width: '100%',
    height: 12,
    backgroundColor: colors.background,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  levelLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  levelLabel: {
    ...typography.body.small,
    color: colors.textLight,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.heading.h5,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  sectionContent: {
    padding: spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  bulletText: {
    ...typography.body.medium,
    color: colors.text,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalText: {
    ...typography.body.medium,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  goalHighlight: {
    fontWeight: '700',
    color: colors.tertiary,
  },
  recommendedSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  recommendedTitle: {
    ...typography.heading.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  recommendedSubtitle: {
    ...typography.body.medium,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  booksScrollContent: {
    paddingVertical: spacing.sm,
  },
  bookCard: {
    width: 140,
    marginRight: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookCover: {
    width: '100%',
    height: 180,
    backgroundColor: colors.background,
  },
  bookTitle: {
    ...typography.body.medium,
    fontWeight: '600',
    color: colors.text,
    padding: spacing.sm,
    paddingBottom: spacing.xs,
  },
  bookAuthor: {
    ...typography.body.small,
    color: colors.textLight,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
  startButton: {
    marginBottom: spacing.lg,
  },
});