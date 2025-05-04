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
import { ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { useUserStore } from '@/store/user-store';
import Button from '@/components/Button';
import AnimatedText from '@/components/AnimatedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnboardingContainer from '@/components/OnboardingContainer';

const { width, height } = Dimensions.get('window');


// Colors from design.md
const designColors = {
  sunflower: '#ffb703',
  orange: '#fb8500',
  blue: '#219ebc',
  skyBlue: '#8ecae6',
  deepNavy: '#023047'
};

interface ComponentStyles {
  scrollView: ViewStyle;
  scrollContent: ViewStyle;
  heroContainer: ViewStyle;
  heroBackgroundImage: ImageStyle;
  heroContent: ViewStyle;
  greeting: TextStyle;
  readerText: TextStyle;
  heroTagline: TextStyle;
  mainContent: ViewStyle;
  bookIconContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  buttonContainer: ViewStyle;
  getStartedButtonContainer: ViewStyle;
  getStartedButton: ViewStyle;
  loginButton: ViewStyle;
  buttonText: TextStyle;
  loginButtonText: TextStyle;
  learnMoreContainer: ViewStyle;
  learnMoreText: TextStyle;
  pandaImage: ImageStyle;
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
    router.push('/onboarding/Register');
  };

  return (
    <OnboardingContainer>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Panda reading book illustration with enhanced animation */}
        <Animated.Image 
          source={require('@/assets/images/panda-hero-landing.png')}
          style={[
            styles.pandaImage,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideUpAnim },
                { scale: scaleAnim },
                { rotate: fadeAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: ['-5deg', '5deg', '0deg']
                }) }
              ]
            }
          ]}
          resizeMode="contain"
        />

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
              style={styles.getStartedButtonContainer}
              onPress={handleGetStarted}
            >
              <LinearGradient
                colors={[designColors.sunflower, designColors.orange]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.getStartedButton}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>
            
            <Animated.View style={{ opacity: learnMoreFadeAnim }}>
              <TouchableOpacity style={styles.learnMoreContainer} onPress={handleLearnMore}>
                <Text style={styles.learnMoreText}>Learn more about AI Kiddo</Text>
                <ChevronRight size={16} color={designColors.blue} />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </ScrollView>
    </OnboardingContainer>
  );
}

const styles = StyleSheet.create<ComponentStyles>({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
    justifyContent: 'center',
  },
  heroContainer: {
    height: height * 0.35,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    paddingTop: 0,
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  heroBackgroundImage: {
    width: '100%',
    height: height * 0.4,
    alignSelf: 'center',
    marginBottom: spacing.md,
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
    color: designColors.deepNavy,
  },
  readerText: {
    fontSize: 40,
    fontFamily: 'Poppins-Bold',
    color: designColors.deepNavy,
    marginTop: spacing.xs,
  },
  heroTagline: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
    color: designColors.blue,
    marginTop: spacing.xl,
  },
  mainContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl * 2,
    flex: 1,
    justifyContent: 'flex-start',
  },
  bookIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: designColors.skyBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: designColors.deepNavy,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: designColors.blue,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
    alignItems: 'center',
  },
  getStartedButtonContainer: {
    width: '100%',
    marginBottom: spacing.md,
    // Claymorphism shadow container
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  getStartedButton: {
    borderRadius: 28,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    overflow: 'hidden',
  },
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 2,
    borderColor: designColors.blue,
    borderRadius: 28,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: designColors.deepNavy,
  },
  loginButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: designColors.blue,
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
  pandaImage: {
    width: '80%',
    height: height * 0.35,
    alignSelf: 'center',
    marginBottom: spacing.xl,
    // Enhanced shadow for floating effect
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },

});