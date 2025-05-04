export const options = { headerShown: false };
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Image, TouchableOpacity, ScrollView, Pressable, Animated } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
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

export default function ChildInfo() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  
  const [childName, setChildName] = useState(onboardingData.childName);
  const [childAge, setChildAge] = useState(onboardingData.childAge);
  const [sliderValue, setSliderValue] = useState(parseInt(onboardingData.childAge) || 5);
  const [step, setStep] = useState(1);
  
  // Update context when inputs change
  useEffect(() => {
    updateOnboardingData({
      childName,
      childAge
    });
  }, [childName, childAge]);

  const handleContinue = () => {
    if (step === 1 && childName) {
      setStep(2);
    } else if (step === 2 && childAge) {
      // Navigate to next onboarding screen (Avatar selection)
      router.push('/onboarding/Avatar');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back(); // Return to Register screen
    }
  };

  const handleSliderChange = (value: number) => {
    const age = Math.round(value).toString();
    setSliderValue(value);
    setChildAge(age);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            {/* Image removed as per design update */}
            <Text style={styles.greeting}>Let's get to know your child!</Text>
            <Text style={styles.question}>What's your child's name?</Text>
            <TextInput
              style={styles.input}
              value={childName}
              onChangeText={setChildName}
              placeholder="Type your child's name"
              placeholderTextColor="#8a9cb0"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={handleContinue}
            />
            <TouchableOpacity
              style={[styles.button, !childName && styles.buttonDisabled]}
              disabled={!childName}
              onPress={handleContinue}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            {/* Image removed as per design update */}
            <Text style={styles.greeting}>How old is {childName}?</Text>
            <Text style={styles.question}>This helps us personalize their reading journey</Text>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.ageDisplay}>{childAge}</Text>
              <Text style={styles.yearsOld}>years old</Text>
              
              <View style={styles.sliderWrapper}>
                <Slider
                  style={styles.slider}
                  minimumValue={3}
                  maximumValue={13}
                  step={1}
                  value={sliderValue}
                  onValueChange={handleSliderChange}
                  minimumTrackTintColor={designColors.blue}
                  maximumTrackTintColor="#e0e6ed"
                  thumbTintColor={designColors.sunflower}
                />
                
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>3</Text>
                  <Text style={styles.sliderLabel}>13+</Text>
                </View>
              </View>
              
              <View style={styles.ageDescription}>
                {sliderValue <= 5 && (
                  <Text style={styles.ageDescriptionText}>Early reader - learning the basics</Text>
                )}
                {sliderValue > 5 && sliderValue <= 9 && (
                  <Text style={styles.ageDescriptionText}>Growing reader - building confidence</Text>
                )}
                {sliderValue > 9 && (
                  <Text style={styles.ageDescriptionText}>Advanced reader - expanding horizons</Text>
                )}
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.button, !childAge && styles.buttonDisabled]}
              disabled={!childAge}
              onPress={handleContinue}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
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
              i === 1 ? styles.activeDot : i < 1 ? styles.completedDot : {}
            ]}
          />
        ))}
      </View>
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
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
  stepContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // mascotImage styles removed as image is no longer used
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
    marginBottom: 28,
    textAlign: 'center',
  },
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 24,
    padding: 18,
    marginBottom: 28,
    borderWidth: 3,
    borderColor: designColors.skyBlue,
    color: designColors.deepNavy,
    textAlign: 'center',
    // Claymorphism effect
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  ageDisplay: {
    fontFamily: 'Poppins-Bold',
    fontSize: 64,
    color: designColors.deepNavy,
    textAlign: 'center',
    marginBottom: -5,
  },
  yearsOld: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    color: designColors.blue,
    marginBottom: 24,
  },
  sliderWrapper: {
    width: '100%',
    paddingHorizontal: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: -5,
  },
  sliderLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: designColors.deepNavy,
  },
  ageDescription: {
    marginTop: 18,
    backgroundColor: designColors.sunflower + '20', // 20% opacity
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    // Claymorphism effect
    shadowColor: designColors.sunflower,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  ageDescriptionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: designColors.deepNavy,
    textAlign: 'center',
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
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  buttonDisabled: {
    backgroundColor: '#d0d0d0',
    shadowOpacity: 0.1,
    borderColor: '#f0f0f0',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: designColors.deepNavy,
    fontSize: 20,
  },
});
