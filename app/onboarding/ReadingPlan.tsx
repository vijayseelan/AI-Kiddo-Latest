export const options = { headerShown: false };
import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Pressable, 
  Animated, 
  Dimensions,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingContainer from '../../components/OnboardingContainer';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
// Colors from design.md
const designColors = {
  sunflower: '#ffb703',
  orange: '#fb8500',
  blue: '#219ebc',
  skyBlue: '#8ecae6',
  deepNavy: '#023047'
};
import { useOnboarding } from '../../context/OnboardingContext';

const { width } = Dimensions.get('window');

export default function ReadingPlan() {
  const router = useRouter();
  const { onboardingData } = useOnboarding();
  const childName = onboardingData.childName;
  const readingLevel = onboardingData.readingLevel;
  
  // State for saving data
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    // Animate content
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
    ]).start();
  }, []);

  const handleBack = () => {
    router.back(); // Return to previous screen
  };

  const handleContinue = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: onboardingData.parentEmail,
        password: onboardingData.parentPassword,
        options: {
          data: {
            full_name: onboardingData.parentName,
          }
        }
      });
      
      if (authError) throw new Error(`Authentication error: ${authError.message}`);
      if (!authData?.user?.id) throw new Error('No user ID returned from authentication');
      
      // 2. Create parent record using the auth user ID
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .insert({
          id: authData.user.id, // Use the auth user ID as the parent ID
          name: onboardingData.parentName,
          email: onboardingData.parentEmail,
          password_hash: 'hashed_in_auth' // We don't store actual passwords in this table
        })
        .select('id')
        .single();
      
      if (parentError) throw new Error(`Parent creation error: ${parentError.message}`);
      
      // 3. Create child record
      const { data: childData, error: childError } = await supabase
        .from('children')
        .insert({
          parent_id: parentData.id,
          name: onboardingData.childName,
          age: parseInt(onboardingData.childAge),
          avatar: onboardingData.selectedAvatar,
          reading_level: onboardingData.readingLevel,
          is_active: true
        })
        .select('id')
        .single();
      
      if (childError) throw new Error(`Child creation error: ${childError.message}`);
      
      // 4. Save onboarding profile data
      const { error: profileError } = await supabase
        .from('onboarding_profiles')
        .insert({
          parent_id: parentData.id,
          child_id: childData.id,
          parent_name: onboardingData.parentName,
          parent_email: onboardingData.parentEmail,
          parent_password: onboardingData.parentPassword, // In a real app, you'd never store raw passwords
          child_name: onboardingData.childName,
          child_age: parseInt(onboardingData.childAge),
          selected_avatar: onboardingData.selectedAvatar,
          reading_level: onboardingData.readingLevel,
          goals: onboardingData.goals,
          assessment_results: onboardingData.assessmentResults
        });
      
      if (profileError) throw new Error(`Profile creation error: ${profileError.message}`);
      
      // 5. If assessment results exist, save them
      if (onboardingData.assessmentResults) {
        const { error: assessmentError } = await supabase
          .from('assessments')
          .insert({
            child_id: childData.id,
            type: 'onboarding',
            score: onboardingData.assessmentResults.overallAccuracy,
            details: onboardingData.assessmentResults
          });
        
        if (assessmentError) throw new Error(`Assessment creation error: ${assessmentError.message}`);
      }
      
      // Success! Navigate to the main app
      setIsSaving(false);
      router.replace('/');
      
    } catch (err: any) {
      setIsSaving(false);
      setError(err.message);
      Alert.alert('Error', `Failed to save your data: ${err.message}. Please try again.`);
      console.error('Error saving onboarding data:', err);
    }
  };
  
  // Get recommended reading content based on reading level
  const getRecommendedContent = () => {
    if (readingLevel === 'Advanced') {
      return [
        { title: 'Short Stories', description: 'Interactive stories with comprehension questions', level: 'Level 4', image: '📝' },
        { title: 'Challenging Passages', description: 'Complex paragraphs with rich vocabulary', level: 'Level 4', image: '📄' },
        { title: 'AI-Generated Content', description: 'Personalized content based on interests', level: 'Level 4', image: '🤖' },
      ];
    } else if (readingLevel === 'Intermediate') {
      return [
        { title: 'Sentence Practice', description: 'Complete sentences with varied structure', level: 'Level 3', image: '📝' },
        { title: 'Short Paragraphs', description: 'Brief passages on interesting topics', level: 'Level 3', image: '📄' },
        { title: 'Voice-Guided Reading', description: 'Audio support for challenging words', level: 'Level 3', image: '🔊' },
      ];
    } else {
      return [
        { title: 'Word Recognition', description: 'Practice with common sight words', level: 'Level 1-2', image: '🔤' },
        { title: 'Simple Sentences', description: 'Basic sentences with familiar words', level: 'Level 1-2', image: '📝' },
        { title: 'Picture-Word Association', description: 'Words with supporting images', level: 'Level 1-2', image: '🖼️' },
      ];
    }
  };
  
  // Get activities based on reading level
  const getActivities = () => {
    if (readingLevel === 'Advanced') {
      return [
        { title: 'Pronunciation Practice', description: 'Perfect your speech with AI feedback', icon: '🎤' },
        { title: 'Reading Comprehension', description: 'Answer questions about passages', icon: '❓' },
        { title: 'AI Content Creation', description: 'Generate custom reading material', icon: '🤖' },
      ];
    } else if (readingLevel === 'Intermediate') {
      return [
        { title: 'Fluency Training', description: 'Improve reading speed and rhythm', icon: '⏱️' },
        { title: 'Word Recognition', description: 'Practice with common vocabulary', icon: '🔍' },
        { title: 'Voice Recording', description: 'Record and review your reading', icon: '🎙️' },
      ];
    } else {
      return [
        { title: 'Letter Sounds', description: 'Learn phonics with audio guidance', icon: '🔊' },
        { title: 'Simple Words', description: 'Practice basic vocabulary', icon: '🔤' },
        { title: 'Visual Aids', description: 'Words with supporting images', icon: '🖼️' },
      ];
    }
  };
  
  // Get weekly goals based on reading level
  const getWeeklyGoals = () => {
    if (readingLevel === 'Advanced') {
      return [
        { day: 'Mon-Wed', activity: 'Practice 20 mins', icon: '⏱️' },
        { day: 'Thu-Fri', activity: 'Passage Reading', icon: '📄' },
        { day: 'Weekend', activity: 'AI Content', icon: '🤖' },
      ];
    } else if (readingLevel === 'Intermediate') {
      return [
        { day: 'Mon-Wed', activity: 'Practice 15 mins', icon: '⏱️' },
        { day: 'Thu-Fri', activity: 'Sentence Reading', icon: '📝' },
        { day: 'Weekend', activity: 'Voice Recording', icon: '🎙️' },
      ];
    } else {
      return [
        { day: 'Mon-Wed', activity: 'Practice 10 mins', icon: '⏱️' },
        { day: 'Thu-Fri', activity: 'Word Practice', icon: '🔤' },
        { day: 'Weekend', activity: 'Picture-Word Games', icon: '🖼️' },
      ];
    }
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
                i === 11 ? styles.activeDot : i < 11 ? styles.completedDot : {}
              ]}
            />
          ))}
        </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View 
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.title}>{childName}'s Reading Plan</Text>
            <Text style={styles.subtitle}>Personalized for {readingLevel} readers</Text>
            
            <View style={styles.planCard}>
              <View style={styles.planHeader}>
                <View style={styles.planIconContainer}>
                  <Text style={styles.planIcon}>📚</Text>
                </View>
                <Text style={styles.planTitle}>Weekly Reading Schedule</Text>
              </View>
              
              <View style={styles.scheduleContainer}>
                {getWeeklyGoals().map((goal, index) => (
                  <View key={index} style={styles.scheduleItem}>
                    <View style={styles.scheduleDay}>
                      <Text style={styles.scheduleDayText}>{goal.day}</Text>
                    </View>
                    <View style={styles.scheduleActivity}>
                      <Text style={styles.scheduleActivityIcon}>{goal.icon}</Text>
                      <Text style={styles.scheduleActivityText}>{goal.activity}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.planCard}>
              <View style={styles.planHeader}>
                <View style={styles.planIconContainer}>
                  <Text style={styles.planIcon}>🎯</Text>
                </View>
                <Text style={styles.planTitle}>Recommended Activities</Text>
              </View>
              
              <View style={styles.activitiesContainer}>
                {getActivities().map((activity, index) => (
                  <View key={index} style={styles.activityItem}>
                    <View style={styles.activityIconContainer}>
                      <Text style={styles.activityIcon}>{activity.icon}</Text>
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityDescription}>{activity.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.planCard}>
              <View style={styles.planHeader}>
                <View style={styles.planIconContainer}>
                  <Text style={styles.planIcon}>📱</Text>
                </View>
                <Text style={styles.planTitle}>In-App Reading Content</Text>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.contentScrollContainer}
              >
                {getRecommendedContent().map((content, index) => (
                  <View key={index} style={styles.contentItem}>
                    <View style={styles.contentIcon}>
                      <Text style={styles.contentIconText}>{content.image}</Text>
                    </View>
                    <Text style={styles.contentTitle}>{content.title}</Text>
                    <Text style={styles.contentDescription}>{content.description}</Text>
                    <View style={styles.contentLevelBadge}>
                      <Text style={styles.contentLevelText}>{content.level}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.mascotContainer}>
              <View style={styles.speechBubble}>
                <Text style={styles.speechText}>
                  I'll guide {childName} through daily practice with AI-powered feedback!
                </Text>
              </View>
              <View style={styles.emojiMascot}>
                <Text style={styles.emojiText}>🐼</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.button, isSaving && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={isSaving}
            >
              {isSaving ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={[styles.buttonText, { marginLeft: 10 }]}>Saving...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Start Your Journey</Text>
              )}
            </TouchableOpacity>
            
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
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
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 28,
    padding: 25,
    width: '100%',
    // Claymorphism
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  planIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: designColors.skyBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  planIcon: {
    fontSize: 24,
  },
  planTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: designColors.deepNavy,
  },
  scheduleContainer: {
    marginTop: 15,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  scheduleDay: {
    backgroundColor: designColors.skyBlue,
    paddingVertical: 14,
    paddingHorizontal: 15,
    width: 110,
    alignItems: 'center',
  },
  scheduleDayText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: '#ffffff',
  },
  scheduleActivity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 18,
  },
  scheduleActivityIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  scheduleActivityText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: designColors.deepNavy,
  },
  activitiesContainer: {
    marginTop: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: `${designColors.blue}10`,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  activityIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: designColors.orange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  activityIcon: {
    fontSize: 24,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    color: designColors.deepNavy,
    marginBottom: 4,
  },
  activityDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: designColors.blue,
  },
  contentScrollContainer: {
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  contentItem: {
    width: 170,
    marginRight: 18,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 16,
    // Claymorphism
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  contentIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: designColors.sunflower,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  contentIconText: {
    fontSize: 32,
  },
  contentTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: designColors.deepNavy,
    textAlign: 'center',
    marginBottom: 6,
  },
  contentDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: designColors.blue,
    textAlign: 'center',
    marginBottom: 10,
    height: 55,
  },
  contentLevelBadge: {
    backgroundColor: designColors.skyBlue,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  contentLevelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#ffffff',
  },
  mascotContainer: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  speechBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 18,
    maxWidth: '85%',
    // Claymorphism
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  speechText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: designColors.deepNavy,
    textAlign: 'center',
    lineHeight: 22,
  },
  emojiMascot: {
    width: 70,
    height: 70,
    backgroundColor: designColors.skyBlue,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    // Claymorphism
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  emojiText: {
    fontSize: 36,
  },
  button: {
    backgroundColor: designColors.sunflower,
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    marginTop: 'auto',
    marginBottom: 20,
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
  buttonDisabled: {
    backgroundColor: designColors.sunflower,
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
});
