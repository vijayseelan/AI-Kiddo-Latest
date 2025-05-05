import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';

interface AnimatedTextProps {
  text: string;
  style?: TextStyle; 
  containerStyle?: ViewStyle; 
  duration?: number;
  delay?: number;
  fadeIn?: boolean;
  slideIn?: boolean;
  slideDirection?: 'up' | 'down' | 'left' | 'right';
  slideDistance?: number;
}

export default function AnimatedText({
  text,
  style,
  containerStyle,
  duration = 500,
  delay = 0,
  fadeIn = true,
  slideIn = false,
  slideDirection = 'up',
  slideDistance = 30,
}: AnimatedTextProps) {
  const opacity = useRef(new Animated.Value(fadeIn ? 0 : 1)).current;
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
    <Animated.View
      style={[
        containerStyle, 
        {
          opacity,      
          transform: [
            { translateX },
            { translateY },
          ],
        },
      ]}
    >
      <Animated.Text style={style}> 
        {text}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({});