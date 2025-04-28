import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  Image,
  Platform,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ImageStyle
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Book, Award, Sparkles, Brain, BookOpen, Lightbulb, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import Button from '@/components/Button';
import AnimatedText from '@/components/AnimatedText';
import FloatingElements from '@/components/FloatingElements';

const { width } = Dimensions.get('window');

const features = [
  {
    id: 1,
    title: 'Personalized Learning',
    description: 'Our AI adapts to your child\'s reading level and learning pace',
    icon: <Brain size={32} color="white" />,
    gradient: [colors.blue, colors.purple]
  },
  {
    id: 2,
    title: 'Interactive Reading',
    description: 'Engaging stories with interactive elements to keep children motivated',
    icon: <BookOpen size={32} color="white" />,
    gradient: [colors.purple, colors.red]
  },
  {
    id: 3,
    title: 'Pronunciation Practice',
    description: 'Real-time feedback on pronunciation to improve speaking skills',
    icon: <Sparkles size={32} color="white" />,
    gradient: [colors.green, colors.blue]
  },
  {
    id: 4,
    title: 'Progress Tracking',
    description: 'Detailed insights into reading progress and skill development',
    icon: <Award size={32} color="white" />,
    gradient: [colors.yellow, colors.green]
  },
  {
    id: 5,
    title: 'Reading Recommendations',
    description: 'Curated book suggestions based on interests and reading level',
    icon: <Book size={32} color="white" />,
    gradient: [colors.red, colors.yellow]
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );
  
  const handleStartAssessment = () => {
    router.push('/assessment');
  };
  
  const handleSkip = () => {
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.yellow, colors.green, colors.blue]} // Soft gradient using our palette
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/')}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Discover ReadingPal</Text>
          <Text style={styles.subtitle}>
            The smart reading companion for your child's learning journey
          </Text>
        </Animated.View>
        
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}
        >
          {features.map((feature, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width
            ];
            
            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.8, 1, 0.8],
              extrapolate: 'clamp'
            });
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.6, 1, 0.6],
              extrapolate: 'clamp'
            });
            
            return (
              <Animated.View 
                key={feature.id}
                style={[
                  styles.featureSlide,
                  { 
                    transform: [{ scale }],
                    opacity
                  }
                ]}
              >
                <View style={styles.featureIconContainer}>
                  <LinearGradient
                    colors={feature.gradient as [string, string]} // Fixed: Type assertion to [string, string]
                    style={styles.featureIconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {feature.icon}
                  </LinearGradient>
                </View>
                
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
                
                <View style={styles.featureImagePlaceholder}>
                  <Lightbulb size={40} color={colors.textLight} />
                </View>
              </Animated.View>
            );
          })}
        </ScrollView>
        
        <View style={styles.paginationContainer}>
          {features.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width
            ];
            
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 16, 8],
              extrapolate: 'clamp'
            });
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp'
            });
            
            return (
              <Animated.View
                key={index}
                style={[
                  styles.paginationDot,
                  { 
                    width: dotWidth,
                    opacity
                  }
                ]}
              />
            );
          })}
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Start Reading Assessment"
            onPress={handleStartAssessment}
            variant="primary"
            size="large"
            fullWidth
            icon={<ChevronRight size={18} color="white" />}
            style={styles.assessmentButton}
            animated
          />
          
          <Button
            title="Skip for Now"
            onPress={handleSkip}
            variant="text"
            style={styles.skipButton}
            animated
          />
        </View>
        
        <FloatingElements 
          style={styles.floatingElements}
          count={6}
          colors={[colors.primary, colors.secondary, colors.tertiary]}
          minOpacity={0.05}
          maxOpacity={0.15}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

interface Styles {
  container: ViewStyle;
  gradientBackground: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  carousel: ViewStyle;
  carouselContent: ViewStyle;
  featureSlide: ViewStyle;
  featureIconContainer: ViewStyle;
  featureIconGradient: ViewStyle;
  featureTitle: TextStyle;
  featureDescription: TextStyle;
  featureImage: ImageStyle;
  featureImagePlaceholder: ViewStyle;
  paginationContainer: ViewStyle;
  paginationDot: ViewStyle;
  buttonContainer: ViewStyle;
  assessmentButton: ViewStyle;
  skipButton: ViewStyle;
  floatingElements: ViewStyle;
  backButton: ViewStyle;
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: colors.blue, // Fallback color
  },
  gradientBackground: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    top: spacing.sm,
    padding: spacing.xs,
    zIndex: 1,
  },
  title: {
    ...typography.heading.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body.large,
    textAlign: 'center',
    color: colors.textLight,
    paddingHorizontal: spacing.md,
  },
  carousel: {
    flex: 1,
  },
  carouselContent: {
    alignItems: 'center',
  },
  featureSlide: {
    width: width,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconContainer: {
    marginBottom: spacing.lg,
    // Claymorphic shadow style
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  featureIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 24, // Following our design system
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    // Claymorphic inner shadow
    shadowColor: '#fff',
    shadowOffset: {
      width: -2,
      height: -2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  featureTitle: {
    ...typography.heading.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.text,
  },
  featureDescription: {
    ...typography.body.medium,
    textAlign: 'center',
    color: colors.textLight,
    marginBottom: spacing.xl,
  },
  featureImage: {
    width: width * 0.7,
    height: width * 0.5,
    borderRadius: 16,
    backgroundColor: colors.card,
  },
  featureImagePlaceholder: {
    width: width * 0.7,
    height: width * 0.5,
    borderRadius: 16,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
  },
  assessmentButton: {
    marginBottom: spacing.md,
  },
  skipButton: {
    marginBottom: spacing.md,
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
});