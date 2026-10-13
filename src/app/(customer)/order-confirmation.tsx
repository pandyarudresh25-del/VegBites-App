import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import { Check, Package } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScreen, EmptyState } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';

/**
 * Order confirmation. Previously a static "success" screen that was not tied
 * to any order; it now resolves the order created by the payment step so the
 * id, total and ETA shown are real.
 */
export default function OrderConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { t, currency } = useLanguage();
  const { orders } = useAppStore();

  const order = useMemo(
    () => (id ? orders.find((o) => o.id === id) : orders[0]),
    [orders, id],
  );

  const scale = useSharedValue(0.6);
  useEffect(() => {
    scale.value = withDelay(120, withSpring(1, { damping: 11, stiffness: 160 }));
  }, [scale]);
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (!order) {
    return (
      <AppScreen>
        <EmptyState
          icon={<Package size={28} color={Theme.colors.primary} />}
          title={t('flow.orders.noActive')}
          body={t('flow.orders.noActiveHint')}
          action={<AppButton title={t('flow.notFound.cta')} onPress={() => router.replace('/home')} />}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={styles.content}>
        <Animated.View style={[styles.badge, badgeStyle]}>
          <Check size={38} color={Theme.colors.surface} strokeWidth={3} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(Theme.motion.base)} style={{ alignItems: 'center' }}>
          <AppText variant="h1" align="center">
            {t('orderConfirmation.title')}
          </AppText>
          <AppText variant="body" align="center" style={{ marginTop: Theme.spacing.sm }}>
            {t('checkout.successBody')}
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(Theme.motion.base)} style={styles.card}>
          <Row label={t('orderConfirmation.orderId')} value={`#${order.id}`} />
          <View style={styles.divider} />
          <Row label={t('orderConfirmation.estimatedDelivery')} value={t('flow.checkout.nowTime')} />
          <View style={styles.divider} />
          <Row label={t('flow.common.total')} value={currency(order.bill.total)} emphasize />
          {order.paymentMethod === 'cod' ? (
            <>
              <View style={styles.divider} />
              <AppText variant="caption" color={Theme.colors.primary}>
                {t('flow.orders.payCod', { amount: currency(order.bill.total) })}
              </AppText>
            </>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeIn.delay(400).duration(Theme.motion.base)} style={styles.actions}>
          <AppButton
            title={t('checkout.viewOrder')}
            onPress={() => router.replace(`/tracking/${order.id}`)}
          />
          <AppButton
            title={t('orderConfirmation.backToHome')}
            variant="outline"
            onPress={() => router.replace('/home')}
          />
        </Animated.View>
      </View>
    </AppScreen>
  );
}

const Row: React.FC<{ label: string; value: string; emphasize?: boolean }> = ({ label, value, emphasize }) => (
  <View style={styles.row}>
    <AppText variant="bodySmall">{label}</AppText>
    <AppText variant={emphasize ? 'price' : 'bodySmall'} color={emphasize ? Theme.colors.primary : Theme.colors.text}>
      {value}
    </AppText>
  </View>
);

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Theme.spacing.xl,
    paddingVertical: Theme.spacing.xxl,
  },
  badge: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: Theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.floating,
  },
  card: {
    alignSelf: 'stretch',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    ...Theme.shadows.soft,
    gap: Theme.spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Theme.colors.divider },
  actions: { alignSelf: 'stretch', gap: Theme.spacing.md },
});
