import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Check, ChefHat, CreditCard, KeyRound, MapPin, MessageSquareText, Phone, Receipt } from 'lucide-react-native';
import { AppText } from '../../../components/AppText';
import { AppButton } from '../../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../../components/AppScreen';
import { Theme } from '../../../theme';
import { useLanguage } from '../../../context/LanguageContext';
import { useAppStore } from '../../../store/AppStore';
import { ORDER_FLOW, SLOT_WINDOW, STATUS_KEY, type OrderStatus } from '../../../domain/types';

const NEXT_ACTION: Partial<Record<OrderStatus, { labelKey: string; next: OrderStatus }>> = {
  placed: { labelKey: 'screens.vendor.accept', next: 'confirmed' },
  confirmed: { labelKey: 'screens.vendor.startPreparing', next: 'preparing' },
  preparing: { labelKey: 'screens.vendor.markReady', next: 'packed' },
  packed: { labelKey: 'screens.vendor.handOff', next: 'picked_up' },
};

/**
 * One order from the kitchen's side: what to cook, who it is for, what was paid,
 * and the single next action the kitchen owns. The status timeline is the same
 * `order.timeline` the customer's LIVE TRACKING screen reads.
 */
export default function VendorOrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language, currency, time } = useLanguage();
  const { vendorOrders, setOrderStatus, reduceMotion } = useAppStore();

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);
  const order = useMemo(() => vendorOrders.find((entry) => entry.id === id), [vendorOrders, id]);

  const back = (
    <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
      <ArrowLeft size={22} color={Theme.colors.text} />
    </Pressable>
  );

  if (!order) {
    return (
      <AppScrollScreen>
        <ScreenHeader title={t('screens.vendor.orderTitle')} left={back} />
        <EmptyState
          icon={<Receipt size={26} color={Theme.colors.primary} />}
          title={t('screens.vendor.notFound')}
          body={t('screens.vendor.notFoundHint')}
          action={<AppButton title={t('screens.vendor.viewAllOrders')} onPress={() => router.replace('/vendor/orders' as never)} />}
        />
      </AppScrollScreen>
    );
  }

  const action = NEXT_ACTION[order.status];
  const reached = ORDER_FLOW.filter((status) => typeof order.timeline[status] === 'number');

  return (
    <AppScrollScreen
      footer={
        action ? (
          <View style={styles.footer}>
            <View style={{ flex: 1 }}>
              <AppButton
                variant="outline"
                title={t('screens.vendor.cancelOrder')}
                onPress={() => setOrderStatus(order.id, 'cancelled')}
              />
            </View>
            <View style={{ flex: 1.4 }}>
              <AppButton title={t(action.labelKey)} onPress={() => setOrderStatus(order.id, action.next)} />
            </View>
          </View>
        ) : (
          <AppText variant="caption" color={Theme.colors.textMuted} style={{ textAlign: 'center' }}>
            {order.status === 'delivered'
              ? t('flow.status.delivered')
              : order.status === 'cancelled'
                ? t('screens.vendor.cancelledOrder')
                : t('screens.vendor.handOff')}
          </AppText>
        )
      }
    >
      <ScreenHeader title={t('screens.vendor.orderTitle')} subtitle={`#${order.id} · ${t(STATUS_KEY[order.status])}`} left={back} />

      <Animated.View
        entering={reduceMotion ? undefined : FadeInDown.duration(Theme.motion.base)}
        style={styles.statusCard}
      >
        <View style={styles.rowBetween}>
          <AppText variant="h3" color={Theme.colors.surface}>
            {label(order.restaurantName, order.restaurantNameGu)}
          </AppText>
          <ChefHat size={18} color={Theme.colors.surface} />
        </View>
        <AppText variant="caption" color={Theme.colors.surface} style={styles.dim}>
          {time(order.createdAt)} · {t('screens.vendor.itemsCount', { count: order.lines.length })}
        </AppText>
      </Animated.View>

      {/* customer */}
      <View style={styles.card}>
        <AppText variant="h3">{t('screens.vendor.deliverTo')}</AppText>
        <View style={styles.metaRow}>
          <MapPin size={15} color={Theme.colors.textMuted} />
          <AppText variant="bodySmall" style={{ flex: 1 }}>
            {order.address.name} · {order.address.line1}, {order.address.line2}, {order.address.pincode}
          </AppText>
        </View>
        <View style={styles.metaRow}>
          <Phone size={15} color={Theme.colors.textMuted} />
          <AppText variant="bodySmall">{order.address.phone}</AppText>
        </View>
        {order.slot ? (
          <View style={styles.metaRow}>
            <KeyRound size={15} color={Theme.colors.textMuted} />
            <AppText variant="bodySmall">
              {t('screens.vendor.requestedSlot')}: {SLOT_WINDOW[order.slot].start}–{SLOT_WINDOW[order.slot].end}
            </AppText>
          </View>
        ) : null}
        {order.instructions ? (
          <View style={styles.metaRow}>
            <MessageSquareText size={15} color={Theme.colors.warning} />
            <AppText variant="bodySmall" color={Theme.colors.warning} style={{ flex: 1 }}>
              {t('screens.vendor.customerNote')}: {order.instructions}
            </AppText>
          </View>
        ) : null}
      </View>

      {/* items */}
      <View style={styles.card}>
        <AppText variant="h3">{t('screens.vendor.items')}</AppText>
        {order.lines.map((line) => (
          <View key={line.id} style={styles.billRow}>
            <AppText variant="bodySmall" style={{ flex: 1 }}>
              {line.quantity} × {label(line.name, line.nameGu)}
            </AppText>
            <AppText variant="bodySmall">{currency(line.unitPrice * line.quantity)}</AppText>
          </View>
        ))}
        <View style={styles.divider} />
        {[
          { label: t('flow.common.subtotal'), value: order.bill.itemTotal },
          { label: t('flow.common.delivery'), value: order.bill.deliveryFee },
          { label: t('flow.common.platformFee'), value: order.bill.platformFee },
          { label: t('flow.common.taxes'), value: order.bill.taxes },
          { label: t('flow.common.discount'), value: -order.bill.discount },
        ].map((row) => (
          <View key={row.label} style={styles.billRow}>
            <AppText variant="caption" color={Theme.colors.textSecondary}>
              {row.label}
            </AppText>
            <AppText variant="caption" color={row.value < 0 ? Theme.colors.success : Theme.colors.textSecondary}>
              {row.value < 0 ? `− ${currency(Math.abs(row.value))}` : currency(row.value)}
            </AppText>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.billRow}>
          <AppText variant="h3">{t('flow.common.grandTotal')}</AppText>
          <AppText variant="price">{currency(order.bill.total)}</AppText>
        </View>
        <View style={styles.metaRow}>
          <CreditCard size={15} color={Theme.colors.textMuted} />
          <AppText variant="caption" color={order.paymentMethod === 'cod' ? Theme.colors.warning : Theme.colors.success}>
            {order.paymentMethod === 'cod'
              ? t('screens.vendor.payOnDelivery', { amount: currency(order.bill.total) })
              : t('screens.vendor.paidOnline')}
          </AppText>
        </View>
      </View>

      {/* timeline */}
      <View style={styles.card}>
        <AppText variant="h3">{t('flow.tracking.progress')}</AppText>
        {reached.map((status) => (
          <View key={status} style={styles.billRow}>
            <View style={styles.stepRow}>
              <Check size={13} color={Theme.colors.success} strokeWidth={3} />
              <AppText variant="bodySmall" color={Theme.colors.textSecondary}>
                {t(STATUS_KEY[status])}
              </AppText>
            </View>
            <AppText variant="caption" color={Theme.colors.textMuted}>
              {time(order.timeline[status] as number)}
            </AppText>
          </View>
        ))}
      </View>
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  statusCard: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.xs,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dim: { opacity: 0.9 },
  card: {
    gap: Theme.spacing.sm,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Theme.spacing.sm },
  billRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Theme.spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  divider: { height: 1, backgroundColor: Theme.colors.divider, marginVertical: Theme.spacing.xs },
});
