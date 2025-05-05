import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface FloatingElementsProps {
  style?: ViewStyle;
  count?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  minOpacity?: number;
  maxOpacity?: number;
}

export default function FloatingElements({
  style,
  count = 6,
  colors: elementColors = [colors.primary, colors.secondary, colors.tertiary],
  minSize = 20,
  maxSize = 80,
  minOpacity = 0.05,
  maxOpacity = 0.15,
}: FloatingElementsProps) {
  // Create array of elements with random properties
  const elements = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.floor(Math.random() * (maxSize - minSize) + minSize),
    color: elementColors[Math.floor(Math.random() * elementColors.length)],
    opacity: Math.random() * (maxOpacity - minOpacity) + minOpacity,
    positionX: Math.random() * 100, // percentage
    positionY: Math.random() * 100, // percentage
    animationDuration: Math.random() * 5000 + 5000, // 5-10 seconds
    animationDelay: Math.random() * 2000, // 0-2 seconds delay
  }));

  // Create animated values for each element
  const animatedValues = useRef(
    elements.map(() => ({
      translateY: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Create animations for each element
    const animations = elements.map((element, index) => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValues[index].translateY, {
            toValue: 15,
            duration: element.animationDuration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
            delay: element.animationDelay,
          }),
          Animated.timing(animatedValues[index].translateY, {
            toValue: 0,
            duration: element.animationDuration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      return animation;
    });

    // Start all animations
    animations.forEach(animation => animation.start());

    // Clean up animations on unmount
    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      {elements.map((element, index) => (
        <Animated.View
          key={element.id}
          style={[
            styles.element,
            {
              width: element.size,
              height: element.size,
              backgroundColor: element.color,
              opacity: element.opacity,
              borderRadius: element.size / 2,
              left: `${element.positionX}%`,
              top: `${element.positionY}%`,
              transform: [
                { translateY: animatedValues[index].translateY },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    overflow: 'hidden',
  },
  element: {
    position: 'absolute',
  },
});