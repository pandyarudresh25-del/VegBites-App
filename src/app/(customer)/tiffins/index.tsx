import React from 'react';
import { View, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowRight, CalendarClock, Check, Leaf, Moon, Plus, Sun, UtensilsCrossed } from 'lucide-react-native';
import { AppText } from '../../../components/AppText';
import { AppButton } from '../../../components/AppButton';
import { AppScrollScreen, ScreenHeader } from '../../../components/AppScreen';
import { Theme, palette, withAlpha } from '../../../theme';
import { useLanguage } from '../../../context/LanguageContext';
import { useAppStore } from '../../../store/AppStore';
import { IMAGES, SEED_PLANS, SEED_RESTAURANTS } from '../../../data/catalogue';
import { SLOT_WINDOW, TIFFIN_SLOTS } from '../../../domain/types';

/**
 * Tiffin hub — the tab that previously led to a static Morning/Evening screen
 * and then nowhere. It now shows the active plan, lets the customer pick a
 * delivery slot, and links into the real plan list and kitchen list.
 */
export default function TiffinHubScreen() {
  const router = useRouter();
  const { t, language, currency } = useLanguage();
  const { activeSubscription, subscriptions } = useAppStore();

  // The chosen window lives in the store so it survives navigation.
  const { slot, setSlot } = useAppStore();
  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  const kitchens = SEED_RESTAURANTS.filter((r) => r.cuisines.includes('gujarathi') || r.cuisines.includes('jain'));
  const featured = SEED_PLANS.slice(0, 3);

  return (
    <AppScrollScreen contentStyle={{ gap: Theme.spacing.lg }}>
      <ScreenHeader
        title={t('screens.tiffin.plansTitle')}
        subtitle={t('screens.tiffin.plansSubtitle')}
      />

      {/* active subscription */}
      {activeSubscription ? (
        <Animated.View entering={FadeInDown.duration(Theme.motion.base)}>
          <Pressable onPress={() => router.push('/subscription')} style={styles.activeCard} accessibilityRole="button">
            <View style={styles.activeIcon}>
              <CalendarClock size={18} color={Theme.colors.surface} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="label" color={Theme.colors.surface}>
                {label(activeSubscription.planName, activeSubscription.planNameGu)}
              </AppText>
              <AppText variant="caption" color={Theme.colors.surface} style={{ opacity: 0.88 }}>
                {t('flow.subs.mealsLeft', {
                  count: activeSubscription.mealsTotal - activeSubscription.mealsUsed,
                })}{' '}
                · {t('flow.subs.active')}
              </AppText>
            </View>
            <ArrowRight size={16} color={Theme.colors.surface} />
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.duration(Theme.motion.base)} style={styles.hero}>
          <Image source={IMAGES.gujaratiThali} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <AppText variant="h2" color={Theme.colors.surface}>
              {t('screens.tiffin.vendorsTitle')}
            </AppText>
            <AppText variant="caption" color={Theme.colors.surface} style={{ opacity: 0.9 }}>
              {t('screens.tiffin.vendorsSubtitle')}
            </AppText>
          </View>
        </Animated.View>
      )}

      {/* slot picker */}
      <View style={{ gap: Theme.spacing.sm }}>
        <AppText variant="eyebrow">{t('screens.tiffin.deliverySlot')}</AppText>
        <View style={styles.slotRow}>
          {TIFFIN_SLOTS.map((key) => {
            const active = slot === key;
            const Icon = key === 'morning' ? Sun : Moon;
            const window = SLOT_WINDOW[key];
            return (
              <Pressable
                key={key}
                onPress={() => setSlot(key)}
                style={[styles.slotCard, active && styles.slotCardActive]}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={key === 'morning' ? t('screens.tiffin.slotMorning') : t('screens.tiffin.slotEvening')}
              >
                <Icon size={18} color={active ? Theme.colors.surface : Theme.colors.primary} />
                <View style={{ flex: 1 }}>
                  <AppText variant="h3" color={active ? Theme.colors.surface : Theme.colors.text}>
                    {key === 'morning' ? t('screens.tiffin.slotMorning') : t('screens.tiffin.slotEvening')}
                  </AppText>
                  <AppText variant="caption" color={active ? Theme.colors.surface : Theme.colors.textMuted}>
                    {window.start} – {window.end}
                  </AppText>
                </View>
                {active ? <Check size={15} color={Theme.colors.surface} strokeWidth={3} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* plans */}
      <View style={{ gap: Theme.spacing.md }}>
        <View style={styles.sectionHeader}>
          <AppText variant="h2">{t('screens.tiffin.choosePlan')}</AppText>
          <Pressable onPress={() => router.push('/plans')} hitSlop={8}>
            <AppText variant="caption" color={Theme.colors.primary}>
              {t('flow.common.viewAll')}
            </AppText>
          </Pressable>
        </View>

        {featured.map((plan, index) => (
          <Animated.View key={plan.id} entering={FadeInDown.delay(index * 50).duration(Theme.motion.base)}>
            <Pressable
              onPress={() => router.push(`/tiffins/${plan.id}/plans`)}
              style={styles.planRow}
              accessibilityRole="button"
            >
              <View style={{ flex: 1, gap: 3 }}>
                <View style={styles.planTitleRow}>
                  <AppText variant="h3">{label(plan.name, plan.nameGu)}</AppText>
                  {plan.isPopular ? (
                    <View style={styles.popularTag}>
                      <AppText variant="caption" color={Theme.colors.primary}>
                        {t('screens.tiffin.popular')}
                      </AppText>
                    </View>
                  ) : null}
                </View>
                <AppText variant="caption">
                  {t('screens.tiffin.mealsCount', { count: plan.meals })} ·{' '}
                  {currency(Math.round(plan.price / plan.meals))} {t('screens.tiffin.perMeal')}
                </AppText>
                <View style={styles.dietRow}>
                  <Leaf size={11} color={Theme.colors.success} />
                  <AppText variant="caption" color={Theme.colors.success}>
                    {plan.diet.includes('jain') ? t('screens.tiffin.jain') : t('flow.common.veg')}
                  </AppText>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <AppText variant="price">{currency(plan.price)}</AppText>
                <View style={styles.arrow}>
                  <ArrowRight size={13} color={Theme.colors.primary} />
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      {/* kitchens */}
      <View style={{ gap: Theme.spacing.md }}>
        <View style={styles.sectionHeader}>
          <AppText variant="h2">{t('screens.tiffin.vendorsTitle')}</AppText>
          <Pressable onPress={() => router.push('/tiffins/vendors')} hitSlop={8}>
            <AppText variant="caption" color={Theme.colors.primary}>
              {t('flow.common.viewAll')}
            </AppText>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kitchenRow}>
          {kitchens.map((kitchen) => (
            <Pressable
              key={kitchen.id}
              onPress={() => router.push(`/tiffins/${kitchen.id}/plans`)}
              style={styles.kitchenCard}
            >
              {kitchen.image ? (
                <Image source={kitchen.image} style={styles.kitchenImage} />
              ) : (
                <View style={[styles.kitchenImage, styles.kitchenFallback]} />
              )}
              <AppText variant="bodySmall" numberOfLines={1} color={Theme.colors.text}>
                {label(kitchen.name, kitchen.nameGu)}
              </AppText>
              <AppText variant="caption" numberOfLines={1}>
                {t('restaurants.costForTwo', { amount: currency(kitchen.costForTwo) })}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* manage / browse */}
      <View style={{ gap: Theme.spacing.md }}>
        {subscriptions.length > 0 ? (
          <AppButton
            title={t('flow.subs.managePlan')}
            variant="outline"
            onPress={() => router.push('/subscription')}
          />
        ) : null}
        <AppButton
          title={t('screens.tiffin.startPlan')}
          onPress={() => router.push(`/tiffins/${SEED_PLANS[2].id}/plans`)}
        />
        <Pressable onPress={() => router.push('/restaurants')} style={styles.altRow}>
          <UtensilsCrossed size={15} color={Theme.colors.primary} />
          <AppText variant="bodySmall" color={Theme.colors.primary}>
            {t('flow.cart.browseRestaurants')}
          </AppText>
          <Plus size={13} color={Theme.colors.primary} />
        </Pressable>
      </View>
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.text,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
  },
  activeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { height: 140, borderRadius: Theme.borderRadius.xl, overflow: 'hidden', justifyContent: 'flex-end' },
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  heroOverlay: { padding: Theme.spacing.lg, backgroundColor: withAlpha(palette.ink, 0.5) },
  slotRow: { flexDirection: 'row', gap: Theme.spacing.md },
  slotCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  slotCardActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    ...Theme.shadows.soft,
  },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  popularTag: {
    backgroundColor: Theme.colors.primarySoft,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Theme.borderRadius.sm,
  },
  dietRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  arrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kitchenRow: { gap: Theme.spacing.md, paddingRight: Theme.spacing.sm },
  kitchenCard: { width: 138, gap: 4 },
  kitchenImage: { width: 138, height: 92, borderRadius: Theme.borderRadius.lg, marginBottom: 2 },
  kitchenFallback: { backgroundColor: Theme.colors.surfaceSecondary },
  altRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: Theme.spacing.sm },
});
