export const options = { headerShown: false };
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Pressable, Animated, Dimensions } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingContainer from '../../components/OnboardingContainer';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
// Using colors from design.md
const designColors = {
  sunflower: '#ffb703',
  orange: '#fb8500',
  blue: '#219ebc',
  skyBlue: '#8ecae6',
  deepNavy: '#023047'
};
import { useOnboarding } from '../../context/OnboardingContext';

const { width } = Dimensions.get('window');

// Comparison data for traditional vs AI reading
const comparisonData = [
  {
    title: "Fun Stories",
    traditional: "Same books for everyone",
    ai: "Stories you'll love",
    icon: "S",
    color: designColors.sunflower
  },
  {
    title: "Reading Help",
    traditional: "Limited help",
    ai: "Instant guidance",
    icon: "H",
    color: designColors.orange
  },
  {
    title: "Progress",
    traditional: "Basic tracking",
    ai: "See your growth",
    icon: "P",
    color: designColors.blue
  },
  {
    title: "Fun Factor",
    traditional: "Just reading",
    ai: "Interactive adventures",
    icon: "F",
    color: designColors.deepNavy
  }
];

export default function Capabilities() {
  const router = useRouter();
  const { onboardingData } = useOnboarding();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animate elements in
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
        toValue: 0.85, // AI reading progress (85%)
        duration: 1500,
        delay: 500,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const handleBack = () => {
    router.back(); // Return to Reading Level screen
  };

  const handleContinue = () => {
    // Navigate to next onboarding screen (Goals)
    router.push('/onboarding/Goals');
  };

  return (
    <OnboardingContainer>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Pressable style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={24} color={designColors.deepNavy} />
      </Pressable>
      
      <View style={styles.progressContainer}>
        {Array(13).fill(0).map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.progressDot, 
              i === 4 ? styles.activeDot : i < 4 ? styles.completedDot : {}
            ]}
          />
        ))}
      </View>
      
      <View style={styles.container}>
        
        <ScrollView 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.greeting}>Reading Panda is Special!</Text>
            <Text style={styles.question}>See why kids love learning with us</Text>
            
            {/* Progress comparison graph */}
            <View style={styles.graphContainer}>
              <View style={styles.graphLabels}>
                <View style={styles.labelContainer}>
                  <View style={[styles.aiIconContainer, {backgroundColor: designColors.skyBlue}]}>
                    <Text style={styles.aiIconText}>RP</Text>
                  </View>
                  <Text style={styles.graphLabel}>Reading Panda</Text>
                </View>
                <View style={styles.labelContainer}>
                  <View style={[styles.traditionalIconContainer, {backgroundColor: designColors.orange + '40'}]}>
                    <Text style={styles.traditionalIconText}>T</Text>
                  </View>
                  <Text style={styles.graphLabel}>Traditional</Text>
                </View>
              </View>
              
              <View style={styles.barContainer}>
                <View style={styles.barContainer}>
                  <View style={styles.barLabelRow}>
                    <Text style={styles.barLabel}>Reading Panda</Text>
                    <Text style={[styles.percentText, {color: designColors.blue}]}>85%</Text>
                  </View>
                  <View style={styles.barRow}>
                    <Animated.View 
                      style={[
                        styles.bar, 
                        { 
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%']
                          }), 
                          backgroundColor: designColors.blue 
                        }
                      ]} 
                    />
                  </View>
                </View>
                
                <View style={styles.barContainer}>
                  <View style={styles.barLabelRow}>
                    <Text style={styles.barLabel}>Traditional</Text>
                    <Text style={[styles.percentText, {color: designColors.orange}]}>45%</Text>
                  </View>
                  <View style={styles.barRow}>
                    <View style={[styles.bar, { width: '45%', backgroundColor: designColors.orange }]} />
                  </View>
                </View>
              </View>
              
              <Text style={styles.graphCaption}>Reading improvement in 3 months</Text>
            </View>
            
            {/* Removed comparison cards as requested */}
            
            <TouchableOpacity
              style={styles.button}
              onPress={handleContinue}
            >
              <Text style={styles.buttonText}>Continue</Text>
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
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
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
    flexGrow: 1,
    paddingBottom: 40,
  },
  greeting: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: designColors.deepNavy,
    marginBottom: 12,
    textAlign: 'center',
  },
  question: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    color: designColors.blue,
    marginBottom: 32,
    textAlign: 'center',
  },
  graphContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginBottom: 28,
    // Claymorphism effect
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  graphLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  aiIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: designColors.skyBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    // Claymorphism effect
    shadowColor: designColors.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  aiIconText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#ffffff',
  },
  traditionalIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: designColors.orange + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    // Claymorphism effect
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  traditionalIconText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: designColors.deepNavy,
  },
  graphLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: designColors.deepNavy,
  },
  barContainer: {
    marginBottom: 16,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  barLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: designColors.deepNavy,
  },
  barRow: {
    height: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 18,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    // Claymorphism effect
    shadowColor: '#a0a0a0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  bar: {
    height: '100%',
    borderRadius: 15,
  },
  percentText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
  },
  graphCaption: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: designColors.blue,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  comparisonContainer: {
    marginBottom: 25,
  },
  comparisonCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    // Claymorphism effect
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    // Claymorphism effect
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  comparisonIcon: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  comparisonContent: {
    flex: 1,
  },
  comparisonTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: designColors.deepNavy,
    marginBottom: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  comparisonColumn: {
    width: '42%',
    alignItems: 'center',
  },
  comparisonLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: designColors.blue,
    marginBottom: 6,
  },
  comparisonBubble: {
    padding: 8,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  traditionalBubble: {
    backgroundColor: designColors.orange + '20', // 20% opacity
    // Claymorphism effect
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  aiBubble: {
    backgroundColor: designColors.blue + '20', // 20% opacity
    // Claymorphism effect
    shadowColor: designColors.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  bubbleText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: designColors.deepNavy,
    textAlign: 'center',
  },
  vsCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: designColors.skyBlue + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    // Claymorphism effect
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  vsText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: designColors.deepNavy,
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
    marginTop: 12,
    alignSelf: 'center',
    width: '80%',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: designColors.deepNavy,
    fontSize: 20,
  },
});
