import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import {
  ArrowLeft,
  Bike,
  Check,
  MessageSquare,
  Phone,
  Star,
  KeyRound,
  MapPin,
  Package,
} from 'lucide-react-native';
import { AppText } from '../../../components/AppText';
import { AppButton } from '../../../components/AppButton';
import { AppScrollScreen, ScreenHeader, EmptyState } from '../../../components/AppScreen';
import { Theme } from '../../../theme';
import { useLanguage } from '../../../context/LanguageContext';
import { useAppStore } from '../../../store/AppStore';
import {
  ORDER_FLOW,
  STATUS_KEY,
  STATUS_NOTE_KEY,
  STAGE_KEY,
  STAGE_OF_STATUS,
  TRACKING_STAGES,
  type OrderStatus,
  type TrackingStage,
} from '../../../domain/types';

const ACTIVE_STATUSES: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'packed', 'picked_up', 'out_for_delivery'];

/**
 * LIVE TRACKING.
 *
 * Previously a static mock. It now reads the real order from the store and
 * walks it through the fulfilment flow on a timer, so the timeline, the
 * "LIVE" pulse and the ETA all reflect actual state. The interval is cleared
 * on unmount and stops once the order is delivered or cancelled.
 */
export default function TrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, currency, time, language } = useLanguage();
  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);
  const { orders, advanceOrder, reduceMotion } = useAppStore();

  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- live progression ---------------------------------------------------
  useEffect(() => {
    if (!order) return;
    if (!ACTIVE_STATUSES.includes(order.status)) return;
    tickRef.current = setInterval(() => {
      advanceOrder(order.id);
    }, Theme.motion.trackingTickMs);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [order, advanceOrder, reduceMotion]);

  // --- "LIVE" dot pulse ---------------------------------------------------
  // Skipped entirely when the customer asked for reduced motion.
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      return;
    }
    opacity.value = withRepeat(withTiming(0.25, { duration: 700 }), -1, true);
  }, [opacity, reduceMotion]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!order) {
    return (
      <AppScrollScreen>
        <ScreenHeader
          title={t('tracking.title')}
          left={
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
              <ArrowLeft size={22} color={Theme.colors.text} />
            </Pressable>
          }
        />
        <EmptyState
          icon={<Package size={28} color={Theme.colors.primary} />}
          title={t('flow.orders.noActive')}
          body={t('flow.orders.noActiveHint')}
          action={<AppButton title={t('flow.tracking.backToOrders')} onPress={() => router.replace('/orders')} />}
        />
      </AppScrollScreen>
    );
  }

  const isDone = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';
  // The customer sees the six required stages; the internal status is finer-grained.
  const currentStage = STAGE_OF_STATUS[order.status];
  const stageIndex = TRACKING_STAGES.indexOf(currentStage);
  const stageReachedAt = (stage: TrackingStage) =>
    ORDER_FLOW.filter((status) => STAGE_OF_STATUS[status] === stage)
      .map((status) => order.timeline[status])
      .filter((value): value is number => typeof value === 'number')
      .sort((a, b) => a - b)[0];
  const isLive = ACTIVE_STATUSES.includes(order.status);

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      <AppScrollScreen
        contentStyle={{ paddingBottom: Theme.spacing.xxl }}
        footer={
          isDone && !order.reviewed ? (
            <View style={styles.footer}>
              <AppButton
                title={t('flow.orders.rateOrder')}
                onPress={() => router.push(`/reviews?orderId=${order.id}`)}
              />
            </View>
          ) : !isDone && !isCancelled ? (
            <View style={styles.footer}>
              <AppButton
                title={t('flow.tracking.backToOrders')}
                variant="outline"
                onPress={() => router.push('/orders')}
              />
            </View>
          ) : null
        }
      >
        <ScreenHeader
          title={t('tracking.title')}
          subtitle={t('tracking.orderId', { id: order.id })}
          left={
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
              <ArrowLeft size={22} color={Theme.colors.text} />
            </Pressable>
          }
          right={
            isLive ? (
              <View style={styles.livePill}>
                <Animated.View style={[styles.liveDot, pulseStyle]} />
                <AppText variant="caption" color={Theme.colors.success}>
                  {t('flow.tracking.live')}
                </AppText>
              </View>
            ) : null
          }
        />

        {/* --- ETA hero --- */}
        <Animated.View entering={FadeIn.duration(Theme.motion.base)} style={styles.heroCard}>
          <AppText variant="eyebrow" color={Theme.colors.success}>
            {isDone ? t('tracking.statusDelivered') : t('tracking.title')}
          </AppText>
          <AppText variant="display" style={{ marginTop: Theme.spacing.xs }}>
            {isDone
              ? t('flow.tracking.etaDone')
              : isCancelled
                ? t('flow.status.cancelled')
                : order.etaMins > 5
                  ? t('flow.tracking.eta', { mins: order.etaMins })
                  : t('flow.tracking.etaNear')}
          </AppText>
          <AppText variant="bodySmall" style={{ marginTop: Theme.spacing.xs }}>
            {t(STATUS_NOTE_KEY[order.status])}
          </AppText>

          {/* progress rail */}
          <View style={styles.rail}>
            <View
              style={[
                styles.railFill,
                { width: `${(Math.max(stageIndex, 0) / (TRACKING_STAGES.length - 1)) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.railLabels}>
            <AppText variant="caption">{t('flow.status.placed')}</AppText>
            <AppText variant="caption">{t(STATUS_KEY[order.status])}</AppText>
          </View>
        </Animated.View>

        {/* --- courier --- */}
        {order.courier && !isCancelled ? (
          <Animated.View entering={FadeInDown.delay(60).duration(Theme.motion.base)} style={styles.courierCard}>
            <View style={styles.courierAvatar}>
              <Bike size={22} color={Theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="caption">{t('flow.tracking.partner')}</AppText>
              <AppText variant="h3">{order.courier.name}</AppText>
              <View style={styles.courierMeta}>
                <Star size={12} color={Theme.colors.primary} fill={Theme.colors.primary} />
                <AppText variant="caption">{order.courier.rating}</AppText>
                <AppText variant="caption">·</AppText>
                <AppText variant="caption">
                  {order.courier.vehicle} · {order.courier.plate}
                </AppText>
              </View>
            </View>
            <View style={styles.courierActions}>
              <Pressable
                style={styles.iconButton}
                accessibilityRole="button"
                accessibilityLabel={t('flow.tracking.call')}
                onPress={() => router.push('/support')}
              >
                <Phone size={17} color={Theme.colors.success} />
              </Pressable>
              <Pressable
                style={styles.iconButton}
                accessibilityRole="button"
                accessibilityLabel={t('flow.tracking.message')}
                onPress={() => router.push('/chat')}
              >
                <MessageSquare size={17} color={Theme.colors.success} />
              </Pressable>
            </View>
          </Animated.View>
        ) : null}

        {/* --- timeline --- */}
        <Animated.View entering={FadeInDown.delay(120).duration(Theme.motion.base)} style={styles.card}>
          <AppText variant="h3" style={{ marginBottom: Theme.spacing.md }}>
            {t('flow.tracking.progress')}
          </AppText>
          {TRACKING_STAGES.map((stage, index) => {
            const reached = index <= stageIndex && !isCancelled;
            const isCurrent = index === stageIndex && !isDone && !isCancelled;
            const at = stageReachedAt(stage);
            return (
              <View key={stage} style={styles.stepRow}>
                <View style={styles.stepRail}>
                  <View style={[styles.stepDot, reached && styles.stepDotDone, isCurrent && styles.stepDotCurrent]}>
                    {reached && !isCurrent ? <Check size={11} color={Theme.colors.surface} strokeWidth={3} /> : null}
                  </View>
                  {index < TRACKING_STAGES.length - 1 ? (
                    <View style={[styles.stepLine, reached && styles.stepLineDone]} />
                  ) : null}
                </View>
                <View style={styles.stepBody}>
                  <AppText
                    variant={isCurrent ? 'h3' : 'bodySmall'}
                    color={reached ? Theme.colors.text : Theme.colors.textMuted}
                  >
                    {t(STAGE_KEY[stage])}
                  </AppText>
                  <AppText variant="caption" color={reached ? Theme.colors.textSecondary : Theme.colors.textMuted}>
                    {at
                      ? time(at)
                      : t(
                          STATUS_NOTE_KEY[
                            ORDER_FLOW.find((status) => STAGE_OF_STATUS[status] === stage) ?? 'placed'
                          ],
                        )}
                  </AppText>
                </View>
              </View>
            );
          })}
        </Animated.View>

        {/* --- delivery OTP --- */}
        {!isDone && !isCancelled ? (
          <Animated.View entering={FadeInDown.delay(140).duration(Theme.motion.base)} style={styles.otpCard}>
            <View style={styles.rowBetween}>
              <AppText variant="h3" color={Theme.colors.surface}>
                {t('flow.tracking.deliveryOtp')}
              </AppText>
              <KeyRound size={16} color={Theme.colors.surface} />
            </View>
            <AppText variant="h1" color={Theme.colors.surface} style={styles.otpValue}>
              {order.deliveryOtp}
            </AppText>
            <AppText variant="caption" color={Theme.colors.surface} style={{ opacity: 0.9 }}>
              {t('flow.tracking.deliveryOtpHint')}
            </AppText>
          </Animated.View>
        ) : null}

        {/* --- delivery address + summary --- */}
        <Animated.View entering={FadeInDown.delay(160).duration(Theme.motion.base)} style={styles.card}>
          <View style={styles.rowBetween}>
            <AppText variant="h3">{t('flow.tracking.deliverTo')}</AppText>
            <MapPin size={16} color={Theme.colors.primary} />
          </View>
          <AppText variant="bodySmall" style={{ marginTop: Theme.spacing.sm }}>
            {order.address.line1}, {order.address.line2}
          </AppText>
          <AppText variant="bodySmall">
            {order.address.city} – {order.address.pincode}
          </AppText>

          <View style={styles.divider} />

          <AppText variant="h3" style={{ marginBottom: Theme.spacing.sm }}>
            {t('flow.tracking.orderDetails')}
          </AppText>
          {order.lines.map((line) => (
            <View key={line.id} style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <AppText variant="bodySmall" numberOfLines={1}>
                  {line.quantity} × {label(line.name, line.nameGu)}
                </AppText>
                {line.note ? (
                  <AppText variant="caption" color={Theme.colors.textMuted} numberOfLines={1}>
                    {label(line.note, line.noteGu ?? line.note)}
                  </AppText>
                ) : null}
              </View>
              <AppText variant="bodySmall" color={Theme.colors.text}>
                {currency(line.unitPrice * line.quantity)}
              </AppText>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <AppText variant="h3">{t('flow.common.grandTotal')}</AppText>
            <AppText variant="price">{currency(order.bill.total)}</AppText>
          </View>
          {order.paymentMethod === 'cod' ? (
            <AppText variant="caption" color={Theme.colors.primary} style={{ marginTop: 4 }}>
              {t('flow.orders.payCod', { amount: currency(order.bill.total) })}
            </AppText>
          ) : null}
        </Animated.View>

        <Pressable onPress={() => router.push('/support')} style={styles.helpRow}>
          <AppText variant="bodySmall" color={Theme.colors.primary}>
            {t('flow.tracking.help')}
          </AppText>
        </Pressable>
      </AppScrollScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    ...Theme.shadows.medium,
  },
  rail: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.surfaceSecondary,
    marginTop: Theme.spacing.lg,
    overflow: 'hidden',
  },
  railFill: { height: '100%', borderRadius: 3, backgroundColor: Theme.colors.success },
  railLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Theme.spacing.sm },
  otpCard: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.xs,
  },
  otpValue: { letterSpacing: 6, marginTop: Theme.spacing.xs },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    ...Theme.shadows.soft,
  },
  courierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    ...Theme.shadows.soft,
  },
  courierAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courierMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  courierActions: { flexDirection: 'row', gap: Theme.spacing.sm },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepRow: { flexDirection: 'row', gap: Theme.spacing.md },
  stepRail: { alignItems: 'center', width: 22 },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: Theme.colors.success, borderColor: Theme.colors.success },
  stepDotCurrent: { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primarySoft },
  stepLine: { flex: 1, width: 2, backgroundColor: Theme.colors.border, minHeight: 26 },
  stepLineDone: { backgroundColor: Theme.colors.success },
  stepBody: { flex: 1, paddingBottom: Theme.spacing.lg },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Theme.colors.divider, marginVertical: Theme.spacing.md },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Theme.colors.successSoft,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.pill,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Theme.colors.success },
  helpRow: { alignItems: 'center', paddingVertical: Theme.spacing.md },
  footer: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.layout.screenPaddingX,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Theme.colors.border,
  },
});
