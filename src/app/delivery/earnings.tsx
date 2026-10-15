import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BadgeIndianRupee, Banknote, Bike, HandCoins, ListChecks, ShieldAlert } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import { PAYOUT_PER_DELIVERY, daysAgo, startOfToday } from '../../domain/types';

/**
 * Partner earnings. Every figure is derived from the partner's own completed
 * deliveries: today's payout, the week so far, the flat per-delivery rate, and
 * the cash still to be handed over for cash-on-delivery orders. The screen
 * states plainly that this is a demo build and no bank transfer happens.
 */
export default function DeliveryEarningsScreen() {
  const router = useRouter();
  const { t, currency, count, date, time } = useLanguage();
  const { user, completedDeliveries, reduceMotion } = useAppStore();

  const enter = (delay: number) =>
    reduceMotion ? undefined : FadeInDown.delay(delay).duration(Theme.motion.base);

  const totals = useMemo(() => {
    const todayStart = startOfToday();
    const weekStart = daysAgo(7);
    const today = completedDeliveries.filter((order) => order.createdAt >= todayStart);
    const week = completedDeliveries.filter((order) => order.createdAt >= weekStart);

    /** Cash the partner is still carrying: COD orders, collected on hand. */
    const cash = completedDeliveries
      .filter((order) => order.paymentMethod === 'cod')
      .reduce((sum, order) => sum + order.bill.total, 0);

    return {
      todayCount: today.length,
      todayPay: today.length * PAYOUT_PER_DELIVERY,
      weekCount: week.length,
      weekPay: week.length * PAYOUT_PER_DELIVERY,
      lifetimePay: completedDeliveries.length * PAYOUT_PER_DELIVERY,
      cash,
    };
  }, [completedDeliveries]);

  if (!user) {
    return (
      <AppScrollScreen>
        <ScreenHeader title={t('screens.courier.earningsTitle')} />
        <EmptyState
          icon={<Bike size={28} color={Theme.colors.primary} />}
          title={t('screens.courier.guestTitle')}
          body={t('screens.courier.guestBody')}
          action={<AppButton title={t('nav.login')} onPress={() => router.push('/(auth)/login')} />}
        />
      </AppScrollScreen>
    );
  }

  return (
    <AppScrollScreen>
      <ScreenHeader title={t('screens.courier.earningsTitle')} subtitle={t('screens.courier.week')} />

      {/* today's payout */}
      <Animated.View entering={enter(0)} style={styles.hero}>
        <View style={styles.rowBetween}>
          <AppText variant="caption" color={Theme.colors.surface} style={styles.dim}>
            {t('screens.courier.today')}
          </AppText>
          <BadgeIndianRupee size={18} color={Theme.colors.surface} />
        </View>
        <AppText variant="display" color={Theme.colors.surface}>
          {currency(totals.todayPay)}
        </AppText>
        <AppText variant="caption" color={Theme.colors.surface} style={styles.dim}>
          {t('screens.courier.deliveriesDone')} {count(totals.todayCount)} · {t('screens.courier.perDelivery')}{' '}
          {currency(PAYOUT_PER_DELIVERY)}
        </AppText>
      </Animated.View>

      {/* this week + cash on hand */}
      <View style={styles.grid}>
        <Animated.View entering={enter(60)} style={[styles.stat, { flex: 1 }]}>
          <ListChecks size={16} color={Theme.colors.primary} />
          <AppText variant="caption" color={Theme.colors.textMuted}>
            {t('screens.courier.deliveriesDone')}
          </AppText>
          <AppText variant="h1">{count(totals.weekCount)}</AppText>
          <AppText variant="caption" color={Theme.colors.textMuted}>
            {t('screens.courier.week')} · {currency(totals.weekPay)}
          </AppText>
        </Animated.View>

        <Animated.View entering={enter(90)} style={[styles.stat, { flex: 1 }]}>
          <HandCoins size={16} color={Theme.colors.warning} />
          <AppText variant="caption" color={Theme.colors.textMuted}>
            {t('screens.courier.cashShort')}
          </AppText>
          <AppText variant="h1">{currency(totals.cash)}</AppText>
          <AppText variant="caption" color={Theme.colors.textMuted}>
            {t('screens.courier.cashCollect', { amount: currency(PAYOUT_PER_DELIVERY) })}
          </AppText>
        </Animated.View>
      </View>

      {/* lifetime */}
      <View style={styles.payoutCard}>
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <Banknote size={17} color={Theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="label">{t('screens.courier.payout')}</AppText>
            <AppText variant="caption" color={Theme.colors.textMuted}>
              {t('screens.courier.payoutNote')}
            </AppText>
          </View>
          <AppText variant="price">{currency(totals.lifetimePay)}</AppText>
        </View>
      </View>

      {/* ledger */}
      <View style={styles.row}>
        <AppText variant="h3" style={{ flex: 1 }}>
          {t('screens.courier.ledger')}
        </AppText>
        {completedDeliveries.length > 0 ? (
          <AppText variant="caption" color={Theme.colors.textMuted}>
            {currency(totals.lifetimePay)}
          </AppText>
        ) : null}
      </View>

      {completedDeliveries.length === 0 ? (
        <EmptyState
          icon={<Banknote size={24} color={Theme.colors.primary} />}
          title={t('screens.courier.noLedger')}
          body={t('screens.courier.noLedgerHint')}
          action={<AppButton title={t('screens.courier.available')} onPress={() => router.push('/delivery/dashboard')} />}
        />
      ) : (
        completedDeliveries.map((order, index) => (
          <Animated.View key={order.id} entering={enter(120 + index * 40)} style={styles.ledgerRow}>
            <View style={styles.iconWrap}>
              <Banknote size={17} color={Theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="label">#{order.id}</AppText>
              <AppText variant="caption" color={Theme.colors.textMuted} numberOfLines={1}>
                {order.restaurantName} → {order.address.line1}
              </AppText>
              <AppText variant="caption" color={Theme.colors.textMuted}>
                {date(order.createdAt)} · {time(order.createdAt)}
              </AppText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <AppText variant="price">{currency(PAYOUT_PER_DELIVERY)}</AppText>
              {order.paymentMethod === 'cod' ? (
                <AppText variant="caption" color={Theme.colors.warning}>
                  {currency(order.bill.total)} {t('screens.courier.cashShort').toLowerCase()}
                </AppText>
              ) : (
                <AppText variant="caption" color={Theme.colors.success}>
                  {t('screens.courier.prepaid')}
                </AppText>
              )}
            </View>
          </Animated.View>
        ))
      )}

      {/* honest cash note */}
      <View style={styles.noteRow}>
        <ShieldAlert size={14} color={Theme.colors.textMuted} />
        <AppText variant="caption" color={Theme.colors.textMuted} style={{ flex: 1 }}>
          {t('screens.courier.cashNote')}
        </AppText>
      </View>
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.xs,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dim: { opacity: 0.9 },
  grid: { flexDirection: 'row', gap: Theme.spacing.md },
  stat: {
    gap: Theme.spacing.xs,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  payoutCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
});
