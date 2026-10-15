import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, MapPin, Clock, CalendarClock, UtensilsCrossed, Edit2 } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, ScreenHeader } from '../../components/AppScreen';
import { BillSummary, FooterTotal } from '../../components/BillSummary';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';

type Timing = 'now' | 'slot';

/**
 * Checkout. Everything on this screen comes from the store: the address is the
 * customer's selected address (not a hardcoded Ahmedabad flat) and the summary
 * is the actual cart, priced by `computeBill`.
 */
export default function CheckoutScreen() {
  const router = useRouter();
  const { t, language, currency } = useLanguage();
  const { cart, cartCount, bill, addresses, selectedAddress, selectAddress, isAuthed } = useAppStore();
  const [timing, setTiming] = useState<Timing>('now');

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  if (cart.length === 0) {
    return (
      <AppScrollScreen>
        <ScreenHeader
          title={t('checkout.title')}
          left={
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
              <ArrowLeft size={22} color={Theme.colors.text} />
            </Pressable>
          }
        />
        <View style={styles.emptyCard}>
          <UtensilsCrossed size={26} color={Theme.colors.primary} />
          <AppText variant="h3" align="center" style={{ marginTop: Theme.spacing.md }}>
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

  const addressLabel = selectedAddress
    ? t(`address.${selectedAddress.label === 'work' ? 'office' : selectedAddress.label}`)
    : t('flow.checkout.addAddress');

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      <AppScrollScreen
        footer={
          <FooterTotal total={bill.total}>
            <AppButton
              title={t('checkout.selectPayment')}
              onPress={() => router.push('/payments')}
            />
          </FooterTotal>
        }
      >
        <ScreenHeader
          title={t('checkout.title')}
          subtitle={t('flow.cart.itemsCount', { count: cartCount })}
          left={
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
              <ArrowLeft size={22} color={Theme.colors.text} />
            </Pressable>
          }
        />

        {/* --- delivery address --- */}
        <Animated.View entering={FadeInDown.duration(Theme.motion.base)} style={styles.card}>
          <View style={styles.cardHeader}>
            <AppText variant="h3">{t('flow.checkout.deliverTo')}</AppText>
            <Pressable
              onPress={() => router.push('/address')}
              style={styles.editButton}
              accessibilityRole="button"
            >
              <Edit2 size={13} color={Theme.colors.primary} />
              <AppText variant="caption" color={Theme.colors.primary}>
                {selectedAddress ? t('flow.checkout.change') : t('flow.checkout.addAddress')}
              </AppText>
            </Pressable>
          </View>

          {selectedAddress ? (
            <View style={styles.addressRow}>
              <View style={styles.iconBubble}>
                <MapPin size={18} color={Theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="h3">{addressLabel}</AppText>
                <AppText variant="bodySmall" style={{ marginTop: 2 }}>
                  {selectedAddress.line1}, {selectedAddress.line2}
                </AppText>
                <AppText variant="bodySmall">
                  {selectedAddress.city} – {selectedAddress.pincode}
                </AppText>
              </View>
            </View>
          ) : (
            <AppText variant="bodySmall">{t('flow.cart.emptyHint')}</AppText>
          )}

          {addresses.length > 1 ? (
            <View style={styles.chipRow}>
              {addresses.map((address) => {
                const active = address.id === selectedAddress?.id;
                return (
                  <Pressable
                    key={address.id}
                    onPress={() => selectAddress(address.id)}
                    style={[styles.chip, active && styles.chipActive]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                  >
                    <AppText variant="caption" color={active ? Theme.colors.primary : Theme.colors.textSecondary}>
                      {t(`address.${address.label === 'work' ? 'office' : address.label}`)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </Animated.View>

        {/* --- delivery timing --- */}
        <Animated.View entering={FadeInDown.delay(60).duration(Theme.motion.base)} style={styles.card}>
          <AppText variant="h3" style={{ marginBottom: Theme.spacing.md }}>
            {t('flow.checkout.deliveryTiming')}
          </AppText>
          <View style={{ gap: Theme.spacing.sm }}>
            <Pressable
              onPress={() => setTiming('now')}
              style={[styles.option, timing === 'now' && styles.optionActive]}
              accessibilityRole="radio"
              accessibilityState={{ selected: timing === 'now' }}
            >
              <Clock size={18} color={timing === 'now' ? Theme.colors.primary : Theme.colors.textMuted} />
              <View style={{ flex: 1 }}>
                <AppText variant="h3" color={timing === 'now' ? Theme.colors.text : Theme.colors.textSecondary}>
                  {t('flow.checkout.now')}
                </AppText>
                <AppText variant="caption">{t('flow.checkout.nowTime')}</AppText>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setTiming('slot')}
              style={[styles.option, timing === 'slot' && styles.optionActive]}
              accessibilityRole="radio"
              accessibilityState={{ selected: timing === 'slot' }}
            >
              <CalendarClock size={18} color={timing === 'slot' ? Theme.colors.primary : Theme.colors.textMuted} />
              <View style={{ flex: 1 }}>
                <AppText variant="h3" color={timing === 'slot' ? Theme.colors.text : Theme.colors.textSecondary}>
                  {t('flow.checkout.slot')}
                </AppText>
                <AppText variant="caption">{t('flow.checkout.slotTime')}</AppText>
              </View>
            </Pressable>
          </View>
        </Animated.View>

        {/* --- order summary --- */}
        <Animated.View entering={FadeInDown.delay(120).duration(Theme.motion.base)} style={styles.card}>
          <AppText variant="h3" style={{ marginBottom: Theme.spacing.md }}>
            {t('flow.checkout.orderSummary')}
          </AppText>
          {cart.map((line) => (
            <View key={line.id} style={styles.summaryRow}>
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
          {bill.discount > 0 ? (
            <View style={styles.savingsBanner}>
              <AppText variant="caption" color={Theme.colors.success}>
                {t('flow.checkout.savingsBanner', { amount: currency(bill.discount) })}
              </AppText>
            </View>
          ) : null}
        </Animated.View>

        <BillSummary bill={bill} />

        {!isAuthed ? (
          <AppText variant="caption" align="center" color={Theme.colors.textMuted}>
            {t('flow.cart.loginToCheckout')}
          </AppText>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.colors.primarySoft,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.sm,
  },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Theme.spacing.md },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: { flexDirection: 'row', gap: Theme.spacing.sm, marginTop: Theme.spacing.md, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  chipActive: { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primarySoft },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  optionActive: { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primarySoft },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  savingsBanner: {
    marginTop: Theme.spacing.sm,
    backgroundColor: Theme.colors.successSoft,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.sm,
  },
  emptyCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
  },
});
