import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowRight,
  BadgeIndianRupee,
  Bike,
  CircleDot,
  MapPin,
  Navigation,
  PackageCheck,
  Phone,
  Power,
  ShieldAlert,
} from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import { PAYOUT_PER_DELIVERY, startOfToday } from '../../domain/types';
import { SEED_RESTAURANTS } from '../../data/catalogue';

/**
 * Partner dashboard: availability switch, the deliveries waiting to be claimed,
 * the one being carried right now, and today's payout. Everything is derived
 * from real orders — a delivery appears the moment a kitchen marks it packed.
 */
export default function DeliveryDashboardScreen() {
  const router = useRouter();
  const { t, language, currency, count, time } = useLanguage();
  const {
    user,
    courierOnline,
    setCourierOnline,
    deliveryQueue,
    completedDeliveries,
    acceptDelivery,
    setCourierStep,
    courierSteps,
    reduceMotion,
  } = useAppStore();

  const [toast, setToast] = useState<string | null>(null);

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);
  const enter = (delay: number) => (reduceMotion ? undefined : FadeInDown.delay(delay).duration(Theme.motion.base));

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 1600);
  };

  /** Claimed by this partner and not yet delivered. */
  const active = useMemo(
    () => deliveryQueue.find((order) => courierSteps[order.id] && order.status !== 'delivered'),
    [deliveryQueue, courierSteps],
  );

  /** Waiting for a partner: packed, but nobody has claimed it. */
  const available = useMemo(
    () => deliveryQueue.filter((order) => order.status === 'packed' && !courierSteps[order.id]),
    [deliveryQueue, courierSteps],
  );

  const todayStart = useMemo(() => startOfToday(), []);
  const todayCount = completedDeliveries.filter((order) => order.createdAt >= todayStart).length;

  /** Real distance from the kitchen record — never an invented number. */
  const distanceOf = (restaurantId?: string) => {
    const km = SEED_RESTAURANTS.find((restaurant) => restaurant.id === restaurantId)?.distanceKm;
    return km == null ? null : t('screens.courier.distance', { km: count(km) });
  };

  if (!user) {
    return (
      <AppScrollScreen>
        <ScreenHeader title={t('screens.courier.dashTitle')} />
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
      {toast ? (
        <Animated.View entering={enter(0)} style={styles.toast}>
          <AppText variant="bodySmall" color={Theme.colors.surface}>
            {toast}
          </AppText>
        </Animated.View>
      ) : null}

      <ScreenHeader
        title={t('screens.courier.dashTitle')}
        subtitle={t('screens.courier.greeting', { name: user.name })}
        right={
          <Pressable
            onPress={() => {
              setCourierOnline(!courierOnline);
              showToast(courierOnline ? t('screens.courier.offline') : t('screens.courier.online'));
            }}
            style={[styles.power, courierOnline && styles.powerOn]}
            accessibilityRole="switch"
            accessibilityState={{ checked: courierOnline }}
            accessibilityLabel={courierOnline ? t('screens.courier.goOffline') : t('screens.courier.goOnline')}
          >
            <Power size={16} color={courierOnline ? Theme.colors.surface : Theme.colors.textMuted} />
          </Pressable>
        }
      />

      {/* availability */}
      <View style={[styles.statusCard, courierOnline ? styles.statusOn : styles.statusOff]}>
        <CircleDot size={16} color={courierOnline ? Theme.colors.success : Theme.colors.textMuted} />
        <View style={{ flex: 1 }}>
          <AppText variant="h3">{courierOnline ? t('screens.courier.online') : t('screens.courier.offline')}</AppText>
          <AppText variant="caption" color={Theme.colors.textMuted}>
            {courierOnline ? t('screens.courier.onlineHint') : t('screens.courier.offlineHint')}
          </AppText>
        </View>
        <AppButton
          fullWidth={false}
          variant={courierOnline ? 'outline' : 'primary'}
          title={courierOnline ? t('screens.courier.goOffline') : t('screens.courier.goOnline')}
          onPress={() => setCourierOnline(!courierOnline)}
        />
      </View>

      {/* payout so far */}
      <Animated.View entering={enter(60)} style={styles.payCard}>
        <View style={styles.rowBetween}>
          <AppText variant="caption" color={Theme.colors.surface} style={styles.dim}>
            {t('screens.courier.today')}
          </AppText>
          <BadgeIndianRupee size={16} color={Theme.colors.surface} />
        </View>
        <AppText variant="h1" color={Theme.colors.surface}>
          {currency(todayCount * PAYOUT_PER_DELIVERY)}
        </AppText>
        <AppText variant="caption" color={Theme.colors.surface} style={styles.dim}>
          {t('screens.courier.deliveriesDone')} {todayCount} · {t('screens.courier.perDelivery')}{' '}
          {currency(PAYOUT_PER_DELIVERY)}
        </AppText>
      </Animated.View>

      {/* active delivery */}
      <AppText variant="h3">{t('screens.courier.activeDelivery')}</AppText>
      {active ? (
        <Animated.View entering={enter(100)}>
          <Pressable
            onPress={() => router.push(`/delivery/delivery/${active.id}` as never)}
            style={styles.activeCard}
            accessibilityRole="button"
          >
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <PackageCheck size={18} color={Theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="h3">#{active.id}</AppText>
                <AppText variant="caption" color={Theme.colors.textMuted} numberOfLines={1}>
                  {active.restaurantName} → {active.address.line1}
                </AppText>
              </View>
              <ArrowRight size={16} color={Theme.colors.textMuted} />
            </View>

            <View style={styles.stepRow}>
              {[
                { key: 'assigned', labelKey: 'screens.courier.stepAssigned' },
                { key: 'reachedVendor', labelKey: 'screens.courier.stepReachedVendor' },
                { key: 'received', labelKey: 'screens.courier.stepReceived' },
                { key: 'reachedCustomer', labelKey: 'screens.courier.stepReachedCustomer' },
                { key: 'delivered', labelKey: 'screens.courier.stepDelivered' },
              ].map((step) => {
                const done = courierSteps[active.id] === step.key || active.status === 'delivered';
                return (
                  <View key={step.key} style={[styles.dot, done && styles.dotOn]}>
                    <AppText variant="caption" color={done ? Theme.colors.surface : Theme.colors.textMuted}>
                      {t(step.labelKey)}
                    </AppText>
                  </View>
                );
              })}
            </View>

            <View style={styles.actionRow}>
              <AppButton
                variant="outline"
                title={t('screens.courier.call')}
                onPress={() => showToast(active.address.phone)}
              />
              <AppButton
                title={t('screens.courier.navigate')}
                onPress={() => router.push(`/delivery/delivery/${active.id}` as never)}
              />
            </View>
          </Pressable>
        </Animated.View>
      ) : (
        <EmptyState
          icon={<Bike size={24} color={Theme.colors.primary} />}
          title={t('screens.courier.noActive')}
          body={t('screens.courier.noActiveHint')}
        />
      )}

      {/* available deliveries */}
      <AppText variant="h3">{t('screens.courier.available')}</AppText>
      {available.length === 0 ? (
        <EmptyState
          icon={<Navigation size={24} color={Theme.colors.primary} />}
          title={t('screens.courier.noAvailable')}
          body={t('screens.courier.noAvailableHint')}
        />
      ) : (
        available.map((order, index) => (
          <Animated.View key={order.id} entering={enter(140 + index * 40)}>
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <MapPin size={17} color={Theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="label">#{order.id}</AppText>
                  <AppText variant="caption" color={Theme.colors.textMuted} numberOfLines={1}>
                    {order.restaurantName} → {order.address.line1}
                  </AppText>
                  <AppText variant="caption" color={Theme.colors.textMuted}>
                    {[distanceOf(order.restaurantId), time(order.createdAt)].filter(Boolean).join(' · ')}
                  </AppText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <AppText variant="price">{currency(PAYOUT_PER_DELIVERY)}</AppText>
                  <AppText variant="caption" color={Theme.colors.textMuted}>
                    {t('screens.courier.payout')}
                  </AppText>
                </View>
              </View>

              <AppText variant="caption" color={order.paymentMethod === 'cod' ? Theme.colors.warning : Theme.colors.success}>
                {order.paymentMethod === 'cod'
                  ? t('screens.courier.cashCollect', { amount: currency(order.bill.total) })
                  : t('screens.courier.prepaid')}
              </AppText>

              <AppButton
                title={t('screens.courier.accept')}
                onPress={() => {
                  acceptDelivery(order.id);
                  setCourierStep(order.id, 'assigned');
                  showToast(t('screens.courier.accepted'));
                  router.push(`/delivery/delivery/${order.id}` as never);
                }}
              />
            </View>
          </Animated.View>
        ))
      )}

      {/* quick help */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <AppButton
            variant="outline"
            title={t('screens.courier.helpline')}
            onPress={() => showToast(t('screens.courier.helpline'))}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppButton
            variant="outline"
            title={t('screens.courier.breakdown')}
            onPress={() => router.push('/delivery/profile' as never)}
          />
        </View>
      </View>

      <View style={styles.noteRow}>
        <ShieldAlert size={14} color={Theme.colors.textMuted} />
        <AppText variant="caption" color={Theme.colors.textMuted} style={{ flex: 1 }}>
          {t('screens.courier.breakdownHint')}
        </AppText>
        <Phone size={14} color={Theme.colors.textMuted} />
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
  power: {
    width: 38,
    height: 38,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerOn: { backgroundColor: Theme.colors.success },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
  },
  statusOn: { borderColor: Theme.colors.success, backgroundColor: Theme.colors.successSoft },
  statusOff: { borderColor: Theme.colors.border, backgroundColor: Theme.colors.surface },
  payCard: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.xs,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dim: { opacity: 0.9 },
  activeCard: {
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.surface,
  },
  card: {
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
  stepRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Theme.spacing.sm },
  dot: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.surfaceSecondary,
  },
  dotOn: { backgroundColor: Theme.colors.success },
  actionRow: { flexDirection: 'row', gap: Theme.spacing.md },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
});
