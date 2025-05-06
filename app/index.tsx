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
  ScrollView,
  ImageBackground
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
import { BlurView } from 'expo-blur';

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
  container: ViewStyle;
  backgroundImage: ViewStyle;
  blurContainer: ViewStyle;
  contentContainer: ViewStyle;
  spacer: ViewStyle;
  heroContainer: ViewStyle;
  heroBackgroundImage: ImageStyle;
  heroContent: ViewStyle;
  greeting: TextStyle;
  readerText: TextStyle;
  heroTagline: TextStyle;
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
  loginLinkText: TextStyle;
  loginLinkHighlight: TextStyle;
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
    router.push('/onboarding/Register');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLearnMore = () => {
    router.push('/onboarding/Register');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/landing_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <BlurView intensity={0} style={styles.blurContainer} tint="light">
          <View style={styles.contentContainer}>
            {/* Empty space to allow the background image to show */}
            <View style={styles.spacer} />
            
            {/* Buttons at the bottom of the screen */}
            <Animated.View 
              style={[
                styles.buttonContainer,
                {
                  opacity: buttonFadeAnim,
                  transform: [{ translateY: buttonSlideAnim }],
                  marginBottom: insets.bottom + spacing.md // Reduced bottom margin
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
            
            <Animated.View style={{ opacity: learnMoreFadeAnim, marginTop: spacing.sm }}>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLinkText}>
                  Already have an account? <Text style={styles.loginLinkHighlight}>Log in</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
            </Animated.View>
          </View>
        </BlurView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create<ComponentStyles>({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  } as ViewStyle,
  blurContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  spacer: {
    flex: 1,
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
    paddingHorizontal: spacing.md,
  },
  getStartedButtonContainer: {
    width: '100%',
    marginBottom: spacing.sm, // Reduced margin
    alignItems: 'center', // Center the button horizontally
    // Claymorphism shadow container
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 6 }, // Reduced shadow offset
    shadowOpacity: 0.3,
    shadowRadius: 12, // Reduced shadow radius
    elevation: 8, // Reduced elevation
  },
  getStartedButton: {
    borderRadius: 28,
    paddingVertical: spacing.md, // Reduced vertical padding
    paddingHorizontal: spacing.lg, // Reduced horizontal padding
    width: '80%', // Reduced width from 100% to 80%
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    overflow: 'hidden',
  },
  loginButton: {
    backgroundColor: designColors.deepNavy, // Changed to deep navy for a darker look
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 28,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: designColors.deepNavy,
  },
  loginButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff', // Changed to white for better contrast on dark background
  },
  learnMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: 'rgba(33, 158, 188, 0.9)', // Changed to darker blue (based on the blue color in your palette)
    borderRadius: 20,
    width: '80%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  learnMoreText: {
    color: '#ffffff',
    fontSize: 16,
    marginRight: spacing.xs,
    fontFamily: 'Poppins-Medium',
  },
  loginLinkText: {
    color: designColors.deepNavy, // Changed to deep navy (nearly black) for better contrast on white background
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  loginLinkHighlight: {
    color: designColors.sunflower,
    fontFamily: 'Poppins-SemiBold',
    textDecorationLine: 'underline',
  },
});