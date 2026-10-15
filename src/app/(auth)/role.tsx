import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Bike, ChevronRight, Store, UserRound } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppScrollScreen } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';

/**
 * Role picker: customer / kitchen / delivery partner.
 *
 * Rebuilt on the design system with full en+gu copy and reduce-motion support.
 * There is deliberately no Admin option — VegBites ships without an Admin app.
 */
const ROLES = [
  { id: 'customer', labelKey: 'screens.role.customer', hintKey: 'screens.role.customerHint', icon: UserRound },
  { id: 'vendor', labelKey: 'screens.role.vendor', hintKey: 'screens.role.vendorHint', icon: Store },
  { id: 'delivery', labelKey: 'screens.role.delivery', hintKey: 'screens.role.deliveryHint', icon: Bike },
] as const;

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { reduceMotion } = useAppStore();

  const enter = (delay: number) => (reduceMotion ? undefined : FadeInDown.delay(delay).duration(Theme.motion.base));

  return (
    <AppScrollScreen>
      <View style={styles.head}>
        <AppText variant="h1" align="center">
          {t('screens.role.title')}
        </AppText>
        <AppText variant="bodySmall" color={Theme.colors.textSecondary} align="center">
          {t('screens.role.subtitle')}
        </AppText>
      </View>

      <View style={styles.list}>
        {ROLES.map((role, index) => {
          const Icon = role.icon;
          return (
            <Animated.View key={role.id} entering={enter(80 + index * 70)}>
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => router.push({ pathname: '/(auth)/login', params: { role: role.id } })}
                accessibilityRole="button"
              >
                <View style={styles.iconWrap}>
                  <Icon size={22} color={Theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="h3">{t(role.labelKey)}</AppText>
                  <AppText variant="caption" color={Theme.colors.textMuted}>
                    {t(role.hintKey)}
                  </AppText>
                </View>
                <ChevronRight size={20} color={Theme.colors.textMuted} />
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <Pressable onPress={() => router.push('/(auth)/welcome')} hitSlop={8} accessibilityRole="button">
        <AppText variant="caption" color={Theme.colors.textMuted} style={styles.back}>
          {t('screens.role.back')}
        </AppText>
      </Pressable>
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  head: { gap: Theme.spacing.sm, marginTop: Theme.spacing.huge, marginBottom: Theme.spacing.xl },
  list: { gap: Theme.spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  cardPressed: { opacity: 0.85 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: { textAlign: 'center', marginTop: Theme.spacing.xl },
});
