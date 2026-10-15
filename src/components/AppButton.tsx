import React from 'react';
import { TouchableOpacityProps, StyleSheet, ActivityIndicator, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Theme } from '../theme';
import { AppText } from './AppText';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  isLoading?: boolean;
  fullWidth?: boolean;
  /** Optional trailing element (an icon) rendered beside the label. */
  rightIcon?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  variant = 'primary',
  isLoading = false,
  fullWidth = true,
  rightIcon,
  style,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    if (!disabled && !isLoading) {
      // @ts-ignore: ESLint false positive on reanimated useSharedValue
      // eslint-disable-next-line
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    }
    if (onPressIn) onPressIn(e);
  };

  const handlePressOut = (e: any) => {
    if (!disabled && !isLoading) {
      // @ts-ignore: ESLint false positive on reanimated useSharedValue
      // eslint-disable-next-line
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
    if (onPressOut) onPressOut(e);
  };

  const getBackgroundColor = () => {
    if (disabled) return Theme.colors.border;
    switch (variant) {
      case 'primary': return Theme.colors.primary;
      case 'secondary': return Theme.colors.surfaceSecondary;
      case 'outline': return 'transparent';
      case 'text': return 'transparent';
      default: return Theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return Theme.colors.textMuted;
    switch (variant) {
      case 'primary': return Theme.colors.surface;
      case 'secondary': return Theme.colors.text;
      case 'outline': return Theme.colors.primary;
      case 'text': return Theme.colors.primary;
      default: return Theme.colors.surface;
    }
  };

  return (
    <AnimatedTouchable
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outline,
        fullWidth && styles.fullWidth,
        animatedStyle,
        style as ViewStyle,
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          <AppText variant="button" color={getTextColor()}>
            {title}
          </AppText>
          {rightIcon ? <View style={styles.iconSlot}>{rightIcon}</View> : null}
        </>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  iconSlot: { marginLeft: Theme.spacing.sm },
  container: {
    height: 52, // Increased height for premium feel
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  fullWidth: {
    width: '100%',
  },
  outline: {
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
});
