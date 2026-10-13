import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Landmark,
  WalletCards,
  ShieldCheck,
  XCircle,
} from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, ScreenHeader } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import type { PaymentMethod } from '../../domain/types';

type Stage = 'idle' | 'processing' | 'failed';

const METHOD_ICONS: Record<PaymentMethod, typeof Banknote> = {
  upi: Landmark,
  card: CreditCard,
  wallet: WalletCards,
  cod: Banknote,
};

/**
 * Payment screen.
 *
 * This is the piece that was previously missing: it validates the chosen
 * method, shows a real processing state, can surface a failure with a retry,
 * and only then creates the order in the store so that LIVE TRACKING and
 * Orders have something real to show.
 */
export default function PaymentsScreen() {
  const router = useRouter();
  const { t, currency, language } = useLanguage();
  const { bill, cart, walletBalance, placeOrder, addMoney } = useAppStore();

  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);
  const walletShortfall = Math.max(0, bill.total - walletBalance);

  /** Deterministic validation — the failure path is reachable, not random. */
  const validate = (): string | null => {
    if (method === 'upi' && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
      return label('Enter a valid UPI ID (e.g. name@upi)', 'માન્ય UPI ID દાખલ કરો (દા.ત. name@upi)');
    }
    if (method === 'card') {
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        return label('Card number must be 16 digits', 'કાર્ડ નંબર 16 અંકનો હોવો જોઈએ');
      }
      const match = /^(\d{2})\/(\d{2})$/.exec(expiry.trim());
      if (!match || Number(match[1]) < 1 || Number(match[1]) > 12) {
        return label('Enter expiry as MM/YY', 'MM/YY સ્વરૂપે એક્સપાયરી દાખલ કરો');
      }
      if (cvv.length !== 3) return label('CVV must be 3 digits', 'CVV 3 અંકનો હોવો જોઈએ');
    }
    if (method === 'wallet' && walletShortfall > 0) {
      return t('flow.payment.insufficient', { amount: currency(walletShortfall) });
    }
    return null;
  };

  const handlePay = () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setStage('failed');
      return;
    }

    setError(null);
    setStage('processing');

    // Simulated gateway round-trip. Real integration would replace this block;
    // the surrounding state machine stays identical.
    setTimeout(() => {
      const order = placeOrder(method);
      setStage('idle');
      router.replace(`/order-confirmation?id=${order.id}`);
    }, 1400);
  };

  if (cart.length === 0 && stage !== 'processing') {
    return (
      <AppScrollScreen>
        <ScreenHeader
          title={t('flow.payment.title')}
          left={
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
              <ArrowLeft size={22} color={Theme.colors.text} />
            </Pressable>
          }
        />
        <View style={styles.card}>
          <AppText variant="h3" align="center">
            {t('flow.cart.empty')}
          </AppText>
          <AppButton
            title={t('flow.cart.browseRestaurants')}
            variant="outline"
            onPress={() => router.replace('/restaurants')}
            style={{ marginTop: Theme.spacing.lg }}
          />
        </View>
      </AppScrollScreen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      <AppScrollScreen
        footer={
          <View style={styles.footer}>
            <View style={{ flex: 1 }}>
              <AppText variant="caption">{t('flow.common.total')}</AppText>
              <AppText variant="h2">{currency(bill.total)}</AppText>
            </View>
            <View style={{ flex: 1.3 }}>
              <AppButton
                title={stage === 'processing' ? t('flow.payment.paying') : t('flow.payment.payNow', { amount: currency(bill.total) })}
                onPress={handlePay}
                isLoading={stage === 'processing'}
                disabled={stage === 'processing'}
              />
            </View>
          </View>
        }
      >
        <ScreenHeader
          title={t('flow.payment.title')}
          left={
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              accessibilityLabel={t('common.back')}
              disabled={stage === 'processing'}
            >
              <ArrowLeft size={22} color={Theme.colors.text} />
            </Pressable>
          }
        />

        {stage === 'processing' ? (
          <View style={styles.processingCard}>
            <ActivityIndicator color={Theme.colors.primary} size="large" />
            <AppText variant="h3" align="center" style={{ marginTop: Theme.spacing.lg }}>
              {t('flow.payment.paying')}
            </AppText>
            <AppText variant="bodySmall" align="center">
              {t('flow.payment.doNotClose')}
            </AppText>
          </View>
        ) : null}

        {stage === 'failed' ? (
          <Animated.View entering={FadeInDown.duration(Theme.motion.fast)} style={styles.failedCard}>
            <XCircle size={26} color={Theme.colors.error} />
            <View style={{ flex: 1 }}>
              <AppText variant="h3">{t('flow.payment.failed')}</AppText>
              <AppText variant="bodySmall">{error ?? t('flow.payment.failedBody')}</AppText>
            </View>
            <Pressable onPress={() => setStage('idle')} hitSlop={8}>
              <AppText variant="label" color={Theme.colors.primary}>
                {t('flow.payment.retry')}
              </AppText>
            </Pressable>
          </Animated.View>
        ) : null}

        {/* --- methods --- */}
        <View style={styles.card}>
          {(Object.keys(METHOD_ICONS) as PaymentMethod[]).map((key, index) => {
            const Icon = METHOD_ICONS[key];
            const active = method === key;
            const walletBlocked = key === 'wallet' && walletShortfall > 0;
            return (
              <Animated.View key={key} entering={FadeInDown.delay(index * 40).duration(Theme.motion.base)}>
                <Pressable
                  onPress={() => {
                    setMethod(key);
                    setStage('idle');
                    setError(null);
                  }}
                  style={styles.methodRow}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.methodIcon}>
                    <Icon size={19} color={Theme.colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="h3">{t(`flow.payment.${key}`)}</AppText>
                    <AppText variant="caption">
                      {key === 'wallet'
                        ? t('flow.payment.walletHint', { amount: currency(walletBalance) })
                        : key === 'cod'
                          ? t('flow.payment.codHint', { amount: currency(bill.total) })
                          : t(`flow.payment.${key}Hint`)}
                    </AppText>
                  </View>
                  {walletBlocked ? (
                    <AppText variant="caption" color={Theme.colors.error}>
                      {t('flow.wallet.shortBy', { amount: currency(walletShortfall) })}
                    </AppText>
                  ) : null}
                </Pressable>

                {/* method-specific fields */}
                {active && key === 'upi' ? (
                  <View style={styles.fieldGroup}>
                    <TextInput
                      value={upiId}
                      onChangeText={setUpiId}
                      placeholder={t('flow.payment.upiHint')}
                      placeholderTextColor={Theme.colors.textMuted}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={styles.input}
                    />
                  </View>
                ) : null}

                {active && key === 'card' ? (
                  <View style={styles.fieldGroup}>
                    <TextInput
                      value={cardNumber}
                      onChangeText={(v) => setCardNumber(v.replace(/[^\d ]/g, '').slice(0, 19))}
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor={Theme.colors.textMuted}
                      keyboardType="number-pad"
                      style={styles.input}
                    />
                    <View style={{ flexDirection: 'row', gap: Theme.spacing.sm }}>
                      <TextInput
                        value={expiry}
                        onChangeText={(v) => setExpiry(v.slice(0, 5))}
                        placeholder="MM/YY"
                        placeholderTextColor={Theme.colors.textMuted}
                        keyboardType="number-pad"
                        style={[styles.input, { flex: 1 }]}
                      />
                      <TextInput
                        value={cvv}
                        onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 3))}
                        placeholder="CVV"
                        placeholderTextColor={Theme.colors.textMuted}
                        keyboardType="number-pad"
                        secureTextEntry
                        style={[styles.input, { flex: 1 }]}
                      />
                    </View>
                  </View>
                ) : null}

                {active && key === 'wallet' && walletBlocked ? (
                  <View style={styles.fieldGroup}>
                    <AppButton
                      title={t('flow.payment.addMoney')}
                      variant="outline"
                      onPress={() => {
                        addMoney(walletShortfall);
                        setError(null);
                        setStage('idle');
                      }}
                    />
                  </View>
                ) : null}
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.secureRow}>
          <ShieldCheck size={15} color={Theme.colors.success} />
          <AppText variant="caption" style={{ flex: 1 }}>
            {t('flow.payment.secure')}
          </AppText>
        </View>

        {method === 'cod' ? (
          <View style={styles.codNote}>
            <AppText variant="bodySmall" color={Theme.colors.text}>
              {t('flow.payment.codConfirmed', { amount: currency(bill.total) })}
            </AppText>
          </View>
        ) : null}
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
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: Theme.colors.success },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: Theme.colors.success },
  methodIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldGroup: { gap: Theme.spacing.sm, paddingBottom: Theme.spacing.md },
  input: {
    height: 48,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surfaceSecondary,
    paddingHorizontal: Theme.spacing.md,
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.xs,
  },
  codNote: {
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
  },
  processingCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
  },
  failedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.primarySoft,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.error,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.layout.screenPaddingX,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Theme.colors.border,
  },
});
