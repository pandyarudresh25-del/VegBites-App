import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Theme } from '../theme';
import { AppText } from './AppText';
import { useLanguage } from '../context/LanguageContext';
import type { Bill } from '../domain/types';

/**
 * Renders a `Bill` produced by `computeBill()`. Screens must never add up
 * totals themselves — that is how the old cart screen drifted out of sync
 * with the actual items.
 */
export const BillSummary: React.FC<{
  bill: Bill;
  /** Compact hides the sub-line when the amount is zero. */
  compact?: boolean;
}> = ({ bill, compact = true }) => {
  const { t, currency } = useLanguage();

  const allRows: { label: string; value: number; tone?: 'success' }[] = [
    { label: t('flow.common.subtotal'), value: bill.itemTotal },
    { label: t('flow.common.delivery'), value: bill.deliveryFee },
    { label: t('flow.common.platformFee'), value: bill.platformFee },
    { label: t('flow.common.taxes'), value: bill.taxes },
    { label: t('flow.common.discount'), value: -bill.discount, tone: 'success' },
  ];
  // Compact mode hides zero-value lines so the card doesn't list "Discount ₹0".
  const rows = allRows.filter((row) => !(compact && row.value === 0));

  return (
    <View style={styles.card}>
      <AppText variant="h3" style={{ marginBottom: Theme.spacing.md }}>
        {t('flow.common.grandTotal')}
      </AppText>

      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <AppText variant="bodySmall">{row.label}</AppText>
          <AppText
            variant="bodySmall"
            color={row.tone === 'success' ? Theme.colors.success : Theme.colors.textSecondary}
          >
            {row.value < 0 ? `− ${currency(Math.abs(row.value))}` : currency(row.value)}
          </AppText>
        </View>
      ))}

      {bill.couponCode ? (
        <View style={styles.couponTag}>
          <AppText variant="caption" color={Theme.colors.success}>
            {t('flow.cart.couponApplied', { code: bill.couponCode })}
          </AppText>
        </View>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.row}>
        <AppText variant="h3">{t('flow.common.grandTotal')}</AppText>
        <AppText variant="h2" color={Theme.colors.text}>
          {currency(bill.total)}
        </AppText>
      </View>
    </View>
  );
};

/** Total row used above a sticky CTA button. */
export const FooterTotal: React.FC<{ total: number; savings?: number; children?: React.ReactNode }> = ({
  total,
  savings,
  children,
}) => {
  const { t, currency } = useLanguage();
  return (
    <View style={styles.footer}>
      <View style={{ flex: 1 }}>
        <AppText variant="caption">{t('flow.common.total')}</AppText>
        <AppText variant="h2">{currency(total)}</AppText>
        {savings && savings > 0 ? (
          <AppText variant="caption" color={Theme.colors.success}>
            {t('flow.cart.savings', { amount: currency(savings) })}
          </AppText>
        ) : null}
      </View>
      <View style={{ flex: 1.4 }}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    ...Theme.shadows.soft,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.md,
  },
  couponTag: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.successSoft,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
    marginTop: Theme.spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.layout.screenPaddingX,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Theme.colors.border,
    gap: Theme.spacing.md,
  },
});
