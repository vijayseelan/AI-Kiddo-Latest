export const options = { headerShown: false };
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Animated, Dimensions, ScrollView, StatusBar as RNStatusBar } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingContainer from '../../components/OnboardingContainer';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Colors from design.md
const designColors = {
  sunflower: '#ffb703',
  orange: '#fb8500',
  blue: '#219ebc',
  skyBlue: '#8ecae6',
  deepNavy: '#023047'
};

const { width } = Dimensions.get('window');

// Assessment types
const assessmentTypes = [
  {
    id: 'words',
    title: 'Word Recognition',
    color: designColors.sunflower,
  },
  {
    id: 'sentences',
    title: 'Sentence Fluency',
    color: designColors.orange,
  },
  {
    id: 'pronunciation',
    title: 'Pronunciation',
    color: designColors.skyBlue,
  }
];

export default function AssessmentIntro() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { childName } = params;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnims = useRef(assessmentTypes.map(() => new Animated.Value(0.9))).current;
  
  useEffect(() => {
    // Fade in the content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      // Staggered animation for assessment cards
      Animated.stagger(150, 
        scaleAnims.map(anim => 
          Animated.spring(anim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          })
        )
      )
    ]).start();
  }, []);

  const handleBack = () => {
    router.back(); // Return to previous screen
  };

  const handleContinue = () => {
    // Navigate to next onboarding screen (Assessment)
    router.push({
      pathname: '/onboarding/Assessment',
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
                i === 8 ? styles.activeDot : i < 8 ? styles.completedDot : {}
              ]}
            />
          ))}
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View 
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
          <Text style={styles.title}>Let's Assess {childName}'s Reading</Text>
          <Text style={styles.subtitle}>A quick, fun assessment to personalize the experience</Text>
          
          <Text style={styles.sectionTitle}>Our Assessment Includes:</Text>
          
          {assessmentTypes.map((type, index) => (
            <Animated.View 
              key={type.id}
              style={[
                styles.assessmentCard,
                {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                  transform: [{ scale: scaleAnims[index] }]
                }
              ]}
            >
              <View style={[styles.assessmentContent, { borderLeftWidth: 4, borderLeftColor: type.color, paddingLeft: 15 }]}>
                <Text style={styles.assessmentTitle}>{type.title}</Text>
              </View>
            </Animated.View>
          ))}
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>What to Expect:</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoText}>Takes only 5-7 minutes</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoText}>Game-like, fun experience</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoText}>Helps create a personalized reading plan</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Start Assessment</Text>
          </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    </OnboardingContainer>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: (RNStatusBar.currentHeight || 0) + 15,
    left: 20,
    zIndex: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: designColors.skyBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
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
    zIndex: 5,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e6ed',
    margin: 4,
    shadowColor: '#a0a0a0',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  activeDot: {
    backgroundColor: designColors.orange,
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  completedDot: {
    backgroundColor: designColors.blue,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingTop: 70, // Add space for the progress dots
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: designColors.deepNavy,
    marginBottom: 8,
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 17,
    color: designColors.blue,
    marginBottom: 25,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: designColors.deepNavy,
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  assessmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 18,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 2,
    // Claymorphism
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  assessmentContent: {
    flex: 1,
  },
  assessmentTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: designColors.deepNavy,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 28,
    padding: 20,
    width: '100%',
    // Claymorphism
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginTop: 20,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  infoTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: designColors.deepNavy,
    marginBottom: 15,
    textAlign: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: `${designColors.skyBlue}20`,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 15,
    minHeight: 50,
  },
  infoText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: designColors.deepNavy,
    flex: 1,
    lineHeight: 23,
    textAlign: 'center',
  },
  button: {
    backgroundColor: designColors.sunflower,
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    marginTop: 20,
    marginBottom: 10,
    // Claymorphism
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: designColors.deepNavy,
    fontSize: 20,
  },
});
