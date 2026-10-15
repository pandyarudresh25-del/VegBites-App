import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, BellOff, CreditCard, Info, Package, Repeat } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import { STATUS_KEY } from '../../domain/types';

type Notice = {
  id: string;
  kind: 'order' | 'wallet' | 'subscription';
  at: number;
  title: string;
  body: string;
  href: string;
};

/**
 * Notification feed.
 *
 * Nothing here is decorative: every entry is derived from the customer's real
 * state (orders, wallet ledger, subscriptions), so the list is empty until they
 * actually place an order, top up the wallet or subscribe to a tiffin plan.
 * Tapping an entry opens the screen that owns that state.
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const { t, language, currency, date, time } = useLanguage();
  const { orders, walletTxns, subscriptions } = useAppStore();

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  // Built inline rather than memoised: the entries depend on the active language
  // (t()/date()/time()), so a memo would need those helpers as dependencies anyway,
  // and the list is capped at 20 rows.
  const build = (): Notice[] => {
    const fromOrders: Notice[] = orders.map((order) => {
      const stamp = order.timeline[order.status] ?? order.createdAt;
      const delivered = order.status === 'delivered';
      const cancelled = order.status === 'cancelled';
      return {
        id: `order-${order.id}`,
        kind: 'order' as const,
        at: stamp,
        title: cancelled
          ? t('screens.notifications.orderCancelled', { id: order.id })
          : delivered
            ? t('screens.notifications.orderDelivered', { id: order.id })
            : t('screens.notifications.orderOnTheWay', { id: order.id }),
        body: t(STATUS_KEY[order.status]),
        href: `/tracking/${order.id}`,
      };
    });

    const fromWallet: Notice[] = walletTxns.map((txn) => ({
      id: `txn-${txn.id}`,
      kind: 'wallet' as const,
      at: txn.createdAt,
      title: label(txn.note, txn.noteGu),
      body:
        txn.kind === 'debit'
          ? t('screens.notifications.walletDebit', { amount: currency(txn.amount) })
          : t('screens.notifications.walletCredit', { amount: currency(txn.amount) }),
      href: '/wallet',
    }));

    const fromSubs: Notice[] = subscriptions.map((sub) => ({
      id: `sub-${sub.id}`,
      kind: 'subscription' as const,
      at: sub.status === 'cancelled' ? sub.renewsAt : sub.startedAt,
      title: label(sub.planName, sub.planNameGu),
      body:
        sub.status === 'active'
          ? t('screens.notifications.subActive', { date: date(sub.renewsAt) })
          : sub.status === 'paused'
            ? t('screens.notifications.subPaused')
            : t('screens.notifications.subCancelled'),
      href: '/subscription',
    }));

    return [...fromOrders, ...fromWallet, ...fromSubs].sort((a, b) => b.at - a.at).slice(0, 20);
  };

  const notices = build();

  const iconFor = (kind: Notice['kind']) => {
    if (kind === 'order') return <Package size={20} color={Theme.colors.success} />;
    if (kind === 'subscription') return <Repeat size={20} color={Theme.colors.primary} />;
    return <CreditCard size={20} color={Theme.colors.primary} />;
  };

  const tintFor = (kind: Notice['kind']) =>
    kind === 'order' ? Theme.colors.successSoft : kind === 'subscription' ? Theme.colors.primarySoft : Theme.colors.surfaceHighlight;

  const back = (
    <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
      <ArrowLeft size={22} color={Theme.colors.text} />
    </Pressable>
  );

  if (notices.length === 0) {
    return (
      <AppScrollScreen>
        <ScreenHeader title={t('profile.notifications')} left={back} />
        <EmptyState
          icon={<Info size={28} color={Theme.colors.primary} />}
          title={t('screens.notifications.empty')}
          body={t('screens.notifications.emptyHint')}
          action={<AppButton title={t('screens.notifications.browse')} onPress={() => router.push('/home')} />}
        />
      </AppScrollScreen>
    );
  }

  return (
    <AppScrollScreen>
      <ScreenHeader
        title={t('profile.notifications')}
        subtitle={t('screens.notifications.subtitle')}
        left={back}
        right={<BellOff size={18} color={Theme.colors.textMuted} />}
      />
      <View style={styles.list}>
        {notices.map((notice, index) => (
          <Animated.View key={notice.id} entering={FadeInDown.delay(30 + index * 25).duration(Theme.motion.fast)}>
            <Pressable
              onPress={() => router.push(notice.href as never)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={[styles.iconBox, { backgroundColor: tintFor(notice.kind) }]}>{iconFor(notice.kind)}</View>
              <View style={styles.body}>
                <AppText variant="h3" numberOfLines={2}>
                  {notice.title}
                </AppText>
                <AppText variant="bodySmall" color={Theme.colors.textSecondary} numberOfLines={2}>
                  {notice.body}
                </AppText>
                <AppText variant="caption" color={Theme.colors.textMuted}>
                  {date(notice.at)} · {time(notice.at)}
                </AppText>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  list: { gap: Theme.spacing.sm },
  card: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cardPressed: { borderColor: Theme.colors.primary },
  iconBox: { width: 44, height: 44, borderRadius: Theme.borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 2 },
});
