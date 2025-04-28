import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ViewStyle, 
  TextStyle, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  Platform,
  Image,
  ScrollView
} from 'react-native';
import type { ImageStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Book, BookOpen, Award, Sparkles, ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { useUserStore } from '@/store/user-store';
import Button from '@/components/Button';
import AnimatedText from '@/components/AnimatedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');


interface ComponentStyles {
  container: ViewStyle;
  gradientBackground: ViewStyle;
  scrollView: ViewStyle;
  scrollContent: ViewStyle;
  heroContainer: ViewStyle;
  heroBackgroundImage: ImageStyle;
  heroContent: ViewStyle;
  heroBottomFade: ViewStyle;
  fadeGradient: ViewStyle;
  greeting: TextStyle;
  readerText: TextStyle;
  heroTagline: TextStyle;
  mainContent: ViewStyle;
  bookIconContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  buttonContainer: ViewStyle;
  getStartedButton: ViewStyle;
  loginButton: ViewStyle;
  buttonText: TextStyle;
  loginButtonText: TextStyle;
  learnMoreContainer: ViewStyle;
  learnMoreText: TextStyle;

}

export default function WelcomeScreen() {
  const router = useRouter();
  const { isParentLoggedIn } = useUserStore();
  const insets = useSafeAreaInsets();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonSlideAnim = useRef(new Animated.Value(30)).current;
  const logoLineAnim = useRef(new Animated.Value(0)).current;
  const learnMoreFadeAnim = useRef(new Animated.Value(0)).current;

  // Check if user is already logged in
  useEffect(() => {
    if (isParentLoggedIn) {
      router.replace('/(tabs)');
    }
  }, [isParentLoggedIn]);

  // Run animations on mount
  useEffect(() => {
    // Main content animations
    Animated.sequence([
      // Start with logo and hero animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(slideUpAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 8,
        }),
      ]),

      // Then animate buttons and learn more
      Animated.parallel([
        Animated.timing(buttonFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(buttonSlideAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
        }),
        Animated.timing(learnMoreFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(logoLineAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.push('/signup');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLearnMore = () => {
    router.push('/onboarding');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.yellow, colors.green, colors.blue]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Hero Section with Panda Image - OUTSIDE ScrollView for true full-bleed */}
        <View style={[styles.heroContainer, { height: height * 0.35 + insets.top }]}> 
          <Image 
            source={require('@/assets/images/panda-hero-landing.png')}
            style={styles.heroBackgroundImage}
            resizeMode="cover"
            onError={() => console.log('Landing hero image not found. Please add it to assets/images/')}
          />
          <View style={[styles.heroContent, { paddingTop: insets.top + spacing.xl }]}> 
          </View>
        </View>
        {/* Scrollable content begins AFTER hero section */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Fade transition below hero */}
          <View style={styles.heroBottomFade}>
            <LinearGradient
              colors={["rgba(26,35,126,0)", "#1a237e"]}
              style={styles.fadeGradient}
            />
          </View>

          {/* Main content starts here */}
          <View style={styles.mainContent}>
            <Animated.View 
              style={[
                styles.buttonContainer,
                {
                  opacity: buttonFadeAnim,
                  transform: [{ translateY: buttonSlideAnim }]
                }
              ]}
            >
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={handleGetStarted}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <Text style={styles.buttonText}>Log In</Text>
              </TouchableOpacity>
              
              <Animated.View style={{ opacity: learnMoreFadeAnim }}>
                <TouchableOpacity style={styles.learnMoreContainer} onPress={handleLearnMore}>
                  <Text style={styles.learnMoreText}>Learn more about ReadingPal</Text>
                  <ChevronRight size={16} color={colors.purple} />
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create<ComponentStyles>({
  container: {
    flex: 1,
    backgroundColor: '#1a237e',
  },
  gradientBackground: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroContainer: {
    height: height * 0.35,
    width: '100%',
    backgroundColor: '#1a237e',
    // Remove border radius at the top so image is flush with status bar
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    paddingTop: 0,
    marginTop: 0,
  },
  heroBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    zIndex: 1,
  },
  heroBottomFade: {
    height: 36,
    width: '100%',
    marginTop: -36,
    zIndex: 2,
  },
  fadeGradient: {
    width: '100%',
    height: '100%',
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Poppins-Regular',
    color: '#ffffff',
  },
  readerText: {
    fontSize: 40,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    marginTop: spacing.xs,
  },
  heroTagline: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
    marginTop: spacing.xl,
  },
  mainContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl * 6,
  },
  bookIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageContent: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: spacing.md,
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    color: '#ffffff',
    paddingHorizontal: spacing.md,
    lineHeight: 22,
    opacity: 0.8,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: colors.purple,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: 25,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  loginButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: 25,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    padding: spacing.md,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  loginButtonText: {
    color: colors.blue,
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  learnMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: '80%',
    alignSelf: 'center',
  },
  learnMoreText: {
    color: '#ffffff',
    fontSize: 16,
    marginRight: spacing.xs,
    fontFamily: 'Poppins-Medium',
  },

});