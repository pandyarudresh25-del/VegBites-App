import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BadgeIndianRupee, CheckCircle2, LogOut, MapPin, Phone, Star, Store } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import { SEED_RESTAURANTS } from '../../data/catalogue';

/**
 * Kitchen profile. Identity, rating and address come from the catalogue entry
 * for the signed-in kitchen; the stats come from that kitchen's real orders.
 * Switching kitchen is a real switch — it re-scopes orders, menu and earnings.
 */
export default function VendorProfileScreen() {
  const router = useRouter();
  const { t, language, currency } = useLanguage();
  const { user, signOut, vendorRestaurantId, setVendorRestaurant, vendorOrders, reduceMotion } = useAppStore();
  const [confirming, setConfirming] = useState(false);

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);
  const kitchen = SEED_RESTAURANTS.find((entry) => entry.id === vendorRestaurantId);

  const stats = useMemo(() => {
    const delivered = vendorOrders.filter((order) => order.status === 'delivered');
    return {
      completed: delivered.length,
      lifetime: delivered.reduce((sum, order) => sum + order.bill.itemTotal, 0),
    };
  }, [vendorOrders]);

  if (!user) {
    return (
      <AppScrollScreen>
        <ScreenHeader title={t('screens.vendor.profileTitle')} />
        <EmptyState
          icon={<Store size={28} color={Theme.colors.primary} />}
          title={t('screens.vendor.guestTitle')}
          body={t('screens.vendor.guestBody')}
          action={<AppButton title={t('nav.login')} onPress={() => router.push('/(auth)/login')} />}
        />
      </AppScrollScreen>
    );
  }

  return (
    <AppScrollScreen>
      <ScreenHeader
        title={t('screens.vendor.profileTitle')}
        subtitle={`${t('screens.vendor.signedInAs')} ${user.name}`}
      />

      <Animated.View
        entering={reduceMotion ? undefined : FadeInDown.duration(Theme.motion.base)}
        style={styles.identityCard}
      >
        <View style={styles.row}>
          <View style={styles.logo}>
            <Store size={22} color={Theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="h2">{label(kitchen?.name ?? '', kitchen?.nameGu ?? '')}</AppText>
            <View style={styles.metaRow}>
              <Star size={12} color={Theme.colors.primary} fill={Theme.colors.primary} />
              <AppText variant="caption" color={Theme.colors.textSecondary}>
                {kitchen?.rating} · {kitchen?.ratingCount} {t('flow.common.ratings')}
              </AppText>
            </View>
            <View style={styles.metaRow}>
              <MapPin size={12} color={Theme.colors.textMuted} />
              <AppText variant="caption" color={Theme.colors.textMuted}>
                {t('screens.vendor.kitchenAddress')} · {kitchen?.distanceKm} {t('common.km')} · {kitchen?.deliveryMins}{' '}
                {t('flow.common.mins')}
              </AppText>
            </View>
          </View>
        </View>
      </Animated.View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <BadgeIndianRupee size={16} color={Theme.colors.primary} />
          <AppText variant="caption" color={Theme.colors.textMuted}>
            {t('screens.vendor.lifetimeEarnings')}
          </AppText>
          <AppText variant="h3">{currency(stats.lifetime)}</AppText>
        </View>
        <View style={styles.statCard}>
          <CheckCircle2 size={16} color={Theme.colors.success} />
          <AppText variant="caption" color={Theme.colors.textMuted}>
            {t('screens.vendor.ordersCompleted')}
          </AppText>
          <AppText variant="h3">{stats.completed}</AppText>
        </View>
      </View>

      {/* switch kitchen — the whole app re-scopes to the chosen kitchen */}
      <View style={styles.card}>
        <AppText variant="h3">{t('screens.vendor.switchKitchen')}</AppText>
        <View style={styles.chips}>
          {SEED_RESTAURANTS.map((entry) => {
            const active = entry.id === vendorRestaurantId;
            return (
              <Pressable
                key={entry.id}
                onPress={() => setVendorRestaurant(entry.id)}
                style={[styles.chip, active && styles.chipOn]}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <AppText variant="caption" color={active ? Theme.colors.surface : Theme.colors.textSecondary}>
                  {label(entry.name, entry.nameGu)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.metaRow}>
          <Phone size={13} color={Theme.colors.textMuted} />
          <AppText variant="caption" color={Theme.colors.textMuted}>
            {t('screens.vendor.vendorSupport')} · 1800 200 300
          </AppText>
        </View>
      </View>

      {confirming ? (
        <View style={styles.confirmCard}>
          <AppText variant="h3">{t('screens.vendor.signOutConfirm')}</AppText>
          <View style={styles.confirmActions}>
            <View style={{ flex: 1 }}>
              <AppButton variant="outline" title={t('common.cancel')} onPress={() => setConfirming(false)} />
            </View>
            <View style={{ flex: 1 }}>
              <AppButton
                title={t('screens.vendor.signOut')}
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
          style={styles.signOut}
          accessibilityRole="button"
        >
          <LogOut size={18} color={Theme.colors.error} />
          <AppText variant="h3" color={Theme.colors.error}>
            {t('screens.vendor.signOut')}
          </AppText>
        </Pressable>
      )}
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  identityCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  logo: {
    width: 52,
    height: 52,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: Theme.spacing.md },
  statCard: {
    flex: 1,
    gap: 2,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  card: {
    gap: Theme.spacing.sm,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Theme.spacing.sm },
  chip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  chipOn: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  confirmCard: {
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.error,
    backgroundColor: Theme.colors.errorSoft,
  },
  confirmActions: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
});
