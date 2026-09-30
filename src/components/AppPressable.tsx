import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface AppPressableProps extends TouchableOpacityProps {
  scaleTo?: number;
}

export const AppPressable: React.FC<AppPressableProps> = ({
  children,
  style,
  scaleTo = 0.95,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    // @ts-ignore: ESLint false positive on reanimated useSharedValue
    // eslint-disable-next-line
    scale.value = withSpring(scaleTo, { damping: 15, stiffness: 300 });
    if (onPressIn) onPressIn(e);
  };

  const handlePressOut = (e: any) => {
    // @ts-ignore: ESLint false positive on reanimated useSharedValue
    // eslint-disable-next-line
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    if (onPressOut) onPressOut(e);
  };

  return (
    <AnimatedTouchable
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style as ViewStyle]}
      {...props}
    >
      {children}
    </AnimatedTouchable>
  );
};
