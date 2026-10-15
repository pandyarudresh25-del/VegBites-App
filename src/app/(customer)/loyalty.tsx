import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Gift, Lock, Star, Utensils } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';

/** Points earned per completed action — the only place these numbers live. */
const POINTS_PER_DELIVERED_ORDER = 30;
const POINTS_PER_REVIEW = 20;
const REWARD_STEPS = [
  { id: 'buttermilk', key: 'account.freeButtermilk', cost: 80 },
  { id: 'discount', key: 'account.nextTiffinDiscount', cost: 150 },
  { id: 'delivery', key: 'account.freeDelivery', cost: 200 },
] as const;

/**
 * Loyalty progress.
 *
 * Points are derived from the customer's real history (delivered orders and
 * reviews they have written) rather than a hardcoded number, and the milestone
 * list shows exactly how many points each reward still needs. Rows are not
 * tappable because redemption is not implemented yet — the screen states that
 * plainly instead of offering a button that does nothing.
 */
export default function LoyaltyScreen() {
  const router = useRouter();
  const { t, count } = useLanguage();
  const { orders, reviews, user } = useAppStore();

  const delivered = useMemo(() => orders.filter((order) => order.status === 'delivered').length, [orders]);
  const points = delivered * POINTS_PER_DELIVERED_ORDER + reviews.length * POINTS_PER_REVIEW;

  const nextStep = REWARD_STEPS.find((step) => points < step.cost);
  const target = nextStep?.cost ?? REWARD_STEPS[REWARD_STEPS.length - 1].cost;
  const previousStep = [...REWARD_STEPS].reverse().find((step) => step.cost <= points)?.cost ?? 0;
  const progress = Math.min(1, Math.max(0, (points - previousStep) / Math.max(1, target - previousStep)));

  const back = (
    <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
      <ArrowLeft size={22} color={Theme.colors.text} />
    </Pressable>
  );

  if (!user) {
    return (
      <AppScrollScreen>
        <ScreenHeader title={t('account.loyalty')} left={back} />
        <EmptyState
          icon={<Star size={28} color={Theme.colors.primary} />}
          title={t('screens.loyalty.guestTitle')}
          body={t('screens.loyalty.guestBody')}
          action={<AppButton title={t('nav.login')} onPress={() => router.push('/(auth)/login')} />}
        />
      </AppScrollScreen>
    );
  }

  return (
    <AppScrollScreen>
      <ScreenHeader title={t('account.loyalty')} subtitle={t('screens.loyalty.subtitle')} left={back} />

      <Animated.View entering={FadeInDown.duration(Theme.motion.base)} style={styles.pointsCard}>
        <View style={styles.star}>
          <Star size={22} color={Theme.colors.primary} fill={Theme.colors.primary} />
        </View>
        <AppText variant="bodySmall" color={Theme.colors.textSecondary}>
          {t('account.pointsBalance')}
        </AppText>
        <AppText variant="h1" style={styles.points}>
          {count(points)}
        </AppText>
        <AppText variant="caption" color={Theme.colors.textSecondary} style={styles.centre}>
          {nextStep
            ? t('screens.loyalty.toNext', { amount: count(nextStep.cost - points), reward: t(nextStep.key) })
            : t('screens.loyalty.allUnlocked')}
        </AppText>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(Theme.motion.base)}>
        <AppText variant="h3" style={styles.sectionTitle}>
          {t('screens.loyalty.breakdown')}
        </AppText>
        <View style={styles.card}>
          <View style={styles.earnRow}>
            <View style={styles.earnIcon}>
              <Utensils size={18} color={Theme.colors.primary} />
            </View>
            <View style={styles.earnBody}>
              <AppText variant="h3">{t('screens.loyalty.fromOrders')}</AppText>
              <AppText variant="caption" color={Theme.colors.textMuted}>
                {t('screens.loyalty.perOrder', { points: POINTS_PER_DELIVERED_ORDER })}
              </AppText>
            </View>
            <AppText variant="price">{count(delivered * POINTS_PER_DELIVERED_ORDER)}</AppText>
          </View>
          <View style={styles.divider} />
          <View style={styles.earnRow}>
            <View style={styles.earnIcon}>
              <Star size={18} color={Theme.colors.primary} />
            </View>
            <View style={styles.earnBody}>
              <AppText variant="h3">{t('screens.loyalty.fromReviews')}</AppText>
              <AppText variant="caption" color={Theme.colors.textMuted}>
                {t('screens.loyalty.perReview', { points: POINTS_PER_REVIEW })}
              </AppText>
            </View>
            <AppText variant="price">{count(reviews.length * POINTS_PER_REVIEW)}</AppText>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(Theme.motion.base)}>
        <AppText variant="h3" style={styles.sectionTitle}>
          {t('account.rewards')}
        </AppText>
        <View style={styles.card}>
          {REWARD_STEPS.map((step, index) => {
            const unlocked = points >= step.cost;
            return (
              <View key={step.id}>
                <View style={styles.rewardRow}>
                  <View style={[styles.rewardIcon, unlocked && styles.rewardIconOn]}>
                    {unlocked ? <Gift size={18} color={Theme.colors.success} /> : <Lock size={18} color={Theme.colors.textMuted} />}
                  </View>
                  <View style={styles.rewardBody}>
                    <AppText variant="h3" color={unlocked ? Theme.colors.text : Theme.colors.textSecondary}>
                      {t(step.key)}
                    </AppText>
                    <AppText variant="caption" color={unlocked ? Theme.colors.success : Theme.colors.textMuted}>
                      {unlocked
                        ? t('screens.loyalty.unlocked')
                        : t('screens.loyalty.needsPoints', { points: count(step.cost - points) })}
                    </AppText>
                  </View>
                  <AppText variant="caption" color={Theme.colors.textMuted}>
                    {count(step.cost)} {t('screens.loyalty.pts')}
                  </AppText>
                </View>
                {index < REWARD_STEPS.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            );
          })}
        </View>
        <AppText variant="caption" color={Theme.colors.textMuted} style={styles.note}>
          {t('screens.loyalty.redemptionNote')}
        </AppText>
      </Animated.View>

      <AppButton
        variant="outline"
        title={t('screens.loyalty.earnMore')}
        onPress={() => router.push('/restaurants')}
      />
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  pointsCard: {
    backgroundColor: Theme.colors.surfaceHighlight,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  star: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },
  points: { color: Theme.colors.primary, fontSize: 44, marginVertical: Theme.spacing.xs },
  centre: { textAlign: 'center' },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.surface,
    marginTop: Theme.spacing.lg,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Theme.colors.primary, borderRadius: 4 },
  sectionTitle: { marginBottom: Theme.spacing.md },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  earnRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md, paddingVertical: Theme.spacing.lg },
  earnIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnBody: { flex: 1, gap: 2 },
  divider: { height: 1, backgroundColor: Theme.colors.border },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md, paddingVertical: Theme.spacing.lg },
  rewardIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardIconOn: { backgroundColor: Theme.colors.successSoft },
  rewardBody: { flex: 1, gap: 2 },
  note: { marginTop: Theme.spacing.sm },
});
