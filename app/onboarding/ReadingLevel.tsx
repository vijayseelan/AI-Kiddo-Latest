export const options = { headerShown: false };
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Image, TouchableOpacity, ScrollView, Pressable } from 'react-native';
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

// Define reading level type
type ReadingLevel = 'beginner' | 'intermediate' | 'advanced' | 'not-sure';

// Reading level descriptions
const levelDescriptions = {
  beginner: 'Just starting to read simple words and sentences',
  intermediate: 'Can read short stories with some help',
  advanced: 'Reads chapter books independently',
  'not-sure': "We'll help figure it out!"
};

// Reading level icons (text instead of emoji)
const levelIcons = {
  beginner: 'B',
  intermediate: 'I',
  advanced: 'A',
  'not-sure': '?'
};

export default function ReadingLevel() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  
  const [selectedLevel, setSelectedLevel] = useState<ReadingLevel | null>(
    onboardingData.readingLevel as ReadingLevel || null
  );
  
  // Update context when reading level changes
  useEffect(() => {
    if (selectedLevel) {
      updateOnboardingData({ readingLevel: selectedLevel });
    }
  }, [selectedLevel]);

  const handleBack = () => {
    router.back(); // Return to Avatar screen
  };

  const handleContinue = () => {
    if (selectedLevel) {
      // Navigate to next onboarding screen (Capabilities)
      router.push('/onboarding/Capabilities');
    }
  };

  const renderLevelCard = (level: ReadingLevel, title: string) => (
    <TouchableOpacity
      style={[
        styles.levelCard,
        selectedLevel === level && styles.selectedLevelCard
      ]}
      onPress={() => setSelectedLevel(level)}
      activeOpacity={0.8}
    >
      <View style={[
        styles.iconContainer,
        { backgroundColor: getLevelColor(level, 0.15) }
      ]}>
        <Text style={styles.levelIcon}>{levelIcons[level]}</Text>
      </View>
      
      <View style={styles.levelTextContainer}>
        <Text style={styles.levelTitle}>{title}</Text>
        <Text style={styles.levelDescription}>{levelDescriptions[level]}</Text>
      </View>
      
      {selectedLevel === level && (
        <View style={[styles.checkmark, { backgroundColor: getLevelColor(level) }]}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Get color based on reading level
  const getLevelColor = (level: ReadingLevel, opacity = 1) => {
    const levelColors = {
      beginner: designColors.skyBlue,
      intermediate: designColors.blue,
      advanced: designColors.deepNavy,
      'not-sure': designColors.orange
    };
    
    const color = levelColors[level];
    if (opacity === 1) return color;
    
    // Extract hex color and add opacity
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
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
              i === 3 ? styles.activeDot : i < 3 ? styles.completedDot : {}
            ]}
          />
        ))}
      </View>
      
      <View style={styles.container}>
        
        <ScrollView 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.greeting}>What's {onboardingData.childName}'s reading level?</Text>
          <Text style={styles.question}>This helps us personalize their reading materials</Text>
          
          <View style={styles.levelsContainer}>
            {renderLevelCard('beginner', 'Beginner')}
            {renderLevelCard('intermediate', 'Intermediate')}
            {renderLevelCard('advanced', 'Advanced')}
            {renderLevelCard('not-sure', 'Not Sure')}
          </View>
          
          <TouchableOpacity
            style={[styles.button, !selectedLevel && styles.buttonDisabled]}
            disabled={!selectedLevel}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
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
  levelsContainer: {
    width: '90%',
    marginBottom: 32,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    paddingVertical: 18,
    marginBottom: 18,
    // Claymorphism effect
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  selectedLevelCard: {
    borderWidth: 3,
    borderColor: designColors.blue,
    shadowColor: designColors.blue,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    // Claymorphism effect
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  levelIcon: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  levelTextContainer: {
    flex: 1,
  },
  levelTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: designColors.deepNavy,
    marginBottom: 6,
  },
  levelDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: designColors.blue,
  },
  checkmark: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    // Claymorphism effect
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  checkmarkText: {
    color: designColors.deepNavy,
    fontSize: 18,
    fontWeight: 'bold',
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
    width: '80%',
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
