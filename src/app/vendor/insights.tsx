import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, BarChart3, Star, TrendingUp, UserCheck, Users } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { daysAgo } from '../../domain/types';
import { useAppStore } from '../../store/AppStore';

/**
 * Kitchen insights — the master prompt's Analytics, Customer Ratings and Repeat
 * Users requirements. Every number is aggregated from this kitchen's real orders
 * (and the customer's reviews of them); nothing here is invented. Repeat vs new
 * customers is derived from how many orders the same phone number has placed.
 */
export default function VendorInsightsScreen() {
  const router = useRouter();
  const { t, language, currency, count, date } = useLanguage();
  const { vendorOrders, reviews, reduceMotion } = useAppStore();

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  const analytics = useMemo(() => {
    const since = daysAgo(7);
    const window = vendorOrders.filter((order) => order.createdAt >= since);
    const delivered = window.filter((order) => order.status === 'delivered');
    const cancelled = window.filter((order) => order.status === 'cancelled');
    const revenue = delivered.reduce((sum, order) => sum + order.bill.itemTotal, 0);

    // dish → quantity sold / revenue
    const dishes = new Map<string, { name: string; nameGu: string; qty: number; revenue: number }>();
    delivered.forEach((order) =>
      order.lines.forEach((line) => {
        const entry = dishes.get(line.name) ?? { name: line.name, nameGu: line.nameGu, qty: 0, revenue: 0 };
        entry.qty += line.quantity;
        entry.revenue += line.unitPrice * line.quantity;
        dishes.set(line.name, entry);
      }),
    );

    // phone → orders placed (repeat customers)
    const byPhone = new Map<string, { name: string; orders: number; spend: number }>();
    window.forEach((order) => {
      const entry = byPhone.get(order.address.phone) ?? { name: order.address.name, orders: 0, spend: 0 };
      entry.orders += 1;
      entry.spend += order.bill.total;
      byPhone.set(order.address.phone, entry);
    });
    const customers = [...byPhone.values()].sort((a, b) => b.orders - a.orders);

    return {
      orders: window.length,
      delivered: delivered.length,
      cancelled: cancelled.length,
      revenue,
      avgBasket: delivered.length ? Math.round(revenue / delivered.length) : 0,
      topDishes: [...dishes.values()].sort((a, b) => b.qty - a.qty).slice(0, 5),
      repeat: customers.filter((entry) => entry.orders > 1),
      fresh: customers.filter((entry) => entry.orders === 1),
      customers,
    };
  }, [vendorOrders]);

  const kitchenReviews = useMemo(
    () =>
      reviews
        .filter((review) => vendorOrders.some((order) => order.id === review.orderId) || review.restaurantName)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 6),
    [reviews, vendorOrders],
  );

  const ratingAvg = useMemo(() => {
    const relevant = reviews.filter((review) => vendorOrders.some((order) => order.id === review.orderId));
    if (!relevant.length) return null;
    return Math.round((relevant.reduce((sum, review) => sum + review.rating, 0) / relevant.length) * 10) / 10;
  }, [reviews, vendorOrders]);

  return (
    <AppScrollScreen>
      <ScreenHeader
        title={t('screens.vendor.analytics')}
        subtitle={t('screens.vendor.last7')}
        left={
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
            <ArrowLeft size={22} color={Theme.colors.text} />
          </Pressable>
        }
      />

      {/* headline numbers */}
      <View style={styles.grid}>
        {[
          { icon: TrendingUp, labelKey: 'screens.vendor.todayRevenue', value: currency(analytics.revenue) },
          { icon: BarChart3, labelKey: 'screens.vendor.orderCount', value: t('screens.vendor.orderCount', { count: analytics.orders }) },
          { icon: UserCheck, labelKey: 'screens.vendor.avgBasket', value: currency(analytics.avgBasket) },
          { icon: Users, labelKey: 'screens.vendor.cancelRate', value: `${analytics.cancelled}` },
        ].map((card, index) => {
          const Icon = card.icon;
          return (
            <Animated.View
              key={card.labelKey}
              entering={reduceMotion ? undefined : FadeInDown.delay(index * 40).duration(Theme.motion.base)}
              style={styles.statCard}
            >
              <Icon size={16} color={Theme.colors.primary} />
              <AppText variant="caption" color={Theme.colors.textMuted}>
                {t(card.labelKey, { count: analytics.orders })}
              </AppText>
              <AppText variant="h3">{card.value}</AppText>
            </Animated.View>
          );
        })}
      </View>

      {/* top dishes */}
      <View style={styles.card}>
        <AppText variant="h3">{t('screens.vendor.topDishes')}</AppText>
        {analytics.topDishes.length === 0 ? (
          <AppText variant="bodySmall" color={Theme.colors.textMuted}>
            {t('screens.vendor.noSalesHint')}
          </AppText>
        ) : (
          analytics.topDishes.map((dish, index) => (
            <View key={dish.name} style={styles.row}>
              <AppText variant="label" color={Theme.colors.textMuted} style={styles.rank}>
                {index + 1}
              </AppText>
              <AppText variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>
                {label(dish.name, dish.nameGu)}
              </AppText>
              <AppText variant="caption" color={Theme.colors.textMuted}>
                {t('screens.vendor.soldCount', { count: dish.qty })}
              </AppText>
              <AppText variant="bodySmall">{currency(dish.revenue)}</AppText>
            </View>
          ))
        )}
      </View>

      {/* repeat vs new */}
      <View style={styles.card}>
        <AppText variant="h3">{t('screens.vendor.repeatCustomers')}</AppText>
        {analytics.customers.length === 0 ? (
          <AppText variant="bodySmall" color={Theme.colors.textMuted}>
            {t('screens.vendor.noSalesHint')}
          </AppText>
        ) : (
          <>
            <View style={styles.splitRow}>
              <View style={styles.split}>
                <AppText variant="h3">{analytics.repeat.length}</AppText>
                <AppText variant="caption" color={Theme.colors.textMuted}>
                  {t('screens.vendor.repeatCustomers')}
                </AppText>
              </View>
              <View style={styles.split}>
                <AppText variant="h3">{analytics.fresh.length}</AppText>
                <AppText variant="caption" color={Theme.colors.textMuted}>
                  {t('screens.vendor.newCustomers')}
                </AppText>
              </View>
            </View>
            {analytics.customers.slice(0, 5).map((entry) => (
              <View key={entry.name + entry.orders} style={styles.row}>
                <AppText variant="bodySmall" style={{ flex: 1 }}>
                  {entry.name}
                </AppText>
                <AppText variant="caption" color={entry.orders > 1 ? Theme.colors.success : Theme.colors.textMuted}>
                  {t('screens.vendor.orderCount', { count: entry.orders })}
                </AppText>
                <AppText variant="caption" color={Theme.colors.textMuted}>
                  {currency(entry.spend)}
                </AppText>
              </View>
            ))}
          </>
        )}
      </View>

      {/* ratings */}
      <View style={styles.card}>
        <View style={styles.head}>
          <AppText variant="h3" style={{ flex: 1 }}>
            {t('screens.vendor.customerRatings')}
          </AppText>
          {ratingAvg !== null ? (
            <View style={styles.ratingPill}>
              <Star size={12} color={Theme.colors.surface} fill={Theme.colors.surface} />
              <AppText variant="caption" color={Theme.colors.surface}>
                {ratingAvg}
              </AppText>
            </View>
          ) : null}
        </View>

        {kitchenReviews.length === 0 ? (
          <EmptyState
            icon={<Star size={22} color={Theme.colors.primary} />}
            title={t('screens.vendor.noRatings')}
            body={t('screens.vendor.noRatingsHint')}
          />
        ) : (
          kitchenReviews.map((review) => (
            <View key={review.id} style={styles.review}>
              <View style={styles.head}>
                <Star size={13} color={Theme.colors.primary} fill={Theme.colors.primary} />
                <AppText variant="bodySmall">{review.rating}.0</AppText>
                <AppText variant="caption" color={Theme.colors.textMuted}>
                  {date(review.createdAt)}
                </AppText>
              </View>
              {review.text ? (
                <AppText variant="caption" color={Theme.colors.textSecondary}>
                  {review.text}
                </AppText>
              ) : null}
              <AppText variant="caption" color={Theme.colors.textMuted}>
                {label(review.restaurantName, review.restaurantNameGu)} · {count(review.rating)}
              </AppText>
            </View>
          ))
        )}
      </View>
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
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
  card: {
    gap: Theme.spacing.sm,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  rank: { width: 16 },
  splitRow: { flexDirection: 'row', gap: Theme.spacing.md },
  split: {
    flex: 1,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.background,
    gap: 2,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.primary,
  },
  review: { gap: 2, paddingVertical: Theme.spacing.sm, borderTopWidth: 1, borderTopColor: Theme.colors.divider },
});
