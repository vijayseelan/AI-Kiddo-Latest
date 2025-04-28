import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

interface TextProps extends RNTextProps {
  children: React.ReactNode;
}

export default function Text({ children, style, ...props }: TextProps) {
  return (
    <RNText style={[{ fontFamily: 'System' }, style]} {...props}>
      {children}
    </RNText>
  );
}
