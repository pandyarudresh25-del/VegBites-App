import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Clock, Package, RefreshCw, Star, X } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, EmptyState } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import { STATUS_KEY, type Order } from '../../domain/types';

/**
 * Orders. Now driven by the store: tracking, reorder and cancel all mutate
 * real state (previously these were hardcoded arrays and the Reorder button
 * had no onPress at all).
 */
export default function OrdersScreen() {
  const router = useRouter();
  const { t, language, currency, date } = useLanguage();
  const { activeOrders, pastOrders, reorder, cancelOrder } = useAppStore();

  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [toast, setToast] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState<string | null>(null);

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);
  const orders = tab === 'active' ? activeOrders : pastOrders;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  };

  const renderOrder = (order: Order, index: number) => {
    const isActive = order.status !== 'delivered' && order.status !== 'cancelled';
    const lineSummary = order.lines.map((l) => `${l.quantity}× ${label(l.name, l.nameGu)}`).join(', ');

    return (
      <Animated.View key={order.id} entering={FadeInDown.delay(index * 60).duration(Theme.motion.base)}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <AppText variant="h3">{t('orders.order')} #{order.id}</AppText>
              <AppText variant="caption">
                {date(order.createdAt)} · {t('flow.cart.itemsCount', { count: order.lines.length })}
              </AppText>
            </View>
            <View style={[styles.statusPill, !isActive && styles.statusPillMuted]}>
              <AppText
                variant="caption"
                color={order.status === 'cancelled' ? Theme.colors.error : isActive ? Theme.colors.primary : Theme.colors.success}
              >
                {t(STATUS_KEY[order.status])}
              </AppText>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.restaurantRow}>
            {order.kitchenImage ? (
              <Image source={order.kitchenImage} style={styles.kitchenImage} />
            ) : null}
            <View style={{ flex: 1 }}>
              <AppText variant="bodySmall" numberOfLines={1}>
                {label(order.restaurantName, order.restaurantNameGu)}
              </AppText>
              <AppText variant="caption" numberOfLines={2}>
                {lineSummary}
              </AppText>
            </View>
          </View>

          <View style={styles.footerRow}>
            <AppText variant="h3">{currency(order.bill.total)}</AppText>
            {isActive ? (
              <Pressable
                onPress={() => router.push(`/tracking/${order.id}`)}
                style={styles.primaryAction}
                accessibilityRole="button"
              >
                <Clock size={14} color={Theme.colors.surface} />
                <AppText variant="label" color={Theme.colors.surface}>
                  {t('flow.orders.track')}
                </AppText>
              </Pressable>
            ) : (
              <View style={styles.pastActions}>
                <Pressable
                  onPress={() => {
                    reorder(order.id);
                    showToast(t('flow.orders.reordered'));
                  }}
                  style={styles.ghostAction}
                  accessibilityRole="button"
                >
                  <RefreshCw size={13} color={Theme.colors.text} />
                  <AppText variant="caption">{t('flow.orders.orderAgain')}</AppText>
                </Pressable>
                <Pressable
                  onPress={() => router.push(`/reviews?orderId=${order.id}`)}
                  style={styles.ghostAction}
                  accessibilityRole="button"
                >
                  <Star size={13} color={Theme.colors.primary} />
                  <AppText variant="caption" color={Theme.colors.primary}>
                    {order.reviewed ? t('flow.orders.rated') : t('flow.orders.rateOrder')}
                  </AppText>
                </Pressable>
              </View>
            )}
          </View>

          {/* cancel is only offered while the kitchen has not started cooking */}
          {isActive && (order.status === 'placed' || order.status === 'confirmed') ? (
            confirmingCancel === order.id ? (
              <View style={styles.confirmRow}>
                <AppText variant="caption" style={{ flex: 1 }}>
                  {t('flow.orders.cancelConfirm')}
                </AppText>
                <Pressable
                  onPress={() => {
                    cancelOrder(order.id);
                    setConfirmingCancel(null);
                    showToast(t('flow.orders.cancelled'));
                  }}
                >
                  <AppText variant="label" color={Theme.colors.error}>
                    {t('common.cancel')}
                  </AppText>
                </Pressable>
                <Pressable onPress={() => setConfirmingCancel(null)} hitSlop={8}>
                  <X size={16} color={Theme.colors.textSecondary} />
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setConfirmingCancel(order.id)} style={styles.cancelLink}>
                <AppText variant="caption" color={Theme.colors.error}>
                  {t('flow.orders.cancelOrder')}
                </AppText>
              </Pressable>
            )
          ) : null}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      {toast ? (
        <Animated.View entering={FadeInDown.duration(Theme.motion.fast)} style={styles.toast}>
          <AppText variant="bodySmall" color={Theme.colors.surface}>
            {toast}
          </AppText>
        </Animated.View>
      ) : null}

      <AppScrollScreen>
        <AppText variant="h1" style={{ marginTop: Theme.spacing.md }}>
          {t('orders.title')}
        </AppText>

        <View style={styles.tabBar}>
          {(['active', 'past'] as const).map((key) => {
            const selected = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                style={[styles.tab, selected && styles.tabActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
              >
                <AppText variant="label" color={selected ? Theme.colors.surface : Theme.colors.textMuted}>
                  {t(key === 'active' ? 'flow.orders.active' : 'flow.orders.past')}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {orders.length === 0 ? (
          <EmptyState
            icon={<Package size={28} color={Theme.colors.primary} />}
            title={tab === 'active' ? t('flow.orders.noActive') : t('flow.orders.noPast')}
            body={tab === 'active' ? t('flow.orders.noActiveHint') : t('flow.orders.noPastHint')}
            action={
              <AppButton
                title={t('flow.cart.browseRestaurants')}
                variant="outline"
                onPress={() => router.push('/restaurants')}
              />
            }
          />
        ) : (
          <View style={{ gap: Theme.spacing.md }}>{orders.map(renderOrder)}</View>
        )}
      </AppScrollScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    ...Theme.shadows.soft,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Theme.spacing.md },
  statusPill: {
    backgroundColor: Theme.colors.primarySoft,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.pill,
  },
  statusPillMuted: { backgroundColor: Theme.colors.successSoft },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Theme.colors.divider, marginVertical: Theme.spacing.md },
  restaurantRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  kitchenImage: { width: 40, height: 40, borderRadius: Theme.borderRadius.sm },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.lg,
    height: 38,
    borderRadius: Theme.borderRadius.pill,
  },
  pastActions: { flexDirection: 'row', gap: Theme.spacing.sm },
  ghostAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 36,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.md,
    backgroundColor: Theme.colors.primarySoft,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.sm,
  },
  cancelLink: { marginTop: Theme.spacing.md, alignItems: 'center' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.pill,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
  },
  tab: { flex: 1, paddingVertical: Theme.spacing.sm + 2, alignItems: 'center', borderRadius: Theme.borderRadius.pill },
  tabActive: { backgroundColor: Theme.colors.text },
  toast: {
    position: 'absolute',
    top: Theme.spacing.xxl,
    alignSelf: 'center',
    backgroundColor: Theme.colors.text,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
    zIndex: 10,
  },
});
