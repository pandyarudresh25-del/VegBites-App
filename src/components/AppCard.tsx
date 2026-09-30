import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Theme } from '../theme';

interface AppCardProps extends ViewProps {
  padding?: keyof typeof Theme.spacing;
  radius?: keyof typeof Theme.borderRadius;
  elevation?: 'none' | 'soft' | 'medium';
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  padding = 'md',
  radius = 'md',
  elevation = 'soft',
  style,
  ...props
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          padding: Theme.spacing[padding],
          borderRadius: Theme.borderRadius[radius],
        },
        elevation === 'soft' && Theme.shadows.soft,
        elevation === 'medium' && Theme.shadows.medium,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
  },
});
