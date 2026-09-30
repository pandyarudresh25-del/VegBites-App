import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Theme } from '../theme';

interface AppTextProps extends TextProps {
  variant?: keyof typeof Theme.typography;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const AppText: React.FC<AppTextProps> = ({ 
  children, 
  variant = 'body', 
  color, 
  align,
  style, 
  ...props 
}) => {
  const textStyle = Theme.typography[variant];
  
  return (
    <Text 
      style={[
        textStyle, 
        color && { color }, 
        align && { textAlign: align },
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
};
