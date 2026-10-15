import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Gift, Plus, RefreshCw, WalletCards } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, ScreenHeader, EmptyState } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import { PRICING, type WalletTxnKind } from '../../domain/types';

const QUICK_AMOUNTS = [200, 500, 1000, 2000];

const TXN_ICON: Record<WalletTxnKind, typeof Plus> = {
  credit: ArrowDownLeft,
  debit: ArrowUpRight,
  refund: RefreshCw,
  cashback: Gift,
};

/**
 * Wallet. Balance, add money (with validation) and the real transaction ledger,
 * all from the store — previously a static ₹245.50 card with no interactions.
 */
export default function WalletScreen() {
  const router = useRouter();
  const { t, language, currency, date } = useLanguage();
  const { walletBalance, walletTxns, addMoney } = useAppStore();

  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);
  const { min, max } = PRICING.walletAddRange;

  const handleAdd = (raw?: number) => {
    const value = raw ?? Number(amount);
    if (!Number.isFinite(value) || value < min || value > max) {
      setError(t('flow.wallet.invalidAmount', { min: currency(min), max: currency(max) }));
      return;
    }
    addMoney(value);
    setError(null);
    setAmount('');
    setToast(t('flow.wallet.added', { amount: currency(value) }));
    setTimeout(() => setToast(null), 2000);
  };

  const txnLabel = (kind: WalletTxnKind) =>
    kind === 'credit'
      ? t('flow.wallet.credit')
      : kind === 'debit'
        ? t('flow.wallet.debit')
        : kind === 'refund'
          ? t('flow.wallet.refund')
          : t('flow.wallet.cashback');

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      {toast ? (
        <Animated.View entering={FadeInDown.duration(Theme.motion.fast)} style={styles.toast}>
          <AppText variant="bodySmall" color={Theme.colors.surface}>
            {toast}
          </AppText>
        </Animated.View>
      ) : null}

      <AppScrollScreen contentStyle={{ gap: Theme.spacing.lg }}>
        <ScreenHeader
          title={t('nav.wallet')}
          left={
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
              <ArrowLeft size={22} color={Theme.colors.text} />
            </Pressable>
          }
        />

        {/* balance */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceIcon}>
            <WalletCards size={22} color={Theme.colors.surface} />
          </View>
          <AppText variant="caption" color={Theme.colors.surface} style={{ opacity: 0.9 }}>
            {t('flow.wallet.available')}
          </AppText>
          <AppText variant="display" color={Theme.colors.surface} style={{ marginTop: 2 }}>
            {currency(walletBalance)}
          </AppText>
          <AppText variant="caption" color={Theme.colors.surface} style={{ opacity: 0.8, marginTop: 4 }}>
            {t('flow.wallet.payWith')}
          </AppText>
        </View>

        {/* add money */}
        <View style={styles.card}>
          <AppText variant="h3">{t('flow.wallet.addMoney')}</AppText>
          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map((value) => (
              <Pressable
                key={value}
                onPress={() => handleAdd(value)}
                style={styles.quickChip}
                accessibilityRole="button"
              >
                <AppText variant="label" color={Theme.colors.primary}>
                  +{currency(value)}
                </AppText>
              </Pressable>
            ))}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              value={amount}
              onChangeText={(v) => {
                setAmount(v.replace(/\D/g, '').slice(0, 5));
                setError(null);
              }}
              placeholder={t('flow.wallet.amountLabel')}
              placeholderTextColor={Theme.colors.textMuted}
              keyboardType="number-pad"
              inputMode="numeric"
              style={styles.input}
              onSubmitEditing={() => handleAdd()}
              returnKeyType="done"
            />
            <Pressable onPress={() => handleAdd()} style={styles.addButton} accessibilityRole="button">
              <Plus size={16} color={Theme.colors.surface} />
              <AppText variant="label" color={Theme.colors.surface}>
                {t('flow.wallet.addMoney')}
              </AppText>
            </Pressable>
          </View>

          {error ? (
            <AppText variant="caption" color={Theme.colors.error}>
              {error}
            </AppText>
          ) : (
            <AppText variant="caption">
              {t('flow.wallet.invalidAmount', { min: currency(min), max: currency(max) })}
            </AppText>
          )}
        </View>

        {/* ledger */}
        <View style={{ gap: Theme.spacing.md }}>
          <AppText variant="h2">{t('flow.wallet.history')}</AppText>

          {walletTxns.length === 0 ? (
            <EmptyState
              icon={<WalletCards size={26} color={Theme.colors.primary} />}
              title={t('flow.wallet.none')}
              body={t('flow.wallet.noneHint')}
            />
          ) : (
            <View style={styles.ledger}>
              {walletTxns.map((txn, index) => {
                const Icon = TXN_ICON[txn.kind];
                const isCredit = txn.kind !== 'debit';
                return (
                  <Animated.View key={txn.id} entering={FadeInDown.delay(index * 30).duration(Theme.motion.fast)}>
                    <View style={styles.txnRow}>
                      <View style={[styles.txnIcon, { backgroundColor: isCredit ? Theme.colors.successSoft : Theme.colors.primarySoft }]}>
                        <Icon size={16} color={isCredit ? Theme.colors.success : Theme.colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText variant="bodySmall" color={Theme.colors.text} numberOfLines={1}>
                          {label(txn.note, txn.noteGu)}
                        </AppText>
                        <AppText variant="caption">
                          {date(txn.createdAt)} · {txnLabel(txn.kind)}
                        </AppText>
                      </View>
                      <AppText
                        variant="h3"
                        color={isCredit ? Theme.colors.success : Theme.colors.text}
                      >
                        {isCredit ? '+' : '−'}
                        {currency(txn.amount)}
                      </AppText>
                    </View>
                    {index < walletTxns.length - 1 ? <View style={styles.divider} /> : null}
                  </Animated.View>
                );
              })}
            </View>
          )}
        </View>

        <AppButton
          title={t('flow.cart.browseRestaurants')}
          variant="outline"
          onPress={() => router.push('/restaurants')}
        />
      </AppScrollScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: Theme.colors.text,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    ...Theme.shadows.medium,
  },
  balanceIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    gap: Theme.spacing.md,
    ...Theme.shadows.soft,
  },
  quickRow: { flexDirection: 'row', gap: Theme.spacing.sm, flexWrap: 'wrap' },
  quickChip: {
    paddingHorizontal: Theme.spacing.md,
    height: 34,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: { flexDirection: 'row', gap: Theme.spacing.sm },
  input: {
    flex: 1,
    height: 48,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surfaceSecondary,
    paddingHorizontal: Theme.spacing.md,
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Theme.spacing.lg,
    height: 48,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.primary,
  },
  ledger: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    ...Theme.shadows.soft,
  },
  txnRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md, paddingVertical: Theme.spacing.md },
  txnIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Theme.colors.divider },
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
