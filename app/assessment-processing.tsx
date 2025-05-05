import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Sparkles, BookOpen, CheckCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import Button from '@/components/Button';
import { useUserStore } from '@/store/user-store';

const { width } = Dimensions.get('window');

const processingSteps = [
  {
    id: 1,
    title: 'Analyzing pronunciation patterns',
    icon: <Sparkles size={24} color={colors.primary} />,
    duration: 2000,
  },
  {
    id: 2,
    title: 'Evaluating reading fluency',
    icon: <BookOpen size={24} color={colors.secondary} />,
    duration: 2500,
  },
  {
    id: 3,
    title: 'Determining reading level',
    icon: <Brain size={24} color={colors.tertiary} />,
    duration: 3000,
  },
  {
    id: 4,
    title: 'Creating personalized plan',
    icon: <CheckCircle size={24} color={colors.success} />,
    duration: 2000,
  },
];

export default function AssessmentProcessingScreen() {
  const router = useRouter();
  const { activeChildId } = useUserStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const completeFadeAnim = useRef(new Animated.Value(0)).current;
  
  // Spin animation for the processing icon
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  useEffect(() => {
    // Start the spinning animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    
    // Start the progress animation - using state instead of direct width animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 10000, // Total duration for all steps
      useNativeDriver: true, // This is now true since we're not animating width directly
    }).start();
    
    // Update progress width using state
    const progressInterval = setInterval(() => {
      setProgressWidth(prev => {
        const newWidth = prev + 1;
        return newWidth <= 100 ? newWidth : 100;
      });
    }, 100);
    
    // Process each step with delays
    let totalDelay = 0;
    
    processingSteps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);
        
        // If it's the last step, show completion after its duration
        if (index === processingSteps.length - 1) {
          setTimeout(() => {
            // Fade out the processing animation
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }).start();
            
            // Fade in the completion message
            Animated.timing(completeFadeAnim, {
              toValue: 1,
              duration: 800,
              delay: 300,
              useNativeDriver: true,
            }).start();
            
            setProcessingComplete(true);
            clearInterval(progressInterval);
          }, step.duration);
        }
      }, totalDelay);
      
      totalDelay += step.duration;
    });
    
    return () => clearInterval(progressInterval);
  }, []);
  
  const handleViewResults = () => {
    router.push('/assessment-results');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundGradient[0], colors.backgroundGradient[1]]}
        style={styles.gradientBackground}
      >
        <View style={styles.content}>
          <Animated.View 
            style={[
              styles.processingContainer,
              { opacity: fadeAnim }
            ]}
          >
            <Text style={styles.title}>Processing Assessment</Text>
            
            <View style={styles.iconContainer}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.spinnerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Brain size={40} color="white" />
                </LinearGradient>
              </Animated.View>
            </View>
            
            <View style={styles.progressBarContainer}>
              {/* Using a non-animated View with state-controlled width */}
              <View 
                style={[
                  styles.progressBar,
                  { width: `${progressWidth}%` }
                ]}
              />
            </View>
            
            <View style={styles.stepsContainer}>
              {processingSteps.map((step, index) => (
                <View 
                  key={step.id}
                  style={[
                    styles.stepItem,
                    currentStep >= index && styles.activeStep
                  ]}
                >
                  <View style={styles.stepIconContainer}>
                    {step.icon}
                    {currentStep > index && (
                      <View style={styles.stepCompletedOverlay}>
                        <CheckCircle size={16} color="white" />
                      </View>
                    )}
                  </View>
                  <Text 
                    style={[
                      styles.stepText,
                      currentStep >= index && styles.activeStepText
                    ]}
                  >
                    {step.title}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.completeContainer,
              { 
                opacity: completeFadeAnim,
                transform: [
                  { 
                    translateY: completeFadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }) 
                  }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={[colors.success, colors.successLight || '#4ade80']}
              style={styles.completeIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <CheckCircle size={48} color="white" />
            </LinearGradient>
            
            <Text style={styles.completeTitle}>Assessment Complete!</Text>
            <Text style={styles.completeDescription}>
              We've analyzed your reading patterns and created a personalized learning plan.
            </Text>
            
            <Button
              title="View Your Results"
              onPress={handleViewResults}
              variant="primary"
              size="large"
              style={styles.resultsButton}
              animated
            />
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradientBackground: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  processingContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    ...typography.heading.h2,
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.text,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  spinnerGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: colors.card,
    borderRadius: 4,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  stepsContainer: {
    width: '100%',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  activeStep: {
    opacity: 1,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    position: 'relative',
  },
  stepCompletedOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    ...typography.body.medium,
    color: colors.textLight,
  },
  activeStepText: {
    color: colors.text,
    fontWeight: '600',
  },
  completeContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
  },
  completeIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  completeTitle: {
    ...typography.heading.h2,
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.text,
  },
  completeDescription: {
    ...typography.body.medium,
    textAlign: 'center',
    color: colors.textLight,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  resultsButton: {
    marginTop: spacing.md,
    width: width * 0.8,
  },
});