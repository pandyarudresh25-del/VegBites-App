import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, CalendarClock, Check, Leaf, UtensilsCrossed } from 'lucide-react-native';
import { AppText } from '../../../../components/AppText';
import { AppButton } from '../../../../components/AppButton';
import { AppScrollScreen, ScreenHeader } from '../../../../components/AppScreen';
import { Theme } from '../../../../theme';
import { useLanguage } from '../../../../context/LanguageContext';
import { useAppStore } from '../../../../store/AppStore';
import { SEED_PLANS, IMAGES } from '../../../../data/catalogue';
import type { TiffinPlan } from '../../../../domain/types';

/**
 * Tiffin plans.
 *
 * Subscribing calls `store.subscribeToPlan`, which creates a real subscription
 * (visible on the Subscriptions screen) and debits the wallet. Selecting a plan
 * also lets the customer pick a delivery slot before confirming.
 */
export default function TiffinPlansScreen() {
  const router = useRouter();
  const { t, language, currency } = useLanguage();
  const { subscribeToPlan, activeSubscription, walletBalance } = useAppStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [slot, setSlot] = useState<'lunch' | 'dinner'>('lunch');
  const [toast, setToast] = useState<string | null>(null);

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);
  const selected = SEED_PLANS.find((plan) => plan.id === selectedId) ?? null;
  const canAfford = selected ? walletBalance >= selected.price : true;

  const handleSubscribe = (plan: TiffinPlan) => {
    subscribeToPlan(plan);
    setToast(t('flow.subs.pausedToast') && t('screens.tiffin.subscribed'));
    setSelectedId(null);
    setTimeout(() => router.push('/subscription'), 900);
  };

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
          title={t('screens.tiffin.plansTitle')}
          subtitle={t('screens.tiffin.plansSubtitle')}
          left={
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
              <ArrowLeft size={22} color={Theme.colors.text} />
            </Pressable>
          }
        />

        {/* existing subscription shortcut */}
        {activeSubscription ? (
          <Pressable
            onPress={() => router.push('/subscription')}
            style={styles.activeCard}
            accessibilityRole="button"
          >
            <CalendarClock size={18} color={Theme.colors.success} />
            <View style={{ flex: 1 }}>
              <AppText variant="label" color={Theme.colors.success}>
                {t('flow.subs.active')}
              </AppText>
              <AppText variant="caption">
                {t('flow.subs.nextDelivery', { date: new Date(activeSubscription.nextDeliveryAt).toDateString() })}
              </AppText>
            </View>
            <AppText variant="caption" color={Theme.colors.primary}>
              {t('flow.subs.managePlan')}
            </AppText>
          </Pressable>
        ) : null}

        {/* hero strip */}
        <View style={styles.heroCard}>
          <Image source={IMAGES.gujaratiThali} style={styles.heroImage} />
          <View style={styles.heroText}>
            <AppText variant="h3" color={Theme.colors.surface}>
              {t('screens.tiffin.vendorsTitle')}
            </AppText>
            <AppText variant="caption" color={Theme.colors.surface} style={{ opacity: 0.9 }}>
              {t('screens.tiffin.vendorsSubtitle')}
            </AppText>
          </View>
        </View>

        {/* plans */}
        {SEED_PLANS.map((plan, index) => {
          const isSelected = selectedId === plan.id;
          const discount = plan.mrp ? plan.mrp - plan.price : 0;
          return (
            <Animated.View key={plan.id} entering={FadeInDown.delay(index * 50).duration(Theme.motion.base)}>
              <Pressable
                onPress={() => setSelectedId(isSelected ? null : plan.id)}
                style={[styles.planCard, isSelected && styles.planCardSelected]}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                {plan.isPopular ? (
                  <View style={styles.popularTag}>
                    <AppText variant="caption" color={Theme.colors.surface}>
                      {t('screens.tiffin.popular')}
                    </AppText>
                  </View>
                ) : null}

                <View style={styles.planHeader}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="h2">{label(plan.name, plan.nameGu)}</AppText>
                    <AppText variant="caption">
                      {t('screens.tiffin.mealsCount', { count: plan.meals })} ·{' '}
                      {currency(Math.round(plan.price / plan.meals))} {t('screens.tiffin.perMeal')}
                    </AppText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <AppText variant="h2" color={Theme.colors.primary}>
                      {currency(plan.price)}
                    </AppText>
                    {plan.mrp ? (
                      <AppText variant="caption" style={styles.strike}>
                        {currency(plan.mrp)}
                      </AppText>
                    ) : null}
                  </View>
                </View>

                {discount > 0 ? (
                  <View style={styles.saveTag}>
                    <AppText variant="caption" color={Theme.colors.success}>
                      {t('screens.tiffin.saveVs', { amount: currency(discount) })}
                    </AppText>
                  </View>
                ) : null}

                {/* diet tags */}
                <View style={styles.dietRow}>
                  {plan.diet.includes('veg') ? (
                    <View style={styles.dietTag}>
                      <Leaf size={11} color={Theme.colors.success} />
                      <AppText variant="caption" color={Theme.colors.success}>
                        {t('flow.common.veg')}
                      </AppText>
                    </View>
                  ) : null}
                  {plan.diet.includes('jain') ? (
                    <View style={styles.dietTag}>
                      <AppText variant="caption" color={Theme.colors.success}>
                        {t('flow.common.jain')}
                      </AppText>
                    </View>
                  ) : null}
                  {plan.diet.includes('noOnionGarlic') ? (
                    <View style={styles.dietTag}>
                      <AppText variant="caption" color={Theme.colors.success}>
                        {t('screens.tiffin.noOnionGarlic')}
                      </AppText>
                    </View>
                  ) : null}
                </View>

                {/* expanded: what's included + slot picker */}
                {isSelected ? (
                  <Animated.View entering={FadeInDown.duration(Theme.motion.fast)} style={styles.expanded}>
                    <AppText variant="label" style={{ marginBottom: Theme.spacing.sm }}>
                      {t('screens.tiffin.includes')}
                    </AppText>
                    {(language === 'gu' ? plan.includesGu : plan.includes).map((line) => (
                      <View key={line} style={styles.includeRow}>
                        <Check size={13} color={Theme.colors.success} strokeWidth={3} />
                        <AppText variant="bodySmall" style={{ flex: 1 }}>
                          {line}
                        </AppText>
                      </View>
                    ))}

                    <AppText variant="label" style={{ marginTop: Theme.spacing.md, marginBottom: Theme.spacing.sm }}>
                      {t('screens.tiffin.deliverySlot')}
                    </AppText>
                    <View style={styles.slotRow}>
                      {(['lunch', 'dinner'] as const).map((key) => {
                        const active = slot === key;
                        return (
                          <Pressable
                            key={key}
                            onPress={() => setSlot(key)}
                            style={[styles.slotChip, active && styles.slotChipActive]}
                            accessibilityRole="radio"
                            accessibilityState={{ selected: active }}
                          >
                            <AppText variant="caption" color={active ? Theme.colors.surface : Theme.colors.textSecondary}>
                              {key === 'lunch' ? t('screens.tiffin.slotLunch') : t('screens.tiffin.slotDinner')}
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </View>

                    {!canAfford ? (
                      <AppText variant="caption" color={Theme.colors.error} style={{ marginTop: Theme.spacing.sm }}>
                        {t('flow.wallet.shortBy', { amount: currency(plan.price - walletBalance) })}
                      </AppText>
                    ) : null}

                    <View style={{ marginTop: Theme.spacing.md }}>
                      <AppButton
                        title={canAfford ? t('screens.tiffin.startPlan') : t('flow.payment.addMoney')}
                        onPress={() =>
                          canAfford
                            ? handleSubscribe(plan)
                            : router.push('/wallet')
                        }
                      />
                    </View>
                  </Animated.View>
                ) : (
                  <AppText variant="caption" color={Theme.colors.primary} style={{ marginTop: Theme.spacing.sm }}>
                    {t('screens.tiffin.choosePlan')}
                  </AppText>
                )}
              </Pressable>
            </Animated.View>
          );
        })}

        <Pressable onPress={() => router.push('/wallet')} style={styles.walletRow}>
          <UtensilsCrossed size={15} color={Theme.colors.primary} />
          <AppText variant="bodySmall" color={Theme.colors.primary}>
            {t('flow.payment.walletHint', { amount: currency(walletBalance) })}
          </AppText>
        </Pressable>
      </AppScrollScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.successSoft,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
  },
  heroCard: { height: 128, borderRadius: Theme.borderRadius.xl, overflow: 'hidden', justifyContent: 'flex-end' },
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  heroText: { padding: Theme.spacing.lg, backgroundColor: 'rgba(43,33,28,0.5)' },
  planCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    ...Theme.shadows.soft,
  },
  planCardSelected: { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primarySoft },
  popularTag: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.sm,
  },
  planHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Theme.spacing.md },
  strike: { textDecorationLine: 'line-through' },
  saveTag: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.successSoft,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
    marginTop: Theme.spacing.sm,
  },
  dietRow: { flexDirection: 'row', gap: Theme.spacing.sm, marginTop: Theme.spacing.sm, flexWrap: 'wrap' },
  dietTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: Theme.colors.success,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Theme.borderRadius.sm,
  },
  expanded: { marginTop: Theme.spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Theme.colors.divider, paddingTop: Theme.spacing.lg },
  includeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Theme.spacing.sm, marginBottom: 5 },
  slotRow: { flexDirection: 'row', gap: Theme.spacing.sm, flexWrap: 'wrap' },
  slotChip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  slotChipActive: { backgroundColor: Theme.colors.success, borderColor: Theme.colors.success },
  walletRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Theme.spacing.sm, paddingVertical: Theme.spacing.md },
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
