import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { Theme } from '../theme';
import { AppText } from './AppText';

/**
 * Quantity control for cart lines.
 *
 * Uses Pressable rather than TouchableOpacity so the hit area can be padded
 * beyond the visual pill (44pt minimum touch target) without inflating layout.
 */
export const QuantityStepper: React.FC<{
  quantity: number;
  onChange: (next: number) => void;
  /** Swaps the minus for a bin icon at quantity 1. */
  removeWhenOne?: boolean;
  min?: number;
}> = ({ quantity, onChange, removeWhenOne = true, min = 1 }) => {
  const decrementIcon =
    removeWhenOne && quantity <= 1 ? (
      <Trash2 size={16} color={Theme.colors.error} />
    ) : (
      <Minus size={16} color={Theme.colors.primary} />
    );

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        hitSlop={10}
        onPress={() => onChange(Math.max(min - 1, quantity - 1) < min ? 0 : quantity - 1)}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        {decrementIcon}
      </Pressable>
      <AppText variant="h3" style={styles.count}>
        {quantity}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        hitSlop={10}
        onPress={() => onChange(quantity + 1)}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Plus size={16} color={Theme.colors.primary} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.borderRadius.pill,
    paddingHorizontal: 4,
    height: 34,
  },
  button: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  count: {
    minWidth: 20,
    textAlign: 'center',
    color: Theme.colors.primary,
  },
});
