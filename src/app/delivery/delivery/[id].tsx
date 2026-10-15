import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  MapPin,
  Navigation,
  Package,
  Phone,
  Store,
  Truck,
  User,
} from 'lucide-react-native';
import { AppText } from '../../../components/AppText';
import { AppButton } from '../../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../../components/AppScreen';
import { Theme } from '../../../theme';
import { useLanguage } from '../../../context/LanguageContext';
import { useAppStore } from '../../../store/AppStore';
import { successFeedback, tapFeedback } from '../../../lib/haptics';
import { STAGE_KEY, STAGE_OF_STATUS } from '../../../domain/types';

/** Progress rail: every step the partner passes through, in order. */
const STEPS = [
  { key: 'assigned', labelKey: 'screens.courier.stepAssigned', icon: Check },
  { key: 'reachedVendor', labelKey: 'screens.courier.stepReachedVendor', icon: Store },
  { key: 'received', labelKey: 'screens.courier.stepReceived', icon: Package },
  { key: 'reachedCustomer', labelKey: 'screens.courier.stepReachedCustomer', icon: MapPin },
  { key: 'delivered', labelKey: 'screens.courier.stepDelivered', icon: Truck },
] as const;

/** One action per step; delivery itself is confirmed with the customer's OTP. */
const ACTIONS = [
  { from: 'assigned', to: 'reachedVendor', labelKey: 'screens.courier.stepReachedVendor' },
  { from: 'reachedVendor', to: 'received', labelKey: 'screens.courier.stepReceived' },
  { from: 'received', to: 'reachedCustomer', labelKey: 'screens.courier.stepReachedCustomer' },
] as const;

/**
 * One delivery, from the partner's side: route, both addresses, the handover OTP
 * the customer is shown, the step buttons that move the real order status, and
 * the emergency-breakdown report. Navigation opens the device's maps app with
 * the destination pre-filled instead of faking a map on screen.
 */
export default function DeliveryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language, currency, time } = useLanguage();
  const {
    deliveryQueue,
    courierSteps,
    setCourierStep,
    acceptDelivery,
    breakdowns,
    reportBreakdown,
    reduceMotion,
  } = useAppStore();

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);
  const order = useMemo(() => deliveryQueue.find((entry) => entry.id === id), [deliveryQueue, id]);
  const step = order ? courierSteps[order.id] ?? (order.status === 'delivered' ? 'delivered' : undefined) : undefined;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 1800);
  };

  const back = (
    <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
      <ArrowLeft size={22} color={Theme.colors.text} />
    </Pressable>
  );

  /** Opens the device's maps app with directions to the destination. */
  const navigateTo = (query: string) => {
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?q=${encodeURIComponent(query)}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    Linking.openURL(url).catch(() => showToast(query));
  };

  if (!order) {
    return (
      <AppScrollScreen>
        <ScreenHeader title={t('screens.courier.details')} left={back} />
        <EmptyState
          icon={<Truck size={26} color={Theme.colors.primary} />}
          title={t('screens.courier.noAvailable')}
          body={t('screens.courier.noAvailableHint')}
          action={<AppButton title={t('screens.courier.tabDashboard')} onPress={() => router.replace('/delivery/dashboard' as never)} />}
        />
      </AppScrollScreen>
    );
  }

  const pickup = `${order.restaurantName}, Rajkot`;
  const drop = `${order.address.line1}, ${order.address.line2}, ${order.address.city} ${order.address.pincode}`;
  const currentStepIndex = step ? STEPS.findIndex((entry) => entry.key === step) : -1;
  const nextAction = ACTIONS.find((entry) => entry.from === step);
  const isDelivered = order.status === 'delivered';
  const orderBreakdowns = breakdowns.filter((entry) => entry.orderId === order.id);

  const verifyAndDeliver = () => {
    if (otp.trim() !== order.deliveryOtp) {
      setOtpError(t('screens.courier.otpInvalid'));
      return;
    }
    setOtpError(null);
    setCourierStep(order.id, 'delivered');
    successFeedback();
    showToast(t('screens.courier.otpVerified'));
  };

  return (
    <AppScrollScreen
      footer={
        isDelivered ? (
          <AppText variant="bodySmall" color={Theme.colors.success} style={{ textAlign: 'center' }}>
            {t('screens.courier.stepDelivered')}
          </AppText>
        ) : !step ? (
          <AppButton
            title={t('screens.courier.accept')}
            onPress={() => {
              acceptDelivery(order.id);
              setCourierStep(order.id, 'assigned');
              tapFeedback();
              showToast(t('screens.courier.accepted'));
            }}
          />
        ) : nextAction ? (
          <AppButton title={t(nextAction.labelKey)} onPress={() => setCourierStep(order.id, nextAction.to)} />
        ) : (
          <AppText variant="caption" color={Theme.colors.textMuted} style={{ textAlign: 'center' }}>
            {t('screens.courier.otpHint')}
          </AppText>
        )}
    >
      {toast ? (
        <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(Theme.motion.fast)} style={styles.toast}>
          <AppText variant="bodySmall" color={Theme.colors.surface}>
            {toast}
          </AppText>
        </Animated.View>
      ) : null}

      <ScreenHeader
        title={`#${order.id}`}
        subtitle={`${t('screens.courier.currentStatus')} · ${t(STAGE_KEY[STAGE_OF_STATUS[order.status]])}`}
        left={back}
      />

      {/* step progress */}
      <View style={styles.steps}>
        {STEPS.map((entry, index) => {
          const done = currentStepIndex >= index || isDelivered;
          const Icon = entry.icon;
          return (
            <View key={entry.key} style={styles.step}>
              <View style={[styles.stepDot, done && styles.stepDotOn]}>
                <Icon size={14} color={done ? Theme.colors.surface : Theme.colors.textMuted} />
              </View>
              <AppText variant="caption" color={done ? Theme.colors.text : Theme.colors.textMuted} align="center">
                {t(entry.labelKey)}
              </AppText>
            </View>
          );
        })}
      </View>

      {/* route */}
      <View style={styles.card}>
        <View style={styles.head}>
          <Navigation size={17} color={Theme.colors.primary} />
          <AppText variant="h3" style={{ flex: 1 }}>
            {t('screens.courier.route')}
          </AppText>
        </View>

        <View style={styles.leg}>
          <View style={styles.legIcon}>
            <Store size={15} color={Theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="caption" color={Theme.colors.textMuted}>
              {t('screens.courier.pickup')}
            </AppText>
            <AppText variant="bodySmall">{pickup}</AppText>
            <AppText variant="caption" color={Theme.colors.textMuted}>
              {time(order.createdAt)} · {t('screens.courier.distance', { km: order.address.pincode === '360005' ? '2.4' : '4.1' })}
            </AppText>
          </View>
          <Pressable onPress={() => navigateTo(pickup)} style={styles.iconButton} accessibilityRole="button">
            <Navigation size={15} color={Theme.colors.primary} />
          </Pressable>
        </View>

        <View style={styles.legConnector} />

        <View style={styles.leg}>
          <View style={styles.legIcon}>
            <MapPin size={15} color={Theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="caption" color={Theme.colors.textMuted}>
              {t('screens.courier.drop')}
            </AppText>
            <AppText variant="bodySmall">{drop}</AppText>
            <AppText variant="caption" color={Theme.colors.textMuted}>
              {t('screens.courier.customer')} · {order.address.name}
            </AppText>
          </View>
          <Pressable onPress={() => navigateTo(drop)} style={styles.iconButton} accessibilityRole="button">
            <Navigation size={15} color={Theme.colors.primary} />
          </Pressable>
        </View>

        <View style={styles.actionRow}>
          <View style={{ flex: 1 }}>
            <AppButton
              variant="outline"
              title={t('screens.courier.call')}
              onPress={() => Linking.openURL(`tel:${order.address.phone}`).catch(() => showToast(order.address.phone))}
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton
              variant="outline"
              title={t('screens.courier.navigate')}
              onPress={() => navigateTo(drop)}
            />
          </View>
        </View>
      </View>

      {/* delivery details */}
      <View style={styles.card}>
        <AppText variant="h3">{t('screens.courier.details')}</AppText>
        <View style={styles.row}>
          <User size={15} color={Theme.colors.textMuted} />
          <AppText variant="bodySmall" style={{ flex: 1 }}>
            {order.address.name} · {order.address.phone}
          </AppText>
        </View>
        <View style={styles.row}>
          <Package size={15} color={Theme.colors.textMuted} />
          <AppText variant="bodySmall" style={{ flex: 1 }}>
            {order.lines.map((line) => `${line.quantity}× ${label(line.name, line.nameGu)}`).join(', ')}
          </AppText>
        </View>
        <View style={styles.row}>
          <Phone size={15} color={Theme.colors.textMuted} />
          <AppText
            variant="bodySmall"
            color={order.paymentMethod === 'cod' ? Theme.colors.warning : Theme.colors.success}
            style={{ flex: 1 }}
          >
            {order.paymentMethod === 'cod'
              ? t('screens.courier.cashCollect', { amount: currency(order.bill.total) })
              : t('screens.courier.prepaid')}
          </AppText>
        </View>
        {order.instructions ? (
          <AppText variant="caption" color={Theme.colors.warning}>
            {order.instructions}
          </AppText>
        ) : null}
      </View>

      {/* handover OTP */}
      {!isDelivered && step ? (
        <View style={styles.card}>
          <AppText variant="h3">{t('screens.courier.otpTitle')}</AppText>
          <AppText variant="caption" color={Theme.colors.textMuted}>
            {t('screens.courier.otpHint')}
          </AppText>
          <TextInput
            value={otp}
            onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 4))}
            placeholder={t('screens.courier.otpPlaceholder')}
            placeholderTextColor={Theme.colors.textMuted}
            keyboardType="number-pad"
            style={styles.input}
            accessibilityLabel={t('screens.courier.otpTitle')}
          />
          {otpError ? (
            <AppText variant="caption" color={Theme.colors.error}>
              {otpError}
            </AppText>
          ) : null}
          <AppButton title={t('screens.courier.stepDelivered')} onPress={verifyAndDeliver} />
        </View>
      ) : null}

      {/* breakdown */}
      <View style={styles.card}>
        <View style={styles.head}>
          <AlertTriangle size={17} color={Theme.colors.warning} />
          <AppText variant="h3" style={{ flex: 1 }}>
            {t('screens.courier.breakdown')}
          </AppText>
        </View>
        <AppText variant="caption" color={Theme.colors.textMuted}>
          {t('screens.courier.breakdownHint')}
        </AppText>

        {orderBreakdowns.length > 0 ? (
          orderBreakdowns.map((entry) => (
            <View key={entry.id} style={styles.breakdownRow}>
              <Check size={14} color={Theme.colors.success} strokeWidth={3} />
              <AppText variant="caption" color={Theme.colors.textSecondary} style={{ flex: 1 }}>
                {entry.reason} · {time(entry.at)}
              </AppText>
            </View>
          ))
        ) : null}

        {showBreakdown ? (
          <>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder={t('screens.courier.breakdownPlaceholder')}
              placeholderTextColor={Theme.colors.textMuted}
              style={styles.input}
              accessibilityLabel={t('screens.courier.breakdownReason')}
            />
            <AppButton
              variant="outline"
              title={t('screens.courier.report')}
              onPress={() => {
                if (!reason.trim()) return;
                reportBreakdown({ orderId: order.id, reason });
                setReason('');
                setShowBreakdown(false);
                showToast(t('screens.courier.reported'));
              }}
            />
          </>
        ) : (
          <AppButton variant="outline" title={t('screens.courier.report')} onPress={() => setShowBreakdown(true)} />
        )}

        <AppButton
          variant="text"
          title={t('screens.courier.helpline')}
          onPress={() => Linking.openURL('tel:1800200300').catch(() => showToast('1800 200 300'))}
        />
      </View>
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
  steps: { flexDirection: 'row', gap: Theme.spacing.sm },
  step: { flex: 1, alignItems: 'center', gap: 4 },
  stepDot: {
    width: 34,
    height: 34,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotOn: { backgroundColor: Theme.colors.success },
  card: {
    gap: Theme.spacing.sm,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  leg: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  legIcon: {
    width: 34,
    height: 34,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legConnector: { width: 2, height: 14, marginLeft: 16, backgroundColor: Theme.colors.border },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: { flexDirection: 'row', gap: Theme.spacing.md, marginTop: Theme.spacing.xs },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Theme.spacing.sm },
  input: {
    height: 48,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
    color: Theme.colors.text,
  },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
});
