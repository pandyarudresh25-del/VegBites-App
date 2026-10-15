import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, CalendarClock, CalendarDays, Pause, Play, RefreshCw, SkipForward, X, UtensilsCrossed } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, ScreenHeader, EmptyState } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import type { Subscription } from '../../domain/types';

/**
 * Subscription management.
 *
 * Pause / resume / skip / cancel all mutate the store and are reachable from the
 * Profile screen and the Tiffin tab. Cancel is confirmed inline (Alert.alert
 * does nothing on react-native-web).
 */
export default function SubscriptionScreen() {
  const router = useRouter();
  const { t, language, currency, date } = useLanguage();
  const { subscriptions, setSubscriptionStatus, skipNextDelivery, walletBalance } = useAppStore();

  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const statusColor = (status: Subscription['status']) =>
    status === 'active' ? Theme.colors.success : status === 'paused' ? Theme.colors.primary : Theme.colors.textMuted;

  const statusKey = (status: Subscription['status']) =>
    status === 'active' ? 'flow.subs.active' : status === 'paused' ? 'flow.subs.paused' : 'flow.subs.cancelled';

  if (subscriptions.length === 0) {
    return (
      <AppScrollScreen>
        <ScreenHeader
          title={t('nav.subscriptions')}
          left={
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
              <ArrowLeft size={22} color={Theme.colors.text} />
            </Pressable>
          }
        />
        <EmptyState
          icon={<UtensilsCrossed size={28} color={Theme.colors.primary} />}
          title={t('flow.subs.none')}
          body={t('flow.subs.noneHint')}
          action={<AppButton title={t('flow.subs.browse')} onPress={() => router.push('/tiffins')} />}
        />
      </AppScrollScreen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      {toast ? (
        <Animated.View entering={FadeInDown.duration(Theme.motion.fast)} style={styles.toast}>
          <AppText variant="bodySmall" color={Theme.colors.surface}>
            {toast}
          </AppText>
        </Animated.View>
      ) : null}

      <AppScrollScreen contentStyle={{ gap: Theme.spacing.md }}>
        <ScreenHeader
          title={t('nav.subscriptions')}
          subtitle={t('flow.subs.subtitle')}
          left={
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
              <ArrowLeft size={22} color={Theme.colors.text} />
            </Pressable>
          }
        />

        {subscriptions.map((subscription, index) => {
          const mealsLeft = Math.max(0, subscription.mealsTotal - subscription.mealsUsed);
          const progress = subscription.mealsTotal > 0 ? subscription.mealsUsed / subscription.mealsTotal : 0;
          const isActive = subscription.status === 'active';

          return (
            <Animated.View key={subscription.id} entering={FadeInDown.delay(index * 60).duration(Theme.motion.base)}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="h2">{label(subscription.planName, subscription.planNameGu)}</AppText>
                    <AppText variant="caption">
                      {t('flow.subs.renewsOn', { date: date(subscription.renewsAt) })}
                    </AppText>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: statusColor(subscription.status) }]}>
                    <AppText variant="caption" color={Theme.colors.surface}>
                      {t(statusKey(subscription.status))}
                    </AppText>
                  </View>
                </View>

                {/* meal progress */}
                <View style={styles.progressBlock}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
                  </View>
                  <AppText variant="caption">{t('flow.subs.mealsLeft', { count: mealsLeft })}</AppText>
                </View>

                <View style={styles.nextRow}>
                  <CalendarClock size={15} color={Theme.colors.primary} />
                  <AppText variant="bodySmall">
                    {t('flow.subs.nextDelivery', { date: date(subscription.nextDeliveryAt) })}
                  </AppText>
                </View>

                {/* actions */}
                {isActive ? (
                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => {
                        skipNextDelivery(subscription.id);
                        showToast(t('flow.subs.skipped'));
                      }}
                      style={styles.actionButton}
                      accessibilityRole="button"
                    >
                      <SkipForward size={14} color={Theme.colors.text} />
                      <AppText variant="caption">{t('flow.subs.skip')}</AppText>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        setSubscriptionStatus(subscription.id, 'paused');
                        showToast(t('flow.subs.pausedToast'));
                      }}
                      style={styles.actionButton}
                      accessibilityRole="button"
                    >
                      <Pause size={14} color={Theme.colors.text} />
                      <AppText variant="caption">{t('flow.subs.pause')}</AppText>
                    </Pressable>
                  </View>
                ) : subscription.status === 'paused' ? (
                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => {
                        setSubscriptionStatus(subscription.id, 'active');
                        showToast(t('flow.subs.resumedToast'));
                      }}
                      style={[styles.actionButton, styles.actionPrimary]}
                      accessibilityRole="button"
                    >
                      <Play size={14} color={Theme.colors.surface} />
                      <AppText variant="caption" color={Theme.colors.surface}>
                        {t('flow.subs.resume')}
                      </AppText>
                    </Pressable>
                  </View>
                ) : null}

                {subscription.status !== 'cancelled' ? (
                  confirmCancel === subscription.id ? (
                    <View style={styles.confirmRow}>
                      <AppText variant="caption" style={{ flex: 1 }}>
                        {t('flow.orders.cancelConfirm')}
                      </AppText>
                      <Pressable
                        onPress={() => {
                          setSubscriptionStatus(subscription.id, 'cancelled');
                          setConfirmCancel(null);
                          showToast(t('flow.subs.cancelledMsg'));
                        }}
                      >
                        <AppText variant="label" color={Theme.colors.error}>
                          {t('common.cancel')}
                        </AppText>
                      </Pressable>
                      <Pressable onPress={() => setConfirmCancel(null)} hitSlop={8}>
                        <X size={15} color={Theme.colors.textSecondary} />
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable onPress={() => setConfirmCancel(subscription.id)} style={styles.cancelLink}>
                      <AppText variant="caption" color={Theme.colors.error}>
                        {t('flow.subs.cancel')}
                      </AppText>
                    </Pressable>
                  )
                ) : null}
              </View>
            </Animated.View>
          );
        })}

        <View style={{ gap: Theme.spacing.md, marginTop: Theme.spacing.sm }}>
          <AppButton
            title={t('flow.subs.switchPlan')}
            variant="outline"
            onPress={() => router.push('/tiffins')}
          />
          <View style={styles.footerRow}>
            <CalendarDays size={14} color={Theme.colors.textMuted} />
            <AppText variant="caption">
              {t('flow.payment.walletHint', { amount: currency(walletBalance) })}
            </AppText>
            <RefreshCw size={13} color={Theme.colors.primary} onPress={() => router.push('/wallet')} />
          </View>
        </View>
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
    gap: Theme.spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Theme.spacing.md },
  statusPill: { paddingHorizontal: Theme.spacing.sm, paddingVertical: 3, borderRadius: Theme.borderRadius.pill },
  progressBlock: { gap: Theme.spacing.sm },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: Theme.colors.surfaceSecondary, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: Theme.colors.success },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  actions: { flexDirection: 'row', gap: Theme.spacing.sm },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  actionPrimary: { backgroundColor: Theme.colors.success, borderColor: Theme.colors.success },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.primarySoft,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.sm,
  },
  cancelLink: { alignItems: 'center', paddingVertical: Theme.spacing.xs },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Theme.spacing.sm },
  toast: {
    position: 'absolute',
    top: Theme.spacing.huge,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: Theme.colors.text,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
  },
});
