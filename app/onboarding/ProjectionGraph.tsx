export const options = { headerShown: false };
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Animated, Dimensions, ScrollView, StatusBar as RNStatusBar } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingContainer from '../../components/OnboardingContainer';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle, G, Line, Text as SvgText } from 'react-native-svg';
import { useOnboarding } from '../../context/OnboardingContext';

// Colors from design.md
const designColors = {
  sunflower: '#ffb703',
  orange: '#fb8500',
  blue: '#219ebc',
  skyBlue: '#8ecae6',
  deepNavy: '#023047'
};

const { width, height } = Dimensions.get('window');

// Define data point type
type DataPoint = {
  month: number;
  level: number;
};

// Projection data (months and reading level)
const projectionData: DataPoint[] = [
  { month: 0, level: 1.0 },  // Starting point
  { month: 1, level: 1.2 },  // Month 1
  { month: 2, level: 1.5 },  // Month 2
  { month: 3, level: 1.9 },  // Month 3
  { month: 4, level: 2.3 },  // Month 4
  { month: 5, level: 2.8 },  // Month 5
  { month: 6, level: 3.3 },  // Month 6
];

// Traditional progress data (for comparison)
const traditionalData: DataPoint[] = [
  { month: 0, level: 1.0 },  // Starting point
  { month: 1, level: 1.1 },  // Month 1
  { month: 2, level: 1.2 },  // Month 2
  { month: 3, level: 1.4 },  // Month 3
  { month: 4, level: 1.5 },  // Month 4
  { month: 5, level: 1.7 },  // Month 5
  { month: 6, level: 1.9 },  // Month 6
];

export default function ProjectionGraph() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { onboardingData } = useOnboarding();
  const childName = onboardingData.childName || "Your Child"; // Fallback name

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    // Fade in and slide up animation
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
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleBack = () => {
    router.back(); // Return to Affirmation1 screen
  };

  const handleContinue = () => {
    // Navigate to next onboarding screen (AssessmentIntro)
    router.push({
      pathname: '/onboarding/AssessmentIntro',
      params
    });
  };

  // Graph dimensions
  const graphWidth = width - 60;
  const graphHeight = 220;
  const paddingLeft = 40;
  const paddingBottom = 40;
  const paddingTop = 20;
  const paddingRight = 20;
  
  // Calculate scales
  const xScale = (graphWidth - paddingLeft - paddingRight) / 6; // 6 months
  const yScale = (graphHeight - paddingBottom - paddingTop) / 3.5; // Max level is ~3.5
  
  // Generate path for Reading Panda progress
  const generatePath = (data: DataPoint[], progress: number): string => {
    let path = '';
    const visiblePoints = Math.ceil(data.length * progress);
    
    for (let i = 0; i < visiblePoints; i++) {
      const x = paddingLeft + data[i].month * xScale;
      const y = graphHeight - paddingBottom - data[i].level * yScale;
      
      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }
    
    return path;
  };
  
  // Generate circles for data points
  const renderDataPoints = (data: DataPoint[], color: string, progress: number) => {
    const visiblePoints = Math.ceil(data.length * progress);
    
    return data.slice(0, visiblePoints).map((point: DataPoint, index: number) => {
      const x = paddingLeft + point.month * xScale;
      const y = graphHeight - paddingBottom - point.level * yScale;
      
      return (
        <Circle
          key={index}
          cx={x}
          cy={y}
          r={5}
          fill={color}
          stroke="white"
          strokeWidth={2}
        />
      );
    });
  };
  
  // Generate x-axis labels (months)
  const renderXLabels = () => {
    return [0, 1, 2, 3, 4, 5, 6].map((month, index) => {
      const x = paddingLeft + month * xScale;
      const y = graphHeight - paddingBottom + 20;
      
      return (
        <G key={index}>
          <Line
            x1={x}
            y1={graphHeight - paddingBottom}
            x2={x}
            y2={graphHeight - paddingBottom + 5}
            stroke="#999"
            strokeWidth={1}
          />
          <SvgText
            x={x}
            y={y}
            fontSize="12"
            fill="#666"
            textAnchor="middle"
            fontFamily="Poppins-Regular"
          >
            {month}
          </SvgText>
        </G>
      );
    });
  };
  
  // Generate y-axis labels (reading levels)
  const renderYLabels = () => {
    return [0, 1, 2, 3].map((level, index) => {
      const x = paddingLeft - 10;
      const y = graphHeight - paddingBottom - level * yScale;
      
      return (
        <G key={index}>
          <Line
            x1={paddingLeft - 5}
            y1={y}
            x2={paddingLeft}
            y2={y}
            stroke="#999"
            strokeWidth={1}
          />
          <SvgText
            x={x}
            y={y + 4}
            fontSize="12"
            fill="#666"
            textAnchor="end"
            fontFamily="Poppins-Regular"
          >
            {level}
          </SvgText>
        </G>
      );
    });
  };

  // Generate static paths to avoid interpolation issues
  // We'll use a single path for each line and animate the stroke-dashoffset instead
  const pandaPath = generatePath(projectionData, 1);
  const traditionalPath = generatePath(traditionalData, 1);

  // Static progress dot indicator - Adjusted based on previous memory update
  const currentStep = 7; // ProjectionGraph is step 7 (0-indexed after removing DesiredOutcomes)
  const totalSteps = 15; // Updated total steps (originally 16, removed 1)

  return (
    <OnboardingContainer>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Pressable style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={24} color={designColors.deepNavy} />
      </Pressable>
      
      {/* Use ScrollView to prevent content overflow on smaller screens */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.progressContainer}>
            {Array(13).fill(0).map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.progressDot, 
                  i === 7 ? styles.activeDot : i < 7 ? styles.completedDot : {}
                ]}
              />
            ))}
          </View>
          
          <Animated.View 
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.title}>{childName}'s Reading Growth</Text>
            <Text style={styles.subtitle}>Projected progress over the next 6 months</Text>
            
            {/* Graph Card */}
            <View style={styles.graphCard}>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: designColors.blue }]} />
                  <Text style={styles.legendText}>Reading Panda</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: designColors.orange }]} />
                  <Text style={styles.legendText}>Typical Pace</Text>
                </View>
              </View>
            
            <Svg width={graphWidth} height={graphHeight}>
              {/* X and Y axes */}
              <Line
                x1={paddingLeft}
                y1={graphHeight - paddingBottom}
                x2={graphWidth - paddingRight}
                y2={graphHeight - paddingBottom}
                stroke="#999"
                strokeWidth={1}
              />
              <Line
                x1={paddingLeft}
                y1={paddingTop}
                x2={paddingLeft}
                y2={graphHeight - paddingBottom}
                stroke="#999"
                strokeWidth={1}
              />
              
              {/* Grid lines */}
              {[1, 2, 3].map((level, index) => (
                <Line
                  key={index}
                  x1={paddingLeft}
                  y1={graphHeight - paddingBottom - level * yScale}
                  x2={graphWidth - paddingRight}
                  y2={graphHeight - paddingBottom - level * yScale}
                  stroke="#eee"
                  strokeWidth={1}
                />
              ))}
              
              {/* Axis labels */}
              {renderXLabels()}
              {renderYLabels()}
              
              {/* Axis titles */}
              <SvgText
                x={graphWidth / 2}
                y={graphHeight - 5}
                fontSize="12"
                fill="#666"
                textAnchor="middle"
                fontFamily="Poppins-Medium"
              >
                Months
              </SvgText>
              <SvgText
                x={10}
                y={graphHeight / 2}
                fontSize="12"
                fill="#666"
                textAnchor="middle"
                fontFamily="Poppins-Medium"
                rotation="-90"
                originX={10}
                originY={graphHeight / 2}
              >
                Reading Level
              </SvgText>
              
              {/* Progress paths */}
              {/* Traditional path */}
              <Path
                d={traditionalPath}
                stroke={designColors.orange}
                strokeWidth={3}
                fill="none"
              />
              
              {/* Reading Panda path */}
              <Path
                d={pandaPath}
                stroke={designColors.blue}
                strokeWidth={3}
                fill="none"
              />
              
              {/* Data points */}
              {renderDataPoints(traditionalData, designColors.orange, 1)}
              {renderDataPoints(projectionData, designColors.blue, 1)}
            </Svg>
            
            <View style={styles.graphCaption}>
              <Text style={styles.captionText}>
                With just 15-20 minutes daily, {childName} could advance <Text style={styles.highlightText}>1.7x faster</Text> than traditional methods
              </Text>
            </View>
            </View>
            
            {/* Benefits Card */}
            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>What This Means:</Text>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitText}>Reading more complex books sooner</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitText}>Faster cognitive development</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitText}>Greater academic confidence</Text>
              </View>
            </View>
            
            {/* Spacer to push button down */}
            <View style={{ flexGrow: 1 }} />

            <TouchableOpacity
              style={styles.button}
              onPress={handleContinue}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </OnboardingContainer>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // Ensure ScrollView content can grow
    justifyContent: 'flex-start', // Align content to the top
  },
  container: {
    flex: 1, // Takes up available space within ScrollView
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: height - (RNStatusBar.currentHeight || 0) - 40, // Ensure container is at least viewport height minus status/padding
  },
  backButton: {
    position: 'absolute',
    top: (RNStatusBar.currentHeight || 0) + 15, // Position relative to status bar
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
    backgroundColor: designColors.orange, // Changed to orange for active dot
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
  contentContainer: {
    flex: 1, // Allow content to grow and push button down
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28, // Increased size
    color: designColors.deepNavy, // Changed to deepNavy
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 17, // Increased size
    color: designColors.blue,
    textAlign: 'center',
    marginBottom: 25,
  },
  graphCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly transparent white
    borderRadius: 28, // Increased border radius
    padding: 20,
    width: '100%',
    marginBottom: 25,
    // Claymorphism
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)', // White border
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    flexWrap: 'wrap', // Allow legend items to wrap
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 5, // Spacing if wraps
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)', // Subtle border on color swatch
  },
  legendText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: designColors.deepNavy,
  },
  graphCaption: {
    marginTop: 15,
    backgroundColor: `${designColors.blue}1A`, // Very transparent blue
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  captionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: designColors.deepNavy, // Darker text for readability
    textAlign: 'center',
    lineHeight: 22,
  },
  highlightText: {
    fontFamily: 'Poppins-Bold',
    color: designColors.blue,
  },
  benefitsCard: { // Renamed from benefitsContainer
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Match graph card background
    borderRadius: 28, // Consistent rounding
    padding: 20,
    width: '100%',
    marginBottom: 25, // Space below benefits card
    // Claymorphism
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)', // White border
  },
  benefitsTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20, // Slightly larger title
    color: designColors.deepNavy,
    marginBottom: 15, // More space below title
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // Space between items
    backgroundColor: `${designColors.skyBlue}20`, // Very light sky blue background
    borderRadius: 16, // Rounded corners for items
    paddingVertical: 12,
    paddingHorizontal: 15,
    minHeight: 50, // Ensure consistent height
  },
  benefitIcon: {
    fontSize: 24, // Larger icons
    marginRight: 15, // More space after icon
  },
  benefitText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16, // Slightly larger text
    color: designColors.deepNavy,
    flex: 1, // Allow text to wrap
    lineHeight: 23,
  },
  button: {
    backgroundColor: designColors.sunflower, // Changed to sunflower
    borderRadius: 28, // Increased border radius
    paddingVertical: 18, // Larger touch target
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%', // Consistent button width
    marginTop: 20, // Space above button
    marginBottom: 10, // Space below button within the scroll content
    // Claymorphism
    shadowColor: designColors.orange, // Shadow color from palette
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#ffffff', // White border
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: designColors.deepNavy, // Changed to deepNavy
    fontSize: 20, // Larger button text
  },
});
