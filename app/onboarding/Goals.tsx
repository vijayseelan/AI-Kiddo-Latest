export const options = { headerShown: false };
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Pressable } from 'react-native';
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

// Define goal type
type Goal = {
  id: string;
  title: string;
  color: string;
};

// Goals data
const goalsData: Goal[] = [
  {
    id: 'fluency',
    title: 'Reading Fluency',
    color: designColors.blue
  },
  {
    id: 'vocabulary',
    title: 'Build Vocabulary',
    color: designColors.skyBlue
  },
  {
    id: 'comprehension',
    title: 'Understand Stories',
    color: designColors.deepNavy
  },
  {
    id: 'confidence',
    title: 'Build Confidence',
    color: designColors.orange
  },
  {
    id: 'enjoyment',
    title: 'Love of Reading',
    color: designColors.sunflower
  }
];

export default function Goals() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  
  const [selectedGoals, setSelectedGoals] = useState<string[]>(onboardingData.goals);
  
  // Update context when goals change
  useEffect(() => {
    updateOnboardingData({ goals: selectedGoals });
  }, [selectedGoals]);

  const handleBack = () => {
    router.back(); // Return to Capabilities screen
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else {
        return [...prev, goalId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedGoals.length > 0) {
      // Navigate directly to Affirmation1 (skipping DesiredOutcomes)
      router.push({
        pathname: '/onboarding/Affirmation1',
        params: { childName: onboardingData.childName }
      });
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
              i === 5 ? styles.activeDot : i < 5 ? styles.completedDot : {}
            ]}
          />
        ))}
      </View>
      
      <View style={styles.container}>
        
        <ScrollView 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.greeting}>What are your goals for {onboardingData.childName}?</Text>
          <Text style={styles.question}>Pick what matters most to you (select all that apply)</Text>
          
          <View style={styles.goalsWrapper}>
            {goalsData.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  selectedGoals.includes(goal.id) && styles.selectedGoalCard,
                  { borderLeftColor: goal.color, borderLeftWidth: 5 }
                ]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.8}
              >
                <View style={styles.goalTextContainer}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                </View>
                
                {selectedGoals.includes(goal.id) && (
                  <View style={[styles.checkmark, { backgroundColor: goal.color }]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={[styles.button, selectedGoals.length === 0 && styles.buttonDisabled]}
            disabled={selectedGoals.length === 0}
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
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  // Removed header styles
  // Removed mascot image styles
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
    marginBottom: 24,
    textAlign: 'center',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
    alignItems: 'center',
  },
  goalsWrapper: {
    width: '90%',
  },
  goalCard: {
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
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  selectedGoalCard: {
    borderColor: designColors.blue,
    shadowColor: designColors.blue,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  // Removed icon container styles
  goalTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: designColors.deepNavy,
    textAlign: 'center',
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
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Removed footer styles
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
