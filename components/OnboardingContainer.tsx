import React from 'react';
import { SafeAreaView, StyleSheet, View, Platform, StatusBar, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

// New color palette
const colorPalette = {
  peach: '#faac96',     // RGB: (250, 172, 150)
  mint: '#90dec8',      // RGB: (144, 222, 200)
  lavender: '#9d8bed',  // RGB: (157, 139, 237)
  yellow: '#f8c75e',    // RGB: (248, 199, 94)
  green: '#78d9ad',     // RGB: (120, 217, 173)
  purple: '#cb97e0'     // RGB: (203, 151, 224)
};

interface Props {
  children: React.ReactNode;
  style?: any;
}

const { width, height } = Dimensions.get('window');

export default function OnboardingContainer({ children, style }: Props) {
  return (
    <SafeAreaView style={[styles.safe, style]}> 
      {/* Main gradient background */}
      <LinearGradient
        colors={[
          colorPalette.mint,
          colorPalette.peach,
          colorPalette.yellow,
          colorPalette.lavender
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mainGradient}
      />
      
      {/* Accent gradient overlay */}
      <LinearGradient
        colors={[
          'transparent',
          colorPalette.green,
          'transparent',
          colorPalette.purple
        ]}
        locations={[0, 0.3, 0.6, 0.9]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.accentGradient}
      />

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
      <BlurView intensity={80} tint="light" style={styles.blurOverlay} />
      
      {/* Content */}
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
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
  // New gradient styles
  mainGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  accentGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
    zIndex: 2,
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
