import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  CreditCard,
  Globe2,
  HelpCircle,
  LogOut,
  MapPin,
  Wallet,
} from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, ScreenHeader } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';

/**
 * Settings hub.
 *
 * Logging out actually clears the session through `store.signOut` (previously it
 * only navigated away, leaving the customer signed in). Confirmation is inline
 * because `Alert.alert` is a no-op on react-native-web.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, signOut } = useAppStore();

  const [confirming, setConfirming] = useState(false);

  const rows = [
    {
      key: 'language',
      label: t('account.language'),
      value: language === 'gu' ? 'ગુજરાતી' : 'English',
      icon: Globe2,
      href: '/(auth)/language',
    },
    { key: 'addresses', label: t('profile.savedAddresses'), icon: MapPin, href: '/address' },
    { key: 'payments', label: t('account.paymentMethods'), icon: CreditCard, href: '/payments' },
    { key: 'wallet', label: t('nav.wallet'), icon: Wallet, href: '/wallet' },
    { key: 'alerts', label: t('profile.notifications'), icon: Bell, href: '/notifications' },
    { key: 'support', label: t('account.helpSupport'), icon: HelpCircle, href: '/support' },
  ];

  const back = (
    <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
      <ArrowLeft size={22} color={Theme.colors.text} />
    </Pressable>
  );

  return (
    <AppScrollScreen>
      <ScreenHeader title={t('account.settings')} subtitle={user ? user.name : t('screens.settings.guest')} left={back} />

      <Animated.View entering={FadeInDown.duration(Theme.motion.base)} style={styles.list}>
        {rows.map((row, index) => {
          const Icon = row.icon;
          return (
            <Pressable
              key={row.key}
              onPress={() => router.push(row.href as never)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.row, index < rows.length - 1 && styles.divider, pressed && styles.rowPressed]}
            >
              <View style={styles.iconWrap}>
                <Icon size={19} color={Theme.colors.primary} />
              </View>
              <AppText variant="h3" style={styles.label}>
                {row.label}
              </AppText>
              {row.value ? (
                <AppText variant="caption" color={Theme.colors.textMuted}>
                  {row.value}
                </AppText>
              ) : null}
              <ChevronRight size={20} color={Theme.colors.textMuted} />
            </Pressable>
          );
        })}
      </Animated.View>

      {user ? (
        <Animated.View entering={FadeInDown.delay(80).duration(Theme.motion.base)} style={styles.logoutBlock}>
          {confirming ? (
            <View style={styles.confirmCard}>
              <AppText variant="h3">{t('screens.settings.logoutConfirm')}</AppText>
              <AppText variant="bodySmall" color={Theme.colors.textSecondary}>
                {t('screens.settings.logoutBody')}
              </AppText>
              <View style={styles.confirmActions}>
                <View style={{ flex: 1 }}>
                  <AppButton variant="outline" title={t('common.cancel')} onPress={() => setConfirming(false)} />
                </View>
                <View style={{ width: Theme.spacing.md, flex: 1 }}>
                  <AppButton
                    title={t('profile.logout')}
                    onPress={() => {
                      signOut();
                      router.replace('/(auth)/welcome');
                    }}
                  />
                </View>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setConfirming(true)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.logout, pressed && styles.rowPressed]}
            >
              <LogOut size={19} color={Theme.colors.error} />
              <AppText variant="h3" color={Theme.colors.error}>
                {t('profile.logout')}
              </AppText>
            </Pressable>
          )}
        </Animated.View>
      ) : (
        <AppButton title={t('nav.login')} onPress={() => router.push('/(auth)/login')} />
      )}
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Theme.spacing.lg, gap: Theme.spacing.md },
  rowPressed: { opacity: 0.7 },
  divider: { borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1 },
  logoutBlock: { marginTop: Theme.spacing.sm },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.lg,
    backgroundColor: Theme.colors.primarySoft,
    borderRadius: Theme.borderRadius.lg,
  },
  confirmCard: {
    gap: Theme.spacing.sm,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  confirmActions: { flexDirection: 'row', alignItems: 'center', marginTop: Theme.spacing.sm },
});
