import React from 'react';
import { SafeAreaView, StyleSheet, View, Platform, StatusBar, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

// Colors from design.md
const designColors = {
  sunflower: '#ffb703',
  orange: '#fb8500',
  blue: '#219ebc',
  skyBlue: '#8ecae6',
  deepNavy: '#023047'
};

interface Props {
  children: React.ReactNode;
  style?: any;
}

const { width, height } = Dimensions.get('window');

export default function OnboardingContainer({ children, style }: Props) {
  return (
    <SafeAreaView style={[styles.safe, style]}> 
      {/* Gradient background layers */}
      <View style={styles.gradientBg1} />
      <View style={styles.gradientBg2} />
      <View style={styles.gradientBg3} />
      <View style={styles.gradientBg4} />

      {/* SVG Wave Shapes - Layered behind blur */}
      <Svg 
        height={height * 0.4} 
        width={width}
        viewBox={`0 0 ${width} ${height * 0.4}`} 
        style={styles.waveSvgBottom}
      >
        {/* Wave 1 (Bottom-most, lighter) */}
        <Path
          d={`M0 ${height * 0.2} Q${width / 4} ${height * 0.1} ${width / 2} ${height * 0.2} T${width} ${height * 0.2} L${width} ${height * 0.4} L0 ${height * 0.4} Z`}
          fill="rgba(255, 255, 255, 0.6)" 
        />
        {/* Wave 2 (Slightly above, maybe a subtle gradient) */}
        <Path 
          d={`M0 ${height * 0.25} Q${width / 3} ${height * 0.18} ${width / 1.8} ${height * 0.25} T${width} ${height * 0.22} L${width} ${height * 0.4} L0 ${height * 0.4} Z`}
          fill="rgba(255, 255, 255, 0.8)" 
        />
      </Svg>

      {/* Blur effect overlay - Now covers waves too */}
      <BlurView intensity={100} tint="light" style={styles.blurOverlay} />
      
      {/* Content */}
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: designColors.skyBlue,
    position: 'relative',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    overflow: 'hidden',
    zIndex: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 10,
  },
  // Gradient background layers
  gradientBg1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: designColors.skyBlue,
    zIndex: 1,
  },
  gradientBg2: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '80%',
    height: '60%',
    backgroundColor: designColors.blue,
    opacity: 0.3,
    transform: [{ skewX: '-45deg' }, { translateX: 100 }],
    zIndex: 2,
  },
  gradientBg3: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '100%',
    height: '40%',
    backgroundColor: designColors.sunflower,
    opacity: 0.5,
    transform: [{ skewY: '15deg' }, { translateY: 50 }],
    zIndex: 3,
  },
  gradientBg4: {
    position: 'absolute',
    bottom: '20%',
    left: 0,
    width: '70%',
    height: '30%',
    backgroundColor: designColors.orange,
    opacity: 0.3,
    transform: [{ skewY: '-20deg' }, { translateX: -50 }],
    zIndex: 4,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5, 
  },
  waveSvgBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 4, 
  },
});
