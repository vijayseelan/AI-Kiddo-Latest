import React, { useState, useEffect, useRef } from "react";
import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  Pressable, 
  Image, 
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform
} from "react-native";
import { useRouter } from "expo-router";
import { Mic, Volume2, ArrowRight, Check, ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useUserStore } from "@/store/user-store";
import { assessmentTexts } from "@/mocks/books";
import Button from "@/components/Button";
import MascotGuide from "@/components/MascotGuide";
import { assessReading, determineReadingLevel } from "@/services/pronunciation";

const { width } = Dimensions.get('window');

enum AssessmentStep {
  INTRO,
  WORD_RECOGNITION,
  READING_ALOUD,
  PROCESSING,
  RESULTS
}

export default function AssessmentScreen() {
  const router = useRouter();
  const { activeChild, activeChildId, saveAssessmentResult } = useUserStore();
  
  const [currentStep, setCurrentStep] = useState<AssessmentStep>(AssessmentStep.INTRO);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wordResults, setWordResults] = useState<Record<string, boolean>>({});
  const [readingResults, setReadingResults] = useState<any>(null);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [showMascot, setShowMascot] = useState(true);
  const [progressWidth, setProgressWidth] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  const levels = [
    assessmentTexts.level1,
    assessmentTexts.level2,
    assessmentTexts.level3
  ];
  
  useEffect(() => {
    // Show mascot guide on first load
    const timer = setTimeout(() => {
      setShowMascot(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle step transitions with animations
  const transitionToStep = (nextStep: AssessmentStep) => {
    // Fade out current content
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Change step
      setCurrentStep(nextStep);
      
      // Reset slide position
      slideAnim.setValue(width * 0.2);
      
      // Fade in new content with slide
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start();
    });
  };
  
  const handlePronounce = (text: string) => {
    // In a real app, this would use text-to-speech
    console.log(`Pronouncing: ${text}`);
    // Mock implementation
    alert(`Pronouncing: ${text}`);
  };
  
  const handleWordRecognition = (word: string) => {
    // Mark word as recognized
    setWordResults(prev => ({
      ...prev,
      [word]: true
    }));
    
    // Check if all words are recognized
    const allWords = levels[currentLevel].words;
    const updatedResults = {
      ...wordResults,
      [word]: true
    };
    
    if (allWords.every(w => updatedResults[w])) {
      // Move to next step after a short delay
      setTimeout(() => {
        transitionToStep(AssessmentStep.READING_ALOUD);
      }, 1000);
    }
  };
  
  const handleRecordReading = () => {
    setIsRecording(true);
    
    // Simulate recording for 5 seconds
    setTimeout(() => {
      setIsRecording(false);
      setIsProcessing(true);
      
      // Transition to processing screen
      transitionToStep(AssessmentStep.PROCESSING);
      
      // Process the recording
      setTimeout(() => {
        // Simulate API call
        assessReading(levels[currentLevel].text, null).then(result => {
          setReadingResults(result);
          
          // Determine reading level
          const readingLevel = determineReadingLevel(
            result.accuracy,
            result.fluency,
            result.completeness
          );
          
          // Prepare final result
          const finalResult = {
            readingLevel,
            pronunciationAccuracy: result.accuracy,
            wordRecognitionRate: Object.values(wordResults).filter(Boolean).length / levels[currentLevel].words.length * 100,
            fluencyScore: result.fluency,
            recommendedBooks: []
          };
          
          setFinalResult(finalResult);
          
          // Save assessment result
          if (activeChildId) {
            saveAssessmentResult(activeChildId, finalResult);
          }
          
          // Navigate to results screen
          router.push('/assessment-results');
        });
      }, 8000); // Simulate longer processing time
    }, 5000);
  };
  
  const handleComplete = () => {
    router.replace("/(tabs)");
  };
  
  const handleContinueToResults = () => {
    router.push('/assessment-results');
  };
  
  // Start the progress animation for processing step
  useEffect(() => {
    if (currentStep === AssessmentStep.PROCESSING) {
      // Use state-based animation for progress width
      const interval = setInterval(() => {
        setProgressWidth(prev => {
          const newWidth = prev + 1.25; // Increase by 1.25% each time
          return newWidth <= 100 ? newWidth : 100;
        });
      }, 100);
      
      // Also start a rotation animation
      Animated.loop(
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
      
      return () => clearInterval(interval);
    }
  }, [currentStep]);
  
  const renderIntroStep = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }]
        }
      ]}
    >
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1560807707-8cc77767d783" }}
        style={styles.mascotImage}
      />
      
      <Text style={styles.stepTitle}>Let's Assess Your Reading Level</Text>
      
      <Text style={styles.stepDescription}>
        This quick assessment will help us personalize your reading experience.
        You'll need to:
      </Text>
      
      <View style={styles.instructionItem}>
        <Check size={20} color={colors.primary} />
        <Text style={styles.instructionText}>
          Recognize and pronounce some words
        </Text>
      </View>
      
      <View style={styles.instructionItem}>
        <Check size={20} color={colors.primary} />
        <Text style={styles.instructionText}>
          Read a short passage out loud
        </Text>
      </View>
      
      <View style={styles.instructionItem}>
        <Check size={20} color={colors.primary} />
        <Text style={styles.instructionText}>
          Get your personalized reading level
        </Text>
      </View>
      
      <Button
        title="Start Assessment"
        onPress={() => transitionToStep(AssessmentStep.WORD_RECOGNITION)}
        icon={<ArrowRight size={18} color="white" />}
        style={styles.actionButton}
        animated
      />
    </Animated.View>
  );
  
  const renderWordRecognitionStep = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }]
        }
      ]}
    >
      <Text style={styles.stepTitle}>Word Recognition</Text>
      
      <Text style={styles.stepDescription}>
        Tap each word to hear it, then tap the microphone to pronounce it yourself.
      </Text>
      
      <View style={styles.wordsContainer}>
        {levels[currentLevel].words.map((word) => (
          <View 
            key={word} 
            style={[
              styles.wordCard,
              wordResults[word] && styles.completedWordCard
            ]}
          >
            <Text style={styles.wordText}>{word}</Text>
            
            <View style={styles.wordActions}>
              <Pressable
                style={styles.pronounceButton}
                onPress={() => handlePronounce(word)}
              >
                <Volume2 size={20} color={colors.primary} />
              </Pressable>
              
              {wordResults[word] ? (
                <View style={styles.completedBadge}>
                  <Check size={18} color="white" />
                </View>
              ) : (
                <Pressable
                  style={styles.recordButton}
                  onPress={() => handleWordRecognition(word)}
                >
                  <Mic size={18} color="white" />
                </Pressable>
              )}
            </View>
          </View>
        ))}
      </View>
      
      <Button
        title="Skip to Reading Aloud"
        variant="outline"
        onPress={() => transitionToStep(AssessmentStep.READING_ALOUD)}
        style={styles.skipButton}
      />
    </Animated.View>
  );
  
  const renderReadingAloudStep = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }]
        }
      ]}
    >
      <Text style={styles.stepTitle}>Reading Aloud</Text>
      
      <Text style={styles.stepDescription}>
        Read the following passage out loud. Tap the microphone when you're ready to start.
      </Text>
      
      <View style={styles.passageCard}>
        <Text style={styles.passageText}>{levels[currentLevel].text}</Text>
        
        <Pressable
          style={styles.pronouncePassageButton}
          onPress={() => handlePronounce(levels[currentLevel].text)}
        >
          <Volume2 size={20} color={colors.primary} />
          <Text style={styles.pronouncePassageText}>Hear Passage</Text>
        </Pressable>
      </View>
      
      {isProcessing ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.processingText}>Analyzing your reading...</Text>
        </View>
      ) : (
        <Button
          title={isRecording ? "Recording..." : "Start Reading"}
          icon={<Mic size={18} color="white" />}
          onPress={handleRecordReading}
          disabled={isRecording}
          style={styles.actionButton}
        />
      )}
    </Animated.View>
  );
  
  const renderProcessingStep = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }]
        }
      ]}
    >
      <Text style={styles.stepTitle}>Analyzing Your Reading</Text>
      
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.processingCircle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={{
            transform: [{
              rotate: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              })
            }]
          }}
        >
          <Mic size={40} color="white" />
        </Animated.View>
      </LinearGradient>
      
      <Text style={styles.processingText}>
        Please wait while we analyze your reading patterns...
      </Text>
      
      <View style={styles.progressBarContainer}>
        {/* Using a non-animated View with state-controlled width */}
        <View 
          style={StyleSheet.compose(styles.progressBar, { width: `${progressWidth}%` } as ViewStyle)}
        />
      </View>
      
      <Button
        title="Continue to Results"
        onPress={handleContinueToResults}
        style={styles.actionButton}
        icon={<ChevronRight size={18} color="white" />}
      />
    </Animated.View>
  );
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case AssessmentStep.INTRO:
        return renderIntroStep();
      case AssessmentStep.WORD_RECOGNITION:
        return renderWordRecognitionStep();
      case AssessmentStep.READING_ALOUD:
        return renderReadingAloudStep();
      case AssessmentStep.PROCESSING:
        return renderProcessingStep();
      default:
        return renderIntroStep();
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f5f7fa']}
        style={styles.gradientBackground}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentStep()}
        </ScrollView>
        
        {showMascot && (
          <MascotGuide
            message="Hi there! I'm your reading buddy. Let's find out your reading level so I can help you improve!"
            duration={5000}
            onDismiss={() => setShowMascot(false)}
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

interface StylesType {
  // Base styles
  container: ViewStyle;
  gradientBackground: ViewStyle;
  scrollContent: ViewStyle;
  stepContainer: ViewStyle;
  mascotImage: ImageStyle;
  stepTitle: TextStyle;
  stepDescription: TextStyle;
  instructionItem: ViewStyle;
  instructionText: TextStyle;
  actionButton: ViewStyle;
  
  // Word recognition styles
  wordsContainer: ViewStyle;
  wordCard: ViewStyle;
  completedWordCard: ViewStyle;
  wordText: TextStyle;
  wordActions: ViewStyle;
  pronounceButton: ViewStyle;
  recordButton: ViewStyle;
  completedBadge: ViewStyle;
  
  // Reading passage styles
  passageCard: ViewStyle;
  passageText: TextStyle;
  pronouncePassageButton: ViewStyle;
  pronouncePassageText: TextStyle;
  
  // Processing styles
  processingContainer: ViewStyle;
  processingText: TextStyle;
  processingCircle: ViewStyle;
  
  // Progress styles
  progressBarContainer: ViewStyle;
  progressBar: ViewStyle;
  
  // Navigation
  skipButton: ViewStyle;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.blue, // Using our brand color
  },
  gradientBackground: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  mascotImage: {
    width: 120,
    height: 120,
    borderRadius: 40, // Following our design system
    marginBottom: spacing.xl,
    // Claymorphic shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    ...(Platform.OS === 'android' ? { elevation: 8 } : {}),
  },
  stepTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  stepDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  instructionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  actionButton: {
    marginTop: spacing.xl,
  },
  wordsContainer: {
    width: '100%',
  },
  wordCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24, 
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#1982c4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    ...(Platform.OS === 'android' ? { elevation: 8 } : {}),
  },
  wordText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: colors.purple,
  },
  wordActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  pronounceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recordButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    ...(Platform.OS === 'android' ? { elevation: 4 } : {}),
  },
  completedWordCard: {
    backgroundColor: colors.green,
    shadowColor: '#fff',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  passageCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: spacing.xl,
    marginVertical: spacing.lg,
    shadowColor: '#1982c4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    ...(Platform.OS === 'android' ? { elevation: 8 } : {}),
  },
  passageText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    lineHeight: 28,
    color: colors.purple,
    marginBottom: spacing.md,
  },
  pronouncePassageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.yellow,
    borderRadius: 20,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    ...(Platform.OS === 'android' ? { elevation: 4 } : {}),
  },
  pronouncePassageText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.purple,
    marginLeft: spacing.xs,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  processingText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  processingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    ...(Platform.OS === 'android' ? { elevation: 8 } : {}),
  },
  progressBarContainer: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: spacing.xl,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.green,
    borderRadius: 6,
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  completedBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success,
    justifyContent: "center",
    alignItems: "center",
  },
});