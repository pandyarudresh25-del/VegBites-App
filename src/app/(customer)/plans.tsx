import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, CalendarClock, Check, UtensilsCrossed } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import { SEED_PLANS } from '../../data/catalogue';

/**
 * Tiffin plans.
 *
 * Previously a hardcoded list of three plans with string prices and a "Pause
 * subscription" button that had no handler at all — it could not pause anything.
 * This now lists the real catalogue plans, subscribes through the store, and shows
 * the customer's live plan (pausing lives on the subscription screen, where the
 * subscription state actually is).
 */
export default function PlansScreen() {
  const router = useRouter();
  const { t, language, currency, date } = useLanguage();
  const { subscribeToPlan, activeSubscription, walletBalance } = useAppStore();

  const [toast, setToast] = useState<string | null>(null);

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  const back = (
    <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
      <ArrowLeft size={22} color={Theme.colors.text} />
    </Pressable>
  );

  const handleSubscribe = (planId: string) => {
    const plan = SEED_PLANS.find((entry) => entry.id === planId);
    if (!plan || activeSubscription) return;
    const subscription = subscribeToPlan(plan);
    if (!subscription) {
      // The store refuses when the wallet cannot cover the plan — send them to top up.
      setToast(t('screens.tiffin.addWalletFirst'));
      setTimeout(() => router.push('/wallet'), 800);
      return;
    }
    setToast(t('screens.tiffin.subscribed'));
    setTimeout(() => router.push('/subscription'), 800);
  };

  if (SEED_PLANS.length === 0) {
    return (
      <AppScrollScreen>
        <ScreenHeader title={t('plans.title')} left={back} />
        <EmptyState
          icon={<UtensilsCrossed size={28} color={Theme.colors.primary} />}
          title={t('screens.tiffin.noVendors')}
          body={t('screens.tiffin.noVendorsHint')}
          action={<AppButton title={t('screens.tiffin.vendorsTitle')} onPress={() => router.push('/tiffins/vendors')} />}
        />
      </AppScrollScreen>
    );
  }

  return (
    <AppScrollScreen>
      <ScreenHeader title={t('plans.title')} subtitle={t('plans.subtitle')} left={back} />

      {activeSubscription ? (
        <Animated.View entering={FadeInDown.duration(Theme.motion.base)} style={styles.activeCard}>
          <CalendarClock size={18} color={Theme.colors.primary} />
          <View style={styles.activeBody}>
            <AppText variant="h3">{label(activeSubscription.planName, activeSubscription.planNameGu)}</AppText>
            <AppText variant="caption" color={Theme.colors.textMuted}>
              {t('screens.tiffin.activeUntil', { date: date(activeSubscription.renewsAt) })}
            </AppText>
          </View>
          <View style={styles.activeButton}>
            <AppButton
              variant="outline"
              fullWidth={false}
              title={t('nav.subscriptions')}
              onPress={() => router.push('/subscription')}
            />
          </View>
        </Animated.View>
      ) : null}

      <View style={styles.list}>
        {SEED_PLANS.map((plan, index) => {
          const isActive = activeSubscription?.planId === plan.id;
          const affordable = walletBalance >= plan.price;
          return (
            <Animated.View key={plan.id} entering={FadeInDown.delay(40 + index * 40).duration(Theme.motion.base)}>
              <View style={[styles.card, plan.isPopular && styles.cardPopular]}>
                {plan.isPopular ? (
                  <View style={styles.popularTag}>
                    <AppText variant="caption" color={Theme.colors.surface}>
                      {t('screens.tiffin.popular')}
                    </AppText>
                  </View>
                ) : null}

                <View style={styles.cardHead}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="h2">{label(plan.name, plan.nameGu)}</AppText>
                    <AppText variant="caption" color={Theme.colors.textMuted}>
                      {t('screens.tiffin.mealsCount', { count: plan.meals })}
                    </AppText>
                  </View>
                  <View style={styles.priceBlock}>
                    <AppText variant="price">{currency(plan.price)}</AppText>
                    {plan.mrp && plan.mrp > plan.price ? (
                      <AppText variant="caption" style={styles.strike}>
                        {currency(plan.mrp)}
                      </AppText>
                    ) : null}
                  </View>
                </View>

                <View style={styles.includes}>
                  {plan.includes.map((entry, i) => (
                    <View key={entry} style={styles.includeRow}>
                      <Check size={14} color={Theme.colors.success} />
                      <AppText variant="bodySmall" color={Theme.colors.textSecondary}>
                        {label(entry, plan.includesGu[i] ?? entry)}
                      </AppText>
                    </View>
                  ))}
                </View>

                <AppText variant="caption" color={Theme.colors.success}>
                  {t('screens.tiffin.saveVs', { amount: currency(Math.round(plan.price * 0.18)) })}
                </AppText>

                <AppButton
                  title={
                    isActive
                      ? t('screens.tiffin.subscribed')
                      : affordable
                        ? t('screens.tiffin.startPlan')
                        : t('screens.tiffin.addWalletFirst')
                  }
                  disabled={isActive || Boolean(activeSubscription)}
                  onPress={() => handleSubscribe(plan.id)}
                />
              </View>
            </Animated.View>
          );
        })}
      </View>

      <AppButton
        variant="text"
        title={t('screens.tiffin.vendorsTitle')}
        onPress={() => router.push('/tiffins/vendors')}
      />

      {toast ? (
        <View style={styles.toast}>
          <AppText variant="caption" color={Theme.colors.surface}>
            {toast}
          </AppText>
        </View>
      ) : null}
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors.primarySoft,
  },
  activeBody: { flex: 1, gap: 2 },
  activeButton: { minWidth: 150 },
  list: { gap: Theme.spacing.md },
  card: {
    gap: Theme.spacing.sm,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  cardPopular: { borderColor: Theme.colors.primary },
  popularTag: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: Theme.spacing.md },
  priceBlock: { alignItems: 'flex-end' },
  strike: { textDecorationLine: 'line-through', color: Theme.colors.textMuted },
  includes: { gap: 4 },
  includeRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  toast: {
    position: 'absolute',
    top: Theme.spacing.huge,
    alignSelf: 'center',
    backgroundColor: Theme.colors.text,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
  },
});
