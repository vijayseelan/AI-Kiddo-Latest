export const options = { headerShown: false };
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Animated, Pressable } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingContainer from '../../components/OnboardingContainer';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
// Colors from design.md
const designColors = {
  sunflower: '#ffb703',
  orange: '#fb8500',
  blue: '#219ebc',
  skyBlue: '#8ecae6',
  deepNavy: '#023047'
};
import Svg, { Polygon, Circle, Line, Text as SvgText, Path, G, Rect } from 'react-native-svg';
import { useOnboarding } from '../../context/OnboardingContext';

const { width } = Dimensions.get('window');

type AssessmentResults = {
  words: Array<{
    word: string;
    accuracy: number;
    isCorrect: boolean;
    suggestion?: string;
  }>;
  overallAccuracy: number;
  fluency: number;
  completeness: number;
};

export default function Analytics() {
  const router = useRouter();
  const { onboardingData } = useOnboarding();
  
  // Get assessment results from context
  const accuracy = onboardingData.assessmentResults?.overallAccuracy || 0;
  const fluency = onboardingData.assessmentResults?.fluency || 0;
  const completeness = onboardingData.assessmentResults?.completeness || 0;
  const pronunciation = onboardingData.assessmentResults?.pronunciation || 0;
  const prosody = onboardingData.assessmentResults?.prosody || 0;
  
  // Determine reading level based on assessment results
  const [readingLevel, setReadingLevel] = useState<string>('');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Get child name from context
  const childName = onboardingData.childName;
  
  useEffect(() => {
    // Determine reading level based on assessment results
    const averageScore = (accuracy + fluency + completeness) / 3;
    
    if (averageScore >= 90) {
      setReadingLevel('Advanced');
    } else if (averageScore >= 75) {
      setReadingLevel('Intermediate');
    } else {
      setReadingLevel('Beginner');
    }
    
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
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);
  
  const handleBack = () => {
    router.back(); // Return to previous screen
  };

  const handleContinue = () => {
    // Navigate to next onboarding screen (Reading Plan)
    router.push('/onboarding/ReadingPlan');
  };
  
  // Calculate reading age based on assessment results
  const calculateReadingAge = () => {
    if (!onboardingData.assessmentResults) return '5-6';
    
    const averageScore = (accuracy + fluency + completeness) / 3;
    
    if (averageScore >= 90) {
      return '7-8';
    } else if (averageScore >= 75) {
      return '6-7';
    } else {
      return '5-6';
    }
  };
  
  // Calculate reading percentile
  const calculatePercentile = () => {
    if (!onboardingData.assessmentResults) return 65;
    
    const averageScore = (accuracy + fluency + completeness) / 3;
    
    // Simple conversion from score to percentile
    return Math.min(99, Math.round(averageScore + 5));
  };
  
  // Generate strengths and areas for improvement based on assessment results
  const getStrengths = () => {
    if (!onboardingData.assessmentResults) return ['Word recognition', 'Letter sounds'];
    
    const strengths = [];
    
    if (accuracy >= 85) strengths.push('Word recognition');
    if (fluency >= 85) strengths.push('Reading fluency');
    if (completeness >= 85) strengths.push('Sentence clarity');
    
    // Add default strengths if none are identified
    if (strengths.length === 0) {
      strengths.push('Enthusiasm for reading');
      strengths.push('Letter recognition');
    }
    
    return strengths;
  };
  
  const getAreasForImprovement = () => {
    if (!onboardingData.assessmentResults) return ['Reading fluency', 'Vocabulary'];
    
    const areas = [];
    
    if (accuracy < 85) areas.push('Word recognition');
    if (fluency < 85) areas.push('Reading fluency');
    if (completeness < 85) areas.push('Sentence clarity');
    
    // Add default areas if none are identified
    if (areas.length === 0) {
      areas.push('Complex vocabulary');
      areas.push('Reading comprehension');
    }
    
    return areas;
  };
  
  // Render radar chart for skills visualization
  const renderSkillsRadar = () => {
    if (!onboardingData.assessmentResults) return null;
    
    const centerX = 100;
    const centerY = 100;
    const radius = 70;
    
    // Normalize scores to radius scale
    const accuracyScore = (accuracy / 100) * radius;
    const fluencyScore = (fluency / 100) * radius;
    const completenessScore = (completeness / 100) * radius;
    const vocabularyScore = (Math.min(accuracy, 95) / 100) * radius;
    const comprehensionScore = ((fluency + completeness) / 200) * radius;
    
    // Calculate points on the pentagon
    const angle = (2 * Math.PI) / 5;
    const points = [
      { x: centerX + accuracyScore * Math.cos(0), y: centerY + accuracyScore * Math.sin(0) },
      { x: centerX + fluencyScore * Math.cos(angle), y: centerY + fluencyScore * Math.sin(angle) },
      { x: centerX + completenessScore * Math.cos(2 * angle), y: centerY + completenessScore * Math.sin(2 * angle) },
      { x: centerX + vocabularyScore * Math.cos(3 * angle), y: centerY + vocabularyScore * Math.sin(3 * angle) },
      { x: centerX + comprehensionScore * Math.cos(4 * angle), y: centerY + comprehensionScore * Math.sin(4 * angle) },
    ];
    
    // Create path for the radar chart
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    path += ' Z';
    
    // Create paths for the background circles
    const createCirclePath = (r: number) => {
      const circlePoints = [];
      for (let i = 0; i < 5; i++) {
        circlePoints.push({
          x: centerX + r * Math.cos(i * angle),
          y: centerY + r * Math.sin(i * angle)
        });
      }
      
      let circlePath = `M ${circlePoints[0].x} ${circlePoints[0].y}`;
      for (let i = 1; i < circlePoints.length; i++) {
        circlePath += ` L ${circlePoints[i].x} ${circlePoints[i].y}`;
      }
      circlePath += ' Z';
      
      return circlePath;
    };
    
    return (
      <Svg width={200} height={200} viewBox="0 0 200 200">
        {/* Background circles */}
        <Circle cx={centerX} cy={centerY} r={radius * 0.25} fill="none" stroke="#eee" strokeWidth="1" />
        <Circle cx={centerX} cy={centerY} r={radius * 0.5} fill="none" stroke="#eee" strokeWidth="1" />
        <Circle cx={centerX} cy={centerY} r={radius * 0.75} fill="none" stroke="#eee" strokeWidth="1" />
        <Circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#eee" strokeWidth="1" />
        
        {/* Axis lines */}
        <Line x1={centerX} y1={centerY} x2={centerX + radius * Math.cos(0)} y2={centerY + radius * Math.sin(0)} stroke="#ddd" strokeWidth="1" />
        <Line x1={centerX} y1={centerY} x2={centerX + radius * Math.cos(angle)} y2={centerY + radius * Math.sin(angle)} stroke="#ddd" strokeWidth="1" />
        <Line x1={centerX} y1={centerY} x2={centerX + radius * Math.cos(2 * angle)} y2={centerY + radius * Math.sin(2 * angle)} stroke="#ddd" strokeWidth="1" />
        <Line x1={centerX} y1={centerY} x2={centerX + radius * Math.cos(3 * angle)} y2={centerY + radius * Math.sin(3 * angle)} stroke="#ddd" strokeWidth="1" />
        <Line x1={centerX} y1={centerY} x2={centerX + radius * Math.cos(4 * angle)} y2={centerY + radius * Math.sin(4 * angle)} stroke="#ddd" strokeWidth="1" />
        
        {/* Data polygon */}
        <Polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} fill={`${designColors.blue}40`} stroke={designColors.blue} strokeWidth="2" />
        
        {/* Data points */}
        {points.map((point, index) => (
          <Circle key={index} cx={point.x} cy={point.y} r="4" fill={designColors.blue} />
        ))}
        
        {/* Labels */}
        <SvgText x={centerX + (radius + 15) * Math.cos(0)} y={centerY + (radius + 15) * Math.sin(0)} fontSize="10" fill="#666" textAnchor="middle">Accuracy</SvgText>
        <SvgText x={centerX + (radius + 20) * Math.cos(angle)} y={centerY + (radius + 20) * Math.sin(angle)} fontSize="10" fill="#666" textAnchor="middle">Fluency</SvgText>
        <SvgText x={centerX + (radius + 20) * Math.cos(2 * angle)} y={centerY + (radius + 20) * Math.sin(2 * angle)} fontSize="10" fill="#666" textAnchor="middle">Clarity</SvgText>
        <SvgText x={centerX + (radius + 20) * Math.cos(3 * angle)} y={centerY + (radius + 20) * Math.sin(3 * angle)} fontSize="10" fill="#666" textAnchor="middle">Vocabulary</SvgText>
        <SvgText x={centerX + (radius + 20) * Math.cos(4 * angle)} y={centerY + (radius + 20) * Math.sin(4 * angle)} fontSize="10" fill="#666" textAnchor="middle">Comprehension</SvgText>
      </Svg>
    );
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
                i === 10 ? styles.activeDot : i < 10 ? styles.completedDot : {}
              ]}
            />
          ))}
        </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          <View 
            style={[
              styles.contentContainer
            ]}
          >
            <Text style={styles.title}>{onboardingData.childName}'s Reading Analysis</Text>
            <Text style={styles.subtitle}>Here's what we learned from the assessment</Text>
            
            <View style={styles.summaryCard}>
              <View style={styles.readingLevelContainer}>
                <Text style={styles.readingLevelLabel}>Reading Level</Text>
                <View 
                  style={[
                    styles.readingLevelBadge,
                    { 
                      backgroundColor: 
                        readingLevel === 'Advanced' ? `${designColors.blue}30` :
                        readingLevel === 'Intermediate' ? `${designColors.orange}30` :
                        `${designColors.sunflower}30`,
                      borderColor:
                        readingLevel === 'Advanced' ? designColors.blue :
                        readingLevel === 'Intermediate' ? designColors.orange :
                        designColors.sunflower,
                    }
                  ]}
                >
                  <Text 
                    style={[
                      styles.readingLevelText,
                      {
                        color:
                          readingLevel === 'Advanced' ? designColors.blue :
                          readingLevel === 'Intermediate' ? designColors.orange :
                          designColors.sunflower,
                      }
                    ]}
                  >
                    {readingLevel}
                  </Text>
                </View>
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{calculateReadingAge()}</Text>
                  <Text style={styles.statLabel}>Reading Age</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{calculatePercentile()}<Text style={styles.statSuperscript}>th</Text></Text>
                  <Text style={styles.statLabel}>Percentile</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.skillsCard}>
              <Text style={styles.cardTitle}>Reading Skills</Text>
              <View style={styles.skillsRadarContainer}>
                {renderSkillsRadar()}
              </View>
            </View>
            
            <View style={styles.strengthsCard}>
              <Text style={styles.cardTitle}>Strengths</Text>
              {getStrengths().map((strength, index) => (
                <View key={index} style={styles.strengthItem}>
                  <View style={styles.strengthIcon}>
                    <Text style={styles.strengthIconText}>✓</Text>
                  </View>
                  <Text style={styles.strengthText}>{strength}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.improvementCard}>
              <Text style={styles.cardTitle}>Areas for Growth</Text>
              {getAreasForImprovement().map((area, index) => (
                <View key={index} style={styles.improvementItem}>
                  <View style={styles.improvementIcon}>
                    <Text style={styles.improvementIconText}>↗</Text>
                  </View>
                  <Text style={styles.improvementText}>{area}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.nextStepsCard}>
              <Text style={styles.cardTitle}>Next Steps</Text>
              <Text style={styles.nextStepsText}>
                Based on {childName}'s assessment, we'll create a personalized reading plan
                with stories and activities at the right level to help improve their skills.
              </Text>
              <View style={styles.mascotContainer}>
                <View style={styles.emojiMascot}>
                  <Text style={styles.emojiText}>🐼</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.button}
              onPress={handleContinue}
            >
              <Text style={styles.buttonText}>See Reading Plan</Text>
            </TouchableOpacity>
          </View>
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
  summaryCard: {
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
  readingLevelContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  readingLevelLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: designColors.deepNavy,
    marginBottom: 8,
  },
  readingLevelBadge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  readingLevelText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: designColors.blue,
    marginBottom: 4,
  },
  statSuperscript: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: designColors.blue,
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#eee',
  },
  skillsCard: {
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
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  cardTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: designColors.deepNavy,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  skillsRadarContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  strengthsCard: {
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
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: `${designColors.blue}15`,
    borderRadius: 16,
    padding: 12,
  },
  strengthIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: designColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  strengthIconText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  strengthText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: designColors.deepNavy,
    flex: 1,
  },
  improvementCard: {
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
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: `${designColors.sunflower}15`,
    borderRadius: 16,
    padding: 12,
  },
  improvementIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: designColors.sunflower,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  improvementIconText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  improvementText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: designColors.deepNavy,
    flex: 1,
  },
  nextStepsCard: {
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
  nextStepsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: designColors.deepNavy,
    lineHeight: 24,
    marginBottom: 20,
  },
  mascotContainer: {
    alignItems: 'center',
    marginVertical: 15,
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
});
