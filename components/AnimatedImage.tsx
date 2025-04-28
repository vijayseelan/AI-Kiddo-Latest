import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle, ImageSourcePropType, ImageStyle } from 'react-native';

interface AnimatedImageProps {
  source: ImageSourcePropType;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  duration?: number;
  delay?: number;
  fadeIn?: boolean;
  scaleIn?: boolean;
  slideIn?: boolean;
  slideDirection?: 'up' | 'down' | 'left' | 'right';
  slideDistance?: number;
}

export default function AnimatedImage({
  source,
  style,
  containerStyle,
  duration = 500,
  delay = 0,
  fadeIn = true,
  scaleIn = false,
  slideIn = false,
  slideDirection = 'up',
  slideDistance = 50,
}: AnimatedImageProps) {
  const opacity = useRef(new Animated.Value(fadeIn ? 0 : 1)).current;
  const scale = useRef(new Animated.Value(scaleIn ? 0.8 : 1)).current;
  const translateX = useRef(new Animated.Value(
    slideIn && (slideDirection === 'left' || slideDirection === 'right') 
      ? slideDirection === 'left' ? -slideDistance : slideDistance 
      : 0
  )).current;
  const translateY = useRef(new Animated.Value(
    slideIn && (slideDirection === 'up' || slideDirection === 'down') 
      ? slideDirection === 'up' ? slideDistance : -slideDistance 
      : 0
  )).current;

  useEffect(() => {
    const animations = [];

    if (fadeIn) {
      animations.push(
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        })
      );
    }

    if (scaleIn) {
      animations.push(
        Animated.timing(scale, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        })
      );
    }

    if (slideIn) {
      if (slideDirection === 'left' || slideDirection === 'right') {
        animations.push(
          Animated.timing(translateX, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          })
        );
      } else {
        animations.push(
          Animated.timing(translateY, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          })
        );
      }
    }

    Animated.parallel(animations).start();
  }, []);

  return (
    <Animated.Image
      source={source}
      style={[
        style,
        containerStyle,
        {
          opacity,
          transform: [
            { scale },
            { translateX },
            { translateY },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({});