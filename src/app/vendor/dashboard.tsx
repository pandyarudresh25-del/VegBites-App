import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowRight,
  BarChart3,
  BadgeIndianRupee,
  CheckCircle2,
  ChefHat,
  Clock,
  PackageCheck,
  Power,
  ShoppingBag,
  Store,
  Truck,
} from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { daysAgo, startOfToday } from '../../domain/types';
import { useAppStore } from '../../store/AppStore';
import { SEED_RESTAURANTS } from '../../data/catalogue';

/** The five columns of the kitchen board, each with the statuses it holds. */
const COLUMNS = [
  { key: 'new', labelKey: 'screens.vendor.boardNew', statuses: ['placed', 'confirmed'], icon: ShoppingBag },
  { key: 'preparing', labelKey: 'screens.vendor.boardPreparing', statuses: ['preparing'], icon: ChefHat },
  { key: 'ready', labelKey: 'screens.vendor.boardReady', statuses: ['packed'], icon: PackageCheck },
  { key: 'handed', labelKey: 'screens.vendor.boardHanded', statuses: ['picked_up', 'out_for_delivery'], icon: Truck },
  { key: 'done', labelKey: 'screens.vendor.boardDone', statuses: ['delivered'], icon: CheckCircle2 },
] as const;

/**
 * Kitchen dashboard. Everything on it comes from real orders for the signed-in
 * kitchen: the board columns, today's revenue, the average prep time (measured
 * from the order timeline), and the live menu counters.
 */
export default function VendorDashboardScreen() {
  const router = useRouter();
  const { t, language, currency, time } = useLanguage();
  const { vendorOrders, vendorMenu, vendorRestaurantId, user, reduceMotion } = useAppStore();

  const [toast, setToast] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);
  const enter = (delay: number) => (reduceMotion ? undefined : FadeInDown.delay(delay).duration(Theme.motion.base));

  const kitchen = SEED_RESTAURANTS.find((entry) => entry.id === vendorRestaurantId);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    COLUMNS.forEach((column) => {
      map[column.key] = vendorOrders.filter((order) => (column.statuses as readonly string[]).includes(order.status)).length;
    });
    return map;
  }, [vendorOrders]);

  const todaysOrders = vendorOrders.filter((order) => order.createdAt >= startOfToday());
  const weekStart = daysAgo(7);

  const revenue = (orders: typeof vendorOrders) =>
    orders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + order.bill.itemTotal, 0);

  /** Average minutes between "placed" and "packed" across orders that were packed. */
  const avgPrep = useMemo(() => {
    const spans = vendorOrders
      .filter((order) => order.timeline.placed && order.timeline.packed)
      .map((order) => ((order.timeline.packed as number) - (order.timeline.placed as number)) / 60000);
    if (!spans.length) return null;
    return Math.round(spans.reduce((a, b) => a + b, 0) / spans.length);
  }, [vendorOrders]);

  const live = vendorOrders.filter((order) => order.status !== 'delivered' && order.status !== 'cancelled');
  const soldOut = vendorMenu.filter((item) => !item.available).length;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 1600);
  };

  if (!user) {
    return (
      <AppScrollScreen>
        <ScreenHeader title={t('screens.vendor.dashTitle')} />
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
      {toast ? (
        <Animated.View entering={enter(0)} style={styles.toast}>
          <AppText variant="bodySmall" color={Theme.colors.surface}>
            {toast}
          </AppText>
        </Animated.View>
      ) : null}

      <ScreenHeader
        title={t('screens.vendor.dashTitle')}
        subtitle={t('screens.vendor.dashGreeting', { name: label(kitchen?.name ?? 'Kitchen', kitchen?.nameGu ?? 'રસોડું') })}
        right={
          <Pressable
            onPress={() => {
              setOpen((value) => !value);
              showToast(open ? t('screens.vendor.kitchenClosed') : t('screens.vendor.kitchenOpen'));
            }}
            style={[styles.power, open && styles.powerOn]}
            accessibilityRole="switch"
            accessibilityState={{ checked: open }}
          >
            <Power size={16} color={open ? Theme.colors.surface : Theme.colors.textMuted} />
          </Pressable>
        }
      />

      {/* revenue */}
      <Animated.View entering={enter(60)} style={styles.revenueCard}>
        <View style={styles.rowBetween}>
          <AppText variant="caption" color={Theme.colors.surface} style={styles.dim}>
            {t('screens.vendor.todayRevenue')}
          </AppText>
          <BadgeIndianRupee size={16} color={Theme.colors.surface} />
        </View>
        <AppText variant="h1" color={Theme.colors.surface}>
          {currency(revenue(todaysOrders))}
        </AppText>
        <AppText variant="caption" color={Theme.colors.surface} style={styles.dim}>
          {t('screens.vendor.ordersToday', { count: todaysOrders.length })} ·{' '}
          {t('screens.vendor.thisWeek')} {currency(revenue(vendorOrders.filter((o) => o.createdAt >= weekStart)))}
        </AppText>
      </Animated.View>

      {/* board */}
      <Animated.View entering={enter(100)} style={styles.board}>
        {COLUMNS.map((column) => {
          const Icon = column.icon;
          return (
            <Pressable
              key={column.key}
              onPress={() => router.push('/vendor/orders' as never)}
              style={styles.column}
              accessibilityRole="button"
            >
              <Icon size={15} color={Theme.colors.primary} />
              <AppText variant="h3">{counts[column.key] ?? 0}</AppText>
              <AppText variant="caption" color={Theme.colors.textMuted} numberOfLines={1}>
                {t(column.labelKey)}
              </AppText>
            </Pressable>
          );
        })}
      </Animated.View>

      {/* live orders */}
      <View style={styles.sectionHead}>
        <AppText variant="h3" style={{ flex: 1 }}>
          {t('screens.vendor.liveOrders')}
        </AppText>
        <Pressable onPress={() => router.push('/vendor/orders' as never)} hitSlop={8} accessibilityRole="button">
          <AppText variant="caption" color={Theme.colors.primary}>
            {t('screens.vendor.viewAllOrders')}
          </AppText>
        </Pressable>
      </View>

      {live.length === 0 ? (
        <EmptyState
          icon={<Clock size={24} color={Theme.colors.primary} />}
          title={t('screens.vendor.noLive')}
          body={t('screens.vendor.noLiveHint')}
        />
      ) : (
        live.slice(0, 4).map((order, index) => (
          <Animated.View key={order.id} entering={enter(120 + index * 50)}>
            <Pressable
              onPress={() => router.push(`/vendor/order/${order.id}` as never)}
              style={styles.orderRow}
              accessibilityRole="button"
            >
              <View style={styles.orderIcon}>
                {order.status === 'out_for_delivery' || order.status === 'picked_up' ? (
                  <Truck size={16} color={Theme.colors.primary} />
                ) : (
                  <ChefHat size={16} color={Theme.colors.primary} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="label">#{order.id}</AppText>
                <AppText variant="caption" color={Theme.colors.textMuted} numberOfLines={1}>
                  {order.lines
                    .map((line) => `${line.quantity}× ${label(line.name, line.nameGu)}`)
                    .join(', ')}
                </AppText>
              </View>
              <View style={styles.orderMeta}>
                <AppText variant="bodySmall">{currency(order.bill.total)}</AppText>
                <AppText variant="caption" color={Theme.colors.textMuted}>
                  {time(order.createdAt)}
                </AppText>
              </View>
              <ArrowRight size={16} color={Theme.colors.textMuted} />
            </Pressable>
          </Animated.View>
        ))
      )}

      {/* kitchen health */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <AppText variant="caption" color={Theme.colors.textMuted}>
            {t('screens.vendor.prepTime')}
          </AppText>
          <AppText variant="h3">
            {avgPrep === null ? '—' : `${avgPrep} ${t('screens.vendor.mins')}`}
          </AppText>
        </View>
        <View style={styles.statCard}>
          <AppText variant="caption" color={Theme.colors.textMuted}>
            {t('screens.vendor.tabMenu')}
          </AppText>
          <AppText variant="h3">{t('screens.vendor.kitchenDishes', { count: vendorMenu.length })}</AppText>
          <AppText variant="caption" color={soldOut ? Theme.colors.warning : Theme.colors.success}>
            {t('screens.vendor.soldOutCount', { count: soldOut })}
          </AppText>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={{ flex: 1 }}>
          <AppButton
            variant="outline"
            title={t('screens.vendor.manageMenu')}
            onPress={() => router.push('/vendor/menu' as never)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppButton title={t('screens.vendor.viewAllOrders')} onPress={() => router.push('/vendor/orders' as never)} />
        </View>
      </View>

      <Pressable
        onPress={() => router.push('/vendor/insights' as never)}
        style={styles.insightsRow}
        accessibilityRole="button"
      >
        <View style={styles.orderIcon}>
          <BarChart3 size={16} color={Theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="h3">{t('screens.vendor.analytics')}</AppText>
          <AppText variant="caption" color={Theme.colors.textMuted}>
            {t('screens.vendor.repeatCustomers')} · {t('screens.vendor.customerRatings')} · {t('screens.vendor.topDishes')}
          </AppText>
        </View>
        <ArrowRight size={16} color={Theme.colors.textMuted} />
      </Pressable>

    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  toast: {
    alignSelf: 'center',
    backgroundColor: Theme.colors.text,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
  },
  power: {
    width: 38,
    height: 38,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerOn: { backgroundColor: Theme.colors.success },
  revenueCard: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.xs,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dim: { opacity: 0.9 },
  board: { flexDirection: 'row', gap: Theme.spacing.sm },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  orderIcon: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderMeta: { alignItems: 'flex-end' },
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
  actions: { flexDirection: 'row', gap: Theme.spacing.md },
  insightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
});
