import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  Ban,
  Bike,
  CalendarClock,
  CreditCard,
  KeyRound,
  MapPin,
  MessageSquareText,
  Package,
  Receipt,
  Star,
  WalletCards,
} from 'lucide-react-native';
import { AppText } from '../../../components/AppText';
import { AppButton } from '../../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../../components/AppScreen';
import { Theme } from '../../../theme';
import { useLanguage } from '../../../context/LanguageContext';
import { useAppStore } from '../../../store/AppStore';
import { SLOT_WINDOW, STAGE_KEY, STAGE_OF_STATUS, STATUS_KEY } from '../../../domain/types';

const METHOD_ICON = {
  cod: Receipt,
  upi: CreditCard,
  gpay: CreditCard,
  phonepe: CreditCard,
  netbanking: CreditCard,
  card: CreditCard,
  wallet: WalletCards,
} as const;

/**
 * Customer order detail.
 *
 * The screen map calls for an Order Detail screen for customers, but the only
 * `/order/[id]` route in the repo belongs to the *vendor* app — customers had no
 * way to open one of their own orders. This route lives at `/orders/[id]` so it
 * cannot collide with the vendor one, and it carries the spec's actions: Track,
 * Reorder, Rate and Cancel.
 */
export default function CustomerOrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language, currency, date, time } = useLanguage();
  const { orders, cancelOrder, reorder } = useAppStore();

  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  const order = useMemo(() => orders.find((entry) => entry.id === id), [orders, id]);

  const back = (
    <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
      <ArrowLeft size={22} color={Theme.colors.text} />
    </Pressable>
  );

  if (!order) {
    return (
      <AppScrollScreen>
        <ScreenHeader title={t('flow.orderDetail.title')} left={back} />
        <EmptyState
          icon={<Package size={28} color={Theme.colors.primary} />}
          title={t('flow.orders.noActive')}
          body={t('flow.orders.noActiveHint')}
          action={<AppButton title={t('nav.orders')} onPress={() => router.replace('/orders' as never)} />}
        />
      </AppScrollScreen>
    );
  }

  const stage = STAGE_OF_STATUS[order.status];
  const isActive = order.status !== 'delivered' && order.status !== 'cancelled';
  const MethodIcon = METHOD_ICON[order.paymentMethod];

  const reorderNow = () => {
    reorder(order.id);
    router.push('/cart' as never);
  };

  return (
    <AppScrollScreen
      footer={
        <View style={styles.footer}>
          {isActive ? (
            <>
              <View style={{ flex: 1 }}>
                <AppButton
                  variant="outline"
                  title={t('flow.orders.cancelOrder')}
                  onPress={() => setConfirmingCancel(true)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppButton title={t('flow.orders.track')} onPress={() => router.push(`/tracking/${order.id}` as never)} />
              </View>
            </>
          ) : (
            <>
              <View style={{ flex: 1 }}>
                <AppButton
                  variant="outline"
                  title={order.reviewed ? t('flow.orders.rated') : t('flow.orders.rateOrder')}
                  disabled={Boolean(order.reviewed || order.status === 'cancelled')}
                  onPress={() => router.push(`/reviews?orderId=${order.id}` as never)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppButton title={t('flow.orders.reorder')} onPress={reorderNow} />
              </View>
            </>
          )}
        </View>
      }
    >
      <ScreenHeader
        title={t('flow.orderDetail.title')}
        subtitle={t('tracking.orderId', { id: order.id })}
        left={back}
      />

      {confirmingCancel ? (
        <View style={styles.confirmCard}>
          <AppText variant="h3">{t('flow.orders.cancelConfirm')}</AppText>
          <View style={styles.confirmActions}>
            <View style={{ flex: 1 }}>
              <AppButton variant="outline" title={t('common.cancel')} onPress={() => setConfirmingCancel(false)} />
            </View>
            <View style={{ flex: 1 }}>
              <AppButton
                title={t('flow.orders.cancelOrder')}
                onPress={() => {
                  cancelOrder(order.id);
                  setConfirmingCancel(false);
                }}
              />
            </View>
          </View>
        </View>
      ) : null}

      {/* current status */}
      <Animated.View entering={FadeInDown.duration(Theme.motion.base)} style={styles.statusCard}>
        <View style={styles.statusHead}>
          <AppText variant="h3" color={Theme.colors.surface}>
            {t(STAGE_KEY[stage])}
          </AppText>
          <AppText variant="caption" color={Theme.colors.surface} style={styles.onPrimary}>
            {date(order.createdAt)} · {time(order.createdAt)}
          </AppText>
        </View>
        <AppText variant="bodySmall" color={Theme.colors.surface} style={styles.onPrimary}>
          {t(STATUS_KEY[order.status])}
        </AppText>
      </Animated.View>

      {/* handover OTP */}
      {isActive ? (
        <View style={styles.otpRow}>
          <KeyRound size={16} color={Theme.colors.primary} />
          <AppText variant="bodySmall" style={{ flex: 1 }}>
            {t('flow.tracking.deliveryOtp')}
          </AppText>
          <AppText variant="h3" color={Theme.colors.primary}>
            {order.deliveryOtp}
          </AppText>
        </View>
      ) : null}

      {/* items */}
      <View style={styles.card}>
        <AppText variant="h3" style={styles.cardTitle}>
          {t('flow.orderDetail.items')}
        </AppText>
        {order.lines.map((line, index) => (
          <View key={line.id}>
            <View style={styles.lineRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="bodySmall">
                  {line.quantity} × {label(line.name, line.nameGu)}
                </AppText>
                {line.note ? (
                  <AppText variant="caption" color={Theme.colors.textMuted}>
                    {label(line.note, line.noteGu ?? line.note)}
                  </AppText>
                ) : null}
              </View>
              <AppText variant="bodySmall">{currency(line.unitPrice * line.quantity)}</AppText>
            </View>
            {index < order.lines.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>

      {/* bill */}
      <View style={styles.card}>
        <AppText variant="h3" style={styles.cardTitle}>
          {t('flow.orderDetail.bill')}
        </AppText>
        {[
          { label: t('flow.common.subtotal'), value: order.bill.itemTotal },
          { label: t('flow.common.delivery'), value: order.bill.deliveryFee },
          { label: t('flow.common.platformFee'), value: order.bill.platformFee },
          { label: t('flow.common.taxes'), value: order.bill.taxes },
          { label: t('flow.common.discount'), value: -order.bill.discount },
        ].map((row) => (
          <View key={row.label} style={styles.billRow}>
            <AppText variant="bodySmall" color={Theme.colors.textSecondary}>
              {row.label}
            </AppText>
            <AppText variant="bodySmall" color={row.value < 0 ? Theme.colors.success : Theme.colors.text}>
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
          <MethodIcon size={15} color={Theme.colors.textMuted} />
          <AppText variant="caption" color={Theme.colors.textMuted}>
            {t(`flow.payment.${order.paymentMethod}`)}
          </AppText>
        </View>
      </View>

      {/* delivery */}
      <View style={styles.card}>
        <AppText variant="h3" style={styles.cardTitle}>
          {t('flow.tracking.deliverTo')}
        </AppText>
        <View style={styles.metaRow}>
          <MapPin size={15} color={Theme.colors.textMuted} />
          <AppText variant="bodySmall" style={{ flex: 1 }}>
            {order.address.line1}, {order.address.line2}, {order.address.city} – {order.address.pincode}
          </AppText>
        </View>
        {order.courier ? (
          <View style={styles.metaRow}>
            <Bike size={15} color={Theme.colors.textMuted} />
            <AppText variant="bodySmall" style={{ flex: 1 }}>
              {order.courier.name} · {order.courier.plate}
            </AppText>
          </View>
        ) : null}
        {order.slot ? (
          <View style={styles.metaRow}>
            <CalendarClock size={15} color={Theme.colors.textMuted} />
            <AppText variant="bodySmall" style={{ flex: 1 }}>
              {t(order.slot === 'morning' ? 'screens.tiffin.slotMorning' : 'screens.tiffin.slotEvening')} ·{' '}
              {SLOT_WINDOW[order.slot].start}–{SLOT_WINDOW[order.slot].end}
            </AppText>
          </View>
        ) : null}
        {order.instructions ? (
          <View style={styles.metaRow}>
            <MessageSquareText size={15} color={Theme.colors.textMuted} />
            <AppText variant="bodySmall" style={{ flex: 1 }}>
              {order.instructions}
            </AppText>
          </View>
        ) : null}
      </View>

      {/* timeline */}
      <View style={styles.card}>
        <AppText variant="h3" style={styles.cardTitle}>
          {t('flow.orderDetail.timeline')}
        </AppText>
        {Object.entries(order.timeline)
          .filter(([, at]) => typeof at === 'number')
          .sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0))
          .map(([status, at]) => (
            <View key={status} style={styles.billRow}>
              <AppText variant="bodySmall" color={Theme.colors.textSecondary}>
                {t(STATUS_KEY[status as keyof typeof STATUS_KEY])}
              </AppText>
              <AppText variant="caption" color={Theme.colors.textMuted}>
                {time(at as number)}
              </AppText>
            </View>
          ))}
      </View>

      {order.status === 'delivered' && !order.reviewed ? (
        <View style={styles.rateHint}>
          <Star size={15} color={Theme.colors.primary} />
          <AppText variant="caption" color={Theme.colors.textSecondary} style={{ flex: 1 }}>
            {t('flow.orderDetail.rateHint')}
          </AppText>
        </View>
      ) : null}

      {order.status === 'cancelled' ? (
        <View style={styles.cancelledRow}>
          <Ban size={15} color={Theme.colors.error} />
          <AppText variant="caption" color={Theme.colors.error}>
            {t('flow.orders.cancelled')}
          </AppText>
        </View>
      ) : null}
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  onPrimary: { opacity: 0.9 },
  statusCard: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.xs,
  },
  statusHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.primarySoft,
  },
  card: {
    gap: Theme.spacing.sm,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  cardTitle: { marginBottom: Theme.spacing.xs },
  lineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Theme.spacing.md },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
  },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Theme.spacing.sm, marginTop: Theme.spacing.xs },
  divider: { height: 1, backgroundColor: Theme.colors.divider, marginVertical: Theme.spacing.sm },
  confirmCard: {
    gap: Theme.spacing.sm,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.error,
    backgroundColor: Theme.colors.errorSoft,
  },
  confirmActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  rateHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  cancelledRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
});
