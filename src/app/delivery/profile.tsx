import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Bike, CircleDot, Phone, Power, ShieldAlert, TriangleAlert, UserRound, Wrench } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import { startOfToday } from '../../domain/types';

/** Support line shown to the partner — same number the customer app publishes. */
const HELPLINE = '1800200300';

/**
 * Partner profile: who is signed in, the vehicle on file, the availability
 * switch, the place to report a breakdown, the log of issues already reported,
 * and a confirmed sign-out. The vehicle comes from the courier record attached
 * to this partner's own deliveries, so nothing here is invented.
 */
export default function DeliveryProfileScreen() {
  const router = useRouter();
  const { t, date, time } = useLanguage();
  const {
    user,
    courierOnline,
    setCourierOnline,
    deliveryQueue,
    completedDeliveries,
    breakdowns,
    reportBreakdown,
    signOut,
    reduceMotion,
  } = useAppStore();

  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const enter = (delay: number) =>
    reduceMotion ? undefined : FadeInDown.delay(delay).duration(Theme.motion.base);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 1800);
  };

  /** The courier record on this partner's most recent delivery, if any. */
  const vehicle = useMemo(() => {
    const fromQueue = deliveryQueue.find((order) => order.courier);
    const fromHistory = completedDeliveries.find((order) => order.courier);
    return (fromQueue ?? fromHistory)?.courier ?? null;
  }, [deliveryQueue, completedDeliveries]);

  const todayIssues = useMemo(
    () => breakdowns.filter((entry) => entry.at >= startOfToday()).length,
    [breakdowns],
  );

  if (!user) {
    return (
      <AppScrollScreen>
        <ScreenHeader title={t('screens.courier.profileTitle')} />
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

      <ScreenHeader title={t('screens.courier.profileTitle')} />

      {/* identity */}
      <Animated.View entering={enter(40)} style={styles.identity}>
        <View style={styles.avatar}>
          <UserRound size={26} color={Theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="h2">{user.name}</AppText>
          <AppText variant="caption" color={Theme.colors.textMuted}>
            {t('screens.courier.appName')} · {t('screens.courier.memberSince')} {date(user.memberSince)}
          </AppText>
          {vehicle ? (
            <AppText variant="caption" color={Theme.colors.textMuted}>
              {t('screens.courier.partnerRating')} ★ {vehicle.rating.toFixed(1)}
            </AppText>
          ) : null}
        </View>
      </Animated.View>

      {/* vehicle on file */}
      {vehicle ? (
        <Animated.View entering={enter(70)} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <Bike size={17} color={Theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="label">{t('screens.courier.vehicle')}</AppText>
              <AppText variant="caption" color={Theme.colors.textMuted}>
                {vehicle.vehicle} · {t('screens.courier.plate')} {vehicle.plate}
              </AppText>
            </View>
          </View>
        </Animated.View>
      ) : null}

      {/* availability */}
      <Animated.View entering={enter(100)} style={styles.card}>
        <View style={styles.row}>
          <CircleDot size={16} color={courierOnline ? Theme.colors.success : Theme.colors.textMuted} />
          <View style={{ flex: 1 }}>
            <AppText variant="h3">{t('screens.courier.status')}</AppText>
            <AppText variant="caption" color={Theme.colors.textMuted}>
              {courierOnline ? t('screens.courier.onlineHint') : t('screens.courier.offlineHint')}
            </AppText>
          </View>
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
        </View>
      </Animated.View>

      {/* report a breakdown */}
      <Animated.View entering={enter(130)} style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, styles.iconWarn]}>
            <Wrench size={17} color={Theme.colors.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="h3">{t('screens.courier.breakdown')}</AppText>
            <AppText variant="caption" color={Theme.colors.textMuted}>
              {t('screens.courier.breakdownHint')}
            </AppText>
          </View>
        </View>

        <AppText variant="label">{t('screens.courier.breakdownReason')}</AppText>
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder={t('screens.courier.breakdownPlaceholder')}
          placeholderTextColor={Theme.colors.textMuted}
          style={styles.input}
          accessibilityLabel={t('screens.courier.breakdownReason')}
        />
        <AppButton
          title={t('screens.courier.report')}
          disabled={reason.trim().length < 3}
          onPress={() => {
            reportBreakdown({ reason: reason.trim() });
            setReason('');
            showToast(t('screens.courier.reported'));
          }}
        />
        <AppText variant="caption" color={Theme.colors.textMuted}>
          {t('screens.courier.reportedHint')}
        </AppText>
      </Animated.View>

      {/* reported issues log */}
      <View style={styles.row}>
        <AppText variant="h3" style={{ flex: 1 }}>
          {t('screens.courier.breakdownLog')}
        </AppText>
        {breakdowns.length > 0 ? (
          <AppText variant="caption" color={Theme.colors.textMuted}>
            {todayIssues} · {t('screens.courier.today')}
          </AppText>
        ) : null}
      </View>

      {breakdowns.length === 0 ? (
        <EmptyState
          icon={<TriangleAlert size={24} color={Theme.colors.primary} />}
          title={t('screens.courier.noBreakdowns')}
          body={t('screens.courier.breakdownHint')}
        />
      ) : (
        breakdowns.map((entry, index) => (
          <Animated.View key={entry.id} entering={enter(160 + index * 40)} style={styles.logRow}>
            <View style={[styles.iconWrap, styles.iconWarn]}>
              <TriangleAlert size={16} color={Theme.colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="label">{entry.reason}</AppText>
              <AppText variant="caption" color={Theme.colors.textMuted}>
                {entry.orderId ? `#${entry.orderId} · ` : ''}
                {date(entry.at)} · {time(entry.at)}
              </AppText>
            </View>
          </Animated.View>
        ))
      )}

      {/* helpline */}
      <AppButton
        variant="outline"
        title={t('screens.courier.helpline')}
        rightIcon={<Phone size={16} color={Theme.colors.primary} />}
        onPress={() =>
          Linking.openURL(`tel:${HELPLINE}`).catch(() => showToast('1800 200 300'))
        }
      />

      {/* sign out */}
      {confirming ? (
        <Animated.View entering={enter(60)} style={styles.confirmCard}>
          <AppText variant="h3">{t('screens.courier.signOutConfirm')}</AppText>
          <View style={styles.confirmActions}>
            <View style={{ flex: 1 }}>
              <AppButton variant="outline" title={t('common.cancel')} onPress={() => setConfirming(false)} />
            </View>
            <View style={{ flex: 1 }}>
              <AppButton
                title={t('screens.courier.signOut')}
                onPress={() => {
                  setConfirming(false);
                  signOut();
                }}
              />
            </View>
          </View>
        </Animated.View>
      ) : (
        <AppButton variant="text" title={t('screens.courier.signOut')} onPress={() => setConfirming(true)} />
      )}

      <View style={styles.noteRow}>
        <ShieldAlert size={14} color={Theme.colors.textMuted} />
        <AppText variant="caption" color={Theme.colors.textMuted} style={{ flex: 1 }}>
          {t('screens.courier.payoutNote')} · {t('screens.courier.cashNote')}
        </AppText>
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
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
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
  iconWarn: { backgroundColor: Theme.colors.warningSoft },
  power: {
    width: 38,
    height: 38,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerOn: { backgroundColor: Theme.colors.success },
  input: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    color: Theme.colors.text,
    backgroundColor: Theme.colors.background,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  confirmCard: {
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.error,
    backgroundColor: Theme.colors.errorSoft,
  },
  confirmActions: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
});
