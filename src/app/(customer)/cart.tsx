import React, { useState } from 'react';
import { View, StyleSheet, Image, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { ArrowLeft, ShoppingBag, Tag, X, UtensilsCrossed } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, ScreenHeader, EmptyState } from '../../components/AppScreen';
import { QuantityStepper } from '../../components/QuantityStepper';
import { BillSummary, FooterTotal } from '../../components/BillSummary';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import { PRICING } from '../../domain/types';

export default function CartScreen() {
  const router = useRouter();
  const { t, language, currency } = useLanguage();
  const {
    cart,
    cartCount,
    itemTotal,
    bill,
    couponCode,
    setQuantity,
    removeLine,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useAppStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const remainingForFreeDelivery = Math.max(0, PRICING.freeDeliveryOver - itemTotal);
  const freeDeliveryProgress = Math.min(1, itemTotal / PRICING.freeDeliveryOver);
  const savings = bill.discount;

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const ok = applyCoupon(code);
    setCouponError(ok ? null : t('flow.cart.couponInvalid'));
    setCouponSuccess(ok ? t('flow.cart.couponApplied', { code }) : null);
    if (ok) setCouponInput('');
  };

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  // ------------------------------------------------------------- empty state
  if (cart.length === 0) {
    return (
      <AppScrollScreen>
        <ScreenHeader
          title={t('flow.tabs.cart')}
          left={
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
              <ArrowLeft size={22} color={Theme.colors.text} />
            </Pressable>
          }
        />
        <EmptyState
          icon={<ShoppingBag size={30} color={Theme.colors.primary} />}
          title={t('flow.cart.empty')}
          body={t('flow.cart.emptyHint')}
          action={
            <View style={{ gap: Theme.spacing.md }}>
              <AppButton title={t('flow.cart.browseRestaurants')} onPress={() => router.push('/restaurants')} />
              <AppButton
                title={t('flow.cart.browseTiffin')}
                variant="outline"
                onPress={() => router.push('/tiffins')}
              />
            </View>
          }
        />
      </AppScrollScreen>
    );
  }

  // ------------------------------------------------------------------ filled
  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      <AppScrollScreen
        contentStyle={{ paddingBottom: Theme.spacing.xxl }}
        footer={
          <FooterTotal total={bill.total} savings={savings}>
            <AppButton
              title={t('cart.proceedToCheckout')}
              onPress={() => router.push('/checkout')}
            />
          </FooterTotal>
        }
      >
        <ScreenHeader
          title={t('flow.tabs.cart')}
          subtitle={t('flow.cart.itemsCount', { count: cartCount })}
          left={
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
              <ArrowLeft size={22} color={Theme.colors.text} />
            </Pressable>
          }
          right={
            confirmingClear ? (
              <Pressable onPress={() => setConfirmingClear(false)} hitSlop={10}>
                <X size={20} color={Theme.colors.textSecondary} />
              </Pressable>
            ) : (
              <Pressable onPress={() => setConfirmingClear(true)} hitSlop={10}>
                <AppText variant="caption" color={Theme.colors.error}>
                  {t('flow.cart.clearCart')}
                </AppText>
              </Pressable>
            )
          }
        />

        {/* Inline confirm — Alert.alert is a no-op on react-native-web. */}
        {confirmingClear ? (
          <Animated.View entering={FadeInDown.duration(Theme.motion.fast)} style={styles.confirmBar}>
            <AppText variant="bodySmall" style={{ flex: 1 }}>
              {t('flow.cart.clearConfirm')}
            </AppText>
            <Pressable
              onPress={() => {
                clearCart();
                setConfirmingClear(false);
              }}
            >
              <AppText variant="label" color={Theme.colors.error}>
                {t('common.remove')}
              </AppText>
            </Pressable>
          </Animated.View>
        ) : null}

        {/* --- free delivery nudge --- */}
        <View style={styles.deliveryCard}>
          <AppText variant="bodySmall" color={Theme.colors.text}>
            {remainingForFreeDelivery > 0
              ? t('flow.cart.freeDeliveryOver', { amount: currency(remainingForFreeDelivery) })
              : t('flow.cart.freeDeliveryUnlocked')}
          </AppText>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${freeDeliveryProgress * 100}%` }]} />
          </View>
        </View>

        {/* --- lines --- */}
        <View style={styles.listCard}>
          {cart.map((line, index) => (
            <Animated.View
              key={line.id}
              layout={Layout.springify()}
              entering={FadeInDown.delay(index * 40).duration(Theme.motion.base)}
            >
              <View style={styles.lineRow}>
                {line.image ? (
                  <Image source={line.image} style={styles.lineImage} />
                ) : (
                  <View style={[styles.lineImage, styles.lineImageFallback]}>
                    <UtensilsCrossed size={20} color={Theme.colors.primary} />
                  </View>
                )}

                <View style={styles.lineBody}>
                  <AppText variant="h3" numberOfLines={2}>
                    {label(line.name, line.nameGu)}
                  </AppText>
                  {line.note ? (
                    <AppText variant="caption" color={Theme.colors.textMuted} numberOfLines={2}>
                      {label(line.note, line.noteGu ?? line.note)}
                    </AppText>
                  ) : null}
                  <View style={styles.priceRow}>
                    <AppText variant="price">{currency(line.unitPrice)}</AppText>
                    {line.mrp && line.mrp > line.unitPrice ? (
                      <AppText variant="caption" style={styles.strike}>
                        {currency(line.mrp)}
                      </AppText>
                    ) : null}
                    {line.kind === 'plan' ? (
                      <View style={styles.planTag}>
                        <AppText variant="caption" color={Theme.colors.success}>
                          {t('flow.cart.tiffinPlan')}
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                </View>

                <QuantityStepper
                  quantity={line.quantity}
                  onChange={(next) => (next <= 0 ? removeLine(line.id) : setQuantity(line.id, next))}
                />
              </View>
              {index < cart.length - 1 ? <View style={styles.divider} /> : null}
            </Animated.View>
          ))}
        </View>

        {/* --- coupon --- */}
        <View style={styles.couponCard}>
          <View style={styles.couponHeader}>
            <Tag size={18} color={Theme.colors.primary} />
            <AppText variant="h3">{t('flow.cart.coupon')}</AppText>
            {couponCode ? (
              <Pressable
                onPress={() => {
                  removeCoupon();
                  setCouponSuccess(null);
                }}
                hitSlop={8}
                style={styles.couponRemove}
              >
                <X size={14} color={Theme.colors.error} />
              </Pressable>
            ) : null}
          </View>

          {couponCode ? (
            <AppText variant="bodySmall" color={Theme.colors.success}>
              {t('flow.cart.couponApplied', { code: couponCode })}
            </AppText>
          ) : (
            <>
              <View style={styles.couponInputRow}>
                <TextInput
                  value={couponInput}
                  onChangeText={(text) => {
                    setCouponInput(text);
                    setCouponError(null);
                  }}
                  placeholder={t('flow.cart.couponPlaceholder')}
                  placeholderTextColor={Theme.colors.textMuted}
                  autoCapitalize="characters"
                  style={styles.couponInput}
                  onSubmitEditing={handleApplyCoupon}
                  returnKeyType="done"
                />
                <Pressable onPress={handleApplyCoupon} style={styles.couponApply} accessibilityRole="button">
                  <AppText variant="label" color={Theme.colors.surface}>
                    {t('common.apply')}
                  </AppText>
                </Pressable>
              </View>
              <AppText variant={couponError ? 'bodySmall' : 'caption'} color={couponError ? Theme.colors.error : Theme.colors.textMuted}>
                {couponError ?? t('flow.cart.couponHint')}
              </AppText>
            </>
          )}
          {couponSuccess ? (
            <AppText variant="caption" color={Theme.colors.success} style={{ marginTop: 4 }}>
              {couponSuccess}
            </AppText>
          ) : null}
        </View>

        <BillSummary bill={bill} />
      </AppScrollScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  listCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    ...Theme.shadows.soft,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
  },
  lineImage: { width: 52, height: 52, borderRadius: Theme.borderRadius.md, backgroundColor: Theme.colors.surfaceSecondary },
  lineImageFallback: { alignItems: 'center', justifyContent: 'center' },
  lineBody: { flex: 1, gap: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  strike: { textDecorationLine: 'line-through' },
  planTag: {
    backgroundColor: Theme.colors.successSoft,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Theme.borderRadius.sm,
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Theme.colors.divider },
  deliveryCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    gap: Theme.spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: Theme.colors.surfaceSecondary,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: Theme.colors.success },
  couponCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderStyle: 'dashed',
  },
  couponHeader: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  couponRemove: {
    marginLeft: 'auto',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponInputRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  couponInput: {
    flex: 1,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surfaceSecondary,
    paddingHorizontal: Theme.spacing.md,
    fontSize: 14,
    color: Theme.colors.text,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  couponApply: {
    height: 44,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.primarySoft,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
  },
});
