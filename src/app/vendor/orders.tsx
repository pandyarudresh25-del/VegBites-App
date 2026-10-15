import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowRight, Bike, ChefHat, PackageCheck, Receipt, ShoppingBag, Truck, X } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import { STAGE_KEY, STAGE_OF_STATUS, ORDER_FLOW, type Order, type OrderStatus } from '../../domain/types';

type TabKey = 'new' | 'preparing' | 'ready' | 'done';

/** Which board tab an order belongs to, and the next thing the kitchen can do. */
const TAB_OF_STATUS: Record<OrderStatus, TabKey> = {
  placed: 'new',
  confirmed: 'new',
  preparing: 'preparing',
  packed: 'ready',
  picked_up: 'ready',
  out_for_delivery: 'ready',
  delivered: 'done',
  cancelled: 'done',
};

const NEXT_ACTION: Partial<Record<OrderStatus, { labelKey: string; next: OrderStatus }>> = {
  placed: { labelKey: 'screens.vendor.accept', next: 'confirmed' },
  confirmed: { labelKey: 'screens.vendor.startPreparing', next: 'preparing' },
  preparing: { labelKey: 'screens.vendor.markReady', next: 'packed' },
  packed: { labelKey: 'screens.vendor.handOff', next: 'picked_up' },
};

const TABS: { key: TabKey; labelKey: string }[] = [
  { key: 'new', labelKey: 'screens.vendor.tabNew' },
  { key: 'preparing', labelKey: 'screens.vendor.tabPreparing' },
  { key: 'ready', labelKey: 'screens.vendor.tabReady' },
  { key: 'done', labelKey: 'screens.vendor.tabDone' },
];

/**
 * Kitchen order queue. The tabs, the counts and every button are driven by real
 * orders for this kitchen; the kitchen only moves an order as far as handing it
 * to the delivery partner — after that it is the partner's job, and the card
 * says so instead of offering an action it does not own.
 */
export default function VendorOrdersScreen() {
  const router = useRouter();
  const { t, language, currency, time } = useLanguage();
  const { vendorOrders, setOrderStatus, reduceMotion } = useAppStore();
  const [tab, setTab] = useState<TabKey>('new');

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  const grouped = useMemo(() => {
    const map: Record<TabKey, Order[]> = { new: [], preparing: [], ready: [], done: [] };
    vendorOrders.forEach((order) => map[TAB_OF_STATUS[order.status]].push(order));
    return map;
  }, [vendorOrders]);

  const active = grouped[tab];

  return (
    <AppScrollScreen>
      <ScreenHeader title={t('screens.vendor.ordersTitle')} subtitle={t('screens.vendor.menuSubtitle', { count: vendorOrders.length, soldOut: grouped.new.length })} />

      <View style={styles.tabs}>
        {TABS.map((entry) => {
          const selected = tab === entry.key;
          return (
            <Pressable
              key={entry.key}
              onPress={() => setTab(entry.key)}
              style={[styles.tab, selected && styles.tabOn]}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
            >
              <AppText variant="caption" color={selected ? Theme.colors.surface : Theme.colors.textSecondary}>
                {t(entry.labelKey)} · {grouped[entry.key].length}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {active.length === 0 ? (
        <EmptyState
          icon={<Receipt size={26} color={Theme.colors.primary} />}
          title={t('screens.vendor.noOrders')}
          body={t('screens.vendor.noOrdersHint')}
        />
      ) : (
        active.map((order, index) => {
          const action = NEXT_ACTION[order.status];
          const stage = STAGE_OF_STATUS[order.status];
          const StatusIcon =
            order.status === 'picked_up' || order.status === 'out_for_delivery'
              ? Truck
              : order.status === 'packed'
                ? PackageCheck
                : order.status === 'delivered'
                  ? ShoppingBag
                  : ChefHat;
          return (
            <Animated.View key={order.id} entering={reduceMotion ? undefined : FadeInDown.delay(index * 40).duration(Theme.motion.base)}>
              <View style={styles.card}>
                <Pressable
                  onPress={() => router.push(`/vendor/order/${order.id}` as never)}
                  style={styles.cardHead}
                  accessibilityRole="button"
                >
                  <View style={styles.cardIcon}>
                    <StatusIcon size={16} color={Theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="h3">#{order.id}</AppText>
                    <AppText variant="caption" color={Theme.colors.textMuted}>
                      {t(`${STAGE_KEY[stage]}`)} · {time(order.createdAt)}
                    </AppText>
                  </View>
                  <View style={styles.amount}>
                    <AppText variant="price">{currency(order.bill.total)}</AppText>
                    <AppText variant="caption" color={order.paymentMethod === 'cod' ? Theme.colors.warning : Theme.colors.success}>
                      {order.paymentMethod === 'cod'
                        ? t('screens.vendor.payOnDelivery', { amount: currency(order.bill.total) })
                        : t('screens.vendor.paidOnline')}
                    </AppText>
                  </View>
                  <ArrowRight size={16} color={Theme.colors.textMuted} />
                </Pressable>

                <View style={styles.divider} />

                <AppText variant="caption" color={Theme.colors.textMuted}>
                  {t('screens.vendor.customer')} · {order.address.name}
                </AppText>
                {order.lines.map((line) => (
                  <View key={line.id} style={styles.lineRow}>
                    <AppText variant="bodySmall" style={{ flex: 1 }}>
                      {line.quantity} × {label(line.name, line.nameGu)}
                    </AppText>
                    <AppText variant="caption" color={Theme.colors.textMuted}>
                      {currency(line.unitPrice * line.quantity)}
                    </AppText>
                  </View>
                ))}
                {order.instructions ? (
                  <AppText variant="caption" color={Theme.colors.warning}>
                    {t('screens.vendor.customerNote')}: {order.instructions}
                  </AppText>
                ) : null}

                <View style={styles.actions}>
                  {action ? (
                    <>
                      <View style={{ flex: 1 }}>
                        <AppButton
                          title={t('screens.vendor.cancelOrder')}
                          variant="outline"
                          onPress={() => setOrderStatus(order.id, 'cancelled')}
                        />
                      </View>
                      <View style={{ flex: 1.4 }}>
                        <AppButton
                          title={t(action.labelKey)}
                          onPress={() => setOrderStatus(order.id, action.next)}
                        />
                      </View>
                    </>
                  ) : (
                    <AppText variant="caption" color={Theme.colors.textMuted} style={{ flex: 1 }}>
                      {order.status === 'delivered'
                        ? t('flow.status.delivered')
                        : order.status === 'cancelled'
                          ? t('screens.vendor.cancelledOrder')
                          : t('screens.vendor.handOff')}
                    </AppText>
                  )}
                </View>
              </View>
            </Animated.View>
          );
        })
      )}
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: Theme.spacing.sm, flexWrap: 'wrap' },
  tab: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  tabOn: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  card: {
    gap: Theme.spacing.sm,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: { alignItems: 'flex-end' },
  divider: { height: 1, backgroundColor: Theme.colors.divider },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md, marginTop: Theme.spacing.xs },
});
