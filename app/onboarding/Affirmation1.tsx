export const options = { headerShown: false };
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingContainer from '../../components/OnboardingContainer';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
// Using colors from design.md
const designColors = {
  sunflower: '#ffb703',
  orange: '#fb8500',
  blue: '#219ebc',
  skyBlue: '#8ecae6',
  deepNavy: '#023047'
};

const { width } = Dimensions.get('window');

export default function Affirmation1() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { childName } = params;
  
  // Reanimated shared values for main content
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(50);
  
  // Card highlight animation values
  const cardHighlight = [
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0)
  ];
  
  // Shadow elevation values for cards
  const cardElevation = [
    useSharedValue(4),
    useSharedValue(4),
    useSharedValue(4),
    useSharedValue(4)
  ];
  
  useEffect(() => {
    // Main content animation
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
    
    // Sequential highlight animations
    const highlightDelay = 600;
    const highlightDuration = 800;
    
    // Card 1 highlight
    cardHighlight[0].value = withDelay(
      highlightDelay,
      withSequence(
        withTiming(1, { duration: highlightDuration/2, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: highlightDuration/2, easing: Easing.in(Easing.cubic) })
      )
    );
    cardElevation[0].value = withDelay(
      highlightDelay,
      withSequence(
        withTiming(12, { duration: highlightDuration/2 }),
        withTiming(4, { duration: highlightDuration/2 })
      )
    );
    
    // Card 2 highlight
    cardHighlight[1].value = withDelay(
      highlightDelay + highlightDuration, 
      withSequence(
        withTiming(1, { duration: highlightDuration/2, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: highlightDuration/2, easing: Easing.in(Easing.cubic) })
      )
    );
    cardElevation[1].value = withDelay(
      highlightDelay + highlightDuration,
      withSequence(
        withTiming(12, { duration: highlightDuration/2 }),
        withTiming(4, { duration: highlightDuration/2 })
      )
    );
    
    // Card 3 highlight
    cardHighlight[2].value = withDelay(
      highlightDelay + highlightDuration * 2,
      withSequence(
        withTiming(1, { duration: highlightDuration/2, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: highlightDuration/2, easing: Easing.in(Easing.cubic) })
      )
    );
    cardElevation[2].value = withDelay(
      highlightDelay + highlightDuration * 2,
      withSequence(
        withTiming(12, { duration: highlightDuration/2 }),
        withTiming(4, { duration: highlightDuration/2 })
      )
    );
    
    // Card 4 highlight
    cardHighlight[3].value = withDelay(
      highlightDelay + highlightDuration * 3,
      withSequence(
        withTiming(1, { duration: highlightDuration/2, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: highlightDuration/2, easing: Easing.in(Easing.cubic) })
      )
    );
    cardElevation[3].value = withDelay(
      highlightDelay + highlightDuration * 3,
      withSequence(
        withTiming(12, { duration: highlightDuration/2 }),
        withTiming(4, { duration: highlightDuration/2 })
      )
    );
  }, []);

  const handleBack = () => {
    router.back(); // Return to Goals screen
  };

  const handleContinue = () => {
    // Navigate to next onboarding screen (ProjectionGraph)
    router.push({
      pathname: '/onboarding/ProjectionGraph',
      params
    });
  };

  return (
    <OnboardingContainer>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Pressable style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={24} color={designColors.deepNavy} />
      </Pressable>
      
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          {Array(13).fill(0).map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.progressDot, 
                i === 6 ? styles.activeDot : i < 6 ? styles.completedDot : {}
              ]}
            />
          ))}
        </View>
        
        <Animated.View
          style={useAnimatedStyle(() => ({
            ...styles.contentContainer,
            opacity: opacity.value,
            transform: [
              { scale: scale.value },
              { translateY: translateY.value }
            ]
          }))}
        >
          {/* Removed mascot image for cleaner design */}
          
          <View style={styles.affirmationCard}>
            <Text style={styles.affirmationTitle}>You're making a great choice!</Text>
            
            <Text style={styles.affirmationText}>
              By investing in {childName}'s reading journey today, you're setting them up for:
            </Text>
            
            <View style={styles.benefitsList}>
              {/* Card 1 */}
              <View style={styles.cardWrapper}>
                <Animated.View 
                  style={useAnimatedStyle(() => ({
                    ...styles.benefitItem,
                    backgroundColor: 'white',
                    shadowColor: designColors.skyBlue,
                    shadowOpacity: 0.15 + cardHighlight[0].value * 0.3,
                    shadowRadius: cardElevation[0].value,
                    elevation: cardElevation[0].value,
                    borderColor: cardHighlight[0].value > 0.5 ? designColors.sunflower : '#ffffff',
                    transform: [
                      { scale: 1 + cardHighlight[0].value * 0.02 }
                    ]
                  }))}
                >
                  <Text style={styles.benefitText}>Stronger cognitive development</Text>
                </Animated.View>
              </View>
              
              {/* Card 2 */}
              <View style={styles.cardWrapper}>
                <Animated.View 
                  style={useAnimatedStyle(() => ({
                    ...styles.benefitItem,
                    backgroundColor: 'white',
                    shadowColor: designColors.skyBlue,
                    shadowOpacity: 0.15 + cardHighlight[1].value * 0.3,
                    shadowRadius: cardElevation[1].value,
                    elevation: cardElevation[1].value,
                    borderColor: cardHighlight[1].value > 0.5 ? designColors.sunflower : '#ffffff',
                    transform: [
                      { scale: 1 + cardHighlight[1].value * 0.02 }
                    ]
                  }))}
                >
                  <Text style={styles.benefitText}>Better communication skills</Text>
                </Animated.View>
              </View>
              
              {/* Card 3 */}
              <View style={styles.cardWrapper}>
                <Animated.View 
                  style={useAnimatedStyle(() => ({
                    ...styles.benefitItem,
                    backgroundColor: 'white',
                    shadowColor: designColors.skyBlue,
                    shadowOpacity: 0.15 + cardHighlight[2].value * 0.3,
                    shadowRadius: cardElevation[2].value,
                    elevation: cardElevation[2].value,
                    borderColor: cardHighlight[2].value > 0.5 ? designColors.sunflower : '#ffffff',
                    transform: [
                      { scale: 1 + cardHighlight[2].value * 0.02 }
                    ]
                  }))}
                >
                  <Text style={styles.benefitText}>Greater academic success</Text>
                </Animated.View>
              </View>
              
              {/* Card 4 */}
              <View style={styles.cardWrapper}>
                <Animated.View 
                  style={useAnimatedStyle(() => ({
                    ...styles.benefitItem,
                    backgroundColor: 'white',
                    shadowColor: designColors.skyBlue,
                    shadowOpacity: 0.15 + cardHighlight[3].value * 0.3,
                    shadowRadius: cardElevation[3].value,
                    elevation: cardElevation[3].value,
                    borderColor: cardHighlight[3].value > 0.5 ? designColors.sunflower : '#ffffff',
                    transform: [
                      { scale: 1 + cardHighlight[3].value * 0.02 }
                    ]
                  }))}
                >
                  <Text style={styles.benefitText}>A lifelong love of learning</Text>
                </Animated.View>
              </View>
            </View>
            
            <Text style={styles.affirmationQuote}>
              "Reading is a passport to countless adventures." 
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </OnboardingContainer>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: designColors.skyBlue,
    alignItems: 'center',
    justifyContent: 'center',
    // Claymorphism effect
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e6ed',
    margin: 4,
    // Claymorphism effect for dots
    shadowColor: '#a0a0a0',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeDot: {
    backgroundColor: designColors.orange,
    width: 14,
    height: 14,
    borderRadius: 7,
    // Enhanced shadow for active dot
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  completedDot: {
    backgroundColor: designColors.blue,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Removed mascot image styles
  affirmationCard: {
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 28,
    width: '90%',
    // Claymorphism effect
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 28,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  affirmationTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: designColors.deepNavy,
    textAlign: 'center',
    marginBottom: 20,
  },
  affirmationText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: designColors.blue,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 28,
  },
  benefitsList: {
    marginBottom: 20,
  },
  cardWrapper: {
    height: 72, // Increased height for each card wrapper
    marginBottom: 16, // Consistent spacing between cards
    justifyContent: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 18,
    paddingVertical: 16, // Increased vertical padding
    paddingHorizontal: 14,
    minHeight: 56, // Ensure enough height for descenders
    width: '100%',
    // Claymorphism effect (base values, will be animated)
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  // Removed icon container styles
  benefitText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 17,
    color: designColors.deepNavy,
    textAlign: 'center',
    lineHeight: 22,
  },
  affirmationQuote: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: designColors.blue,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
  button: {
    backgroundColor: designColors.sunflower,
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    // Claymorphism effect for button
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    width: '90%',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: designColors.deepNavy,
    fontSize: 20,
  },
});
