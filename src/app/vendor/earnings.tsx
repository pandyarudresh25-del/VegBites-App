import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BadgeIndianRupee, CalendarClock, Landmark, Receipt, TrendingUp } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { daysAgo, startOfMonth, startOfToday } from '../../domain/types';
import { useAppStore } from '../../store/AppStore';

/**
 * Earnings. Every figure is summed from this kitchen's real orders — nothing is
 * hardcoded — and the ledger lists the delivered orders that produced it plus
 * the cancelled ones that produced nothing, so the numbers can be checked line
 * by line. There is no real bank transfer in this build and the screen says so.
 */
export default function VendorEarningsScreen() {
  const { t, currency, date } = useLanguage();
  const { vendorOrders, reduceMotion } = useAppStore();

  const totals = useMemo(() => {
    const delivered = vendorOrders.filter((order) => order.status === 'delivered');
    const gross = (orders: typeof delivered) => orders.reduce((sum, order) => sum + order.bill.itemTotal, 0);

    return {
      available: gross(delivered),
      today: gross(delivered.filter((order) => order.createdAt >= startOfToday())),
      week: gross(delivered.filter((order) => order.createdAt >= daysAgo(7))),
      month: gross(delivered.filter((order) => order.createdAt >= startOfMonth())),
      deliveredCount: delivered.length,
    };
  }, [vendorOrders]);

  const ledger = vendorOrders.filter((order) => order.status === 'delivered' || order.status === 'cancelled');

  return (
    <AppScrollScreen>
      <ScreenHeader title={t('screens.vendor.earningsTitle')} subtitle={t('screens.vendor.thisWeek')} />

      <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(Theme.motion.base)} style={styles.balanceCard}>
        <View style={styles.rowBetween}>
          <AppText variant="caption" color={Theme.colors.surface} style={styles.dim}>
            {t('screens.vendor.availableBalance')}
          </AppText>
          <Landmark size={16} color={Theme.colors.surface} />
        </View>
        <AppText variant="h1" color={Theme.colors.surface}>
          {currency(totals.available)}
        </AppText>
        <AppText variant="caption" color={Theme.colors.surface} style={styles.dim}>
          {t('screens.vendor.settlesTomorrow')}
        </AppText>
      </Animated.View>

      <View style={styles.grid}>
        {[
          { icon: BadgeIndianRupee, key: 'screens.vendor.todayRevenue', value: totals.today },
          { icon: CalendarClock, key: 'screens.vendor.thisWeek', value: totals.week },
          { icon: TrendingUp, key: 'screens.vendor.monthEarnings', value: totals.month },
          { icon: Receipt, key: 'screens.vendor.ordersCompleted', value: null },
        ].map((card, index) => {
          const Icon = card.icon;
          return (
            <Animated.View
              key={card.key}
              entering={reduceMotion ? undefined : FadeInDown.delay(60 + index * 40).duration(Theme.motion.base)}
              style={styles.statCard}
            >
              <Icon size={16} color={Theme.colors.primary} />
              <AppText variant="caption" color={Theme.colors.textMuted}>
                {t(card.key)}
              </AppText>
              <AppText variant="h3">
                {card.value === null ? totals.deliveredCount : currency(card.value as number)}
              </AppText>
            </Animated.View>
          );
        })}
      </View>

      <AppText variant="h3">{t('screens.vendor.payouts')}</AppText>

      {ledger.length === 0 ? (
        <EmptyState
          icon={<Receipt size={24} color={Theme.colors.primary} />}
          title={t('screens.vendor.noPayouts')}
          body={t('screens.vendor.noPayoutsHint')}
        />
      ) : (
        ledger.map((order, index) => {
          const cancelled = order.status === 'cancelled';
          return (
            <Animated.View
              key={order.id}
              entering={reduceMotion ? undefined : FadeInDown.delay(80 + index * 30).duration(Theme.motion.fast)}
              style={styles.ledgerRow}
            >
              <View style={styles.ledgerIcon}>
                <Receipt size={15} color={cancelled ? Theme.colors.textMuted : Theme.colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="bodySmall">{t('screens.vendor.orderEarning', { id: order.id })}</AppText>
                <AppText variant="caption" color={Theme.colors.textMuted}>
                  {date(order.createdAt)}
                </AppText>
              </View>
              <AppText variant="bodySmall" color={cancelled ? Theme.colors.textMuted : Theme.colors.success}>
                {cancelled ? t('screens.vendor.cancelledOrder') : `+ ${currency(order.bill.itemTotal)}`}
              </AppText>
            </Animated.View>
          );
        })
      )}
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.xs,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dim: { opacity: 0.9 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Theme.spacing.md },
  statCard: {
    flexGrow: 1,
    flexBasis: '45%',
    gap: 2,
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
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  ledgerIcon: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
