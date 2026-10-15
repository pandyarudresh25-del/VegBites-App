import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, CalendarClock, Clock, MapPin, Star, UtensilsCrossed } from 'lucide-react-native';
import { AppText } from '../../../../components/AppText';
import { AppButton } from '../../../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../../../components/AppScreen';
import { Theme } from '../../../../theme';
import { useLanguage } from '../../../../context/LanguageContext';
import { SEED_PLANS, SEED_RESTAURANTS, SEED_TIFFIN_MENU } from '../../../../data/catalogue';

/**
 * Tiffin kitchen hub.
 *
 * The route id is looked up in the catalogue — previously this screen ignored its
 * own id and always showed "Shree Krishna Tiffin" with three hardcoded dishes, so
 * every kitchen in the app looked identical.
 */
export default function TiffinVendorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language, currency, count } = useLanguage();

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  const vendor = useMemo(() => SEED_RESTAURANTS.find((r) => r.id === id), [id]);
  // Home-style kitchens share the tiffin component menu (Full Tiffin, Rotli/Rotla,
  // Sabji, Dal/Rice, Kathol, Salad, Buttermilk, Add-ons) rather than a restaurant menu.
  const menu = useMemo(() => SEED_TIFFIN_MENU, []);
  const cheapestPlan = useMemo(() => [...SEED_PLANS].sort((a, b) => a.price - b.price)[0], []);

  const back = (
    <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
      <ArrowLeft size={22} color={Theme.colors.text} />
    </Pressable>
  );

  if (!vendor) {
    return (
      <AppScrollScreen>
        <ScreenHeader title={t('screens.tiffin.vendorsTitle')} left={back} />
        <EmptyState
          icon={<UtensilsCrossed size={28} color={Theme.colors.primary} />}
          title={t('flow.notFound.title')}
          body={t('flow.notFound.body')}
          action={<AppButton title={t('flow.notFound.cta')} onPress={() => router.replace('/tiffins/vendors')} />}
        />
      </AppScrollScreen>
    );
  }

  return (
    <AppScrollScreen
      footer={
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <AppText variant="caption" color={Theme.colors.textMuted}>
              {cheapestPlan
                ? t('screens.tiffin.fromPrice', { amount: currency(cheapestPlan.price) })
                : t('screens.tiffin.perMeal')}
            </AppText>
          </View>
          <View style={styles.footerButton}>
            <AppButton
              fullWidth={false}
              title={t('screens.tiffin.choosePlan')}
              onPress={() => router.push(`/tiffins/${vendor.id}/plans` as never)}
            />
          </View>
        </View>
      }
    >
      <ScreenHeader title={label(vendor.name, vendor.nameGu)} left={back} />

      <Animated.View entering={FadeInDown.duration(Theme.motion.base)} style={styles.hero}>
        {vendor.image ? (
          <Image source={vendor.image} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.heroFallback]}>
            <UtensilsCrossed size={28} color={Theme.colors.primary} />
          </View>
        )}
        <View style={styles.heroMeta}>
          <View style={styles.meta}>
            <Star size={13} color={Theme.colors.primary} fill={Theme.colors.primary} />
            <AppText variant="caption" color={Theme.colors.textSecondary}>
              {count(vendor.rating)} ({count(vendor.ratingCount)})
            </AppText>
          </View>
          <View style={styles.meta}>
            <Clock size={13} color={Theme.colors.textMuted} />
            <AppText variant="caption" color={Theme.colors.textSecondary}>
              {t('screens.restaurants.deliveryMins', { mins: vendor.deliveryMins })}
            </AppText>
          </View>
          <View style={styles.meta}>
            <MapPin size={13} color={Theme.colors.textMuted} />
            <AppText variant="caption" color={Theme.colors.textSecondary}>
              {vendor.distanceKm} {t('common.km')}
            </AppText>
          </View>
        </View>
        <AppText variant="caption" color={Theme.colors.textMuted}>
          {vendor.pureVeg ? t('screens.restaurants.vegOnly') : ''}
          {vendor.isOpen ? '' : ` · ${t('restaurants.closed')}`}
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(Theme.motion.base)} style={styles.actionRow}>
        <View style={{ flex: 1 }}>
          <AppButton
            variant="outline"
            title={t('screens.tiffin.buildTitle')}
            onPress={() => router.push(`/tiffins/${vendor.id}/thali` as never)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppButton
            title={t('screens.tiffin.choosePlan')}
            onPress={() => router.push(`/tiffins/${vendor.id}/plans` as never)}
          />
        </View>
      </Animated.View>

      <View style={styles.planHint}>
        <CalendarClock size={16} color={Theme.colors.primary} />
        <AppText variant="caption" color={Theme.colors.textSecondary} style={{ flex: 1 }}>
          {t('screens.tiffin.plansSubtitle')}
        </AppText>
      </View>

      <View>
        <AppText variant="h3" style={styles.sectionTitle}>
          {t('screens.restaurants.menu')}
        </AppText>
        {menu.length === 0 ? (
          <AppText variant="bodySmall" color={Theme.colors.textMuted}>
            {t('screens.tiffin.noMenu')}
          </AppText>
        ) : (
          <View style={styles.menuList}>
            {menu.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(90 + index * 30).duration(Theme.motion.fast)}>
                <Pressable
                  onPress={() => router.push(`/restaurant/${vendor.id}` as never)}
                  accessibilityRole="button"
                  accessibilityLabel={label(item.name, item.nameGu)}
                  style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
                >
                  {item.image ? (
                    <Image source={item.image} style={styles.menuImage} />
                  ) : (
                    <View style={[styles.menuImage, styles.heroFallback]}>
                      <UtensilsCrossed size={18} color={Theme.colors.primary} />
                    </View>
                  )}
                  <View style={styles.menuBody}>
                    <AppText variant="h3" numberOfLines={1}>
                      {label(item.name, item.nameGu)}
                    </AppText>
                    <AppText variant="caption" color={Theme.colors.textMuted} numberOfLines={2}>
                      {label(item.description, item.descriptionGu)}
                    </AppText>
                    <AppText variant="price">{currency(item.price)}</AppText>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        )}
      </View>
    </AppScrollScreen>
  );
}

/**
 * Prerender one page per seeded kitchen so deep links resolve on a static host.
 */
export async function generateStaticParams(): Promise<Record<string, string>[]> {
  return SEED_RESTAURANTS.map((restaurant) => ({ id: restaurant.id }));
}

const styles = StyleSheet.create({
  hero: {
    gap: Theme.spacing.sm,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  heroImage: { width: '100%', height: 160, borderRadius: Theme.borderRadius.md },
  heroFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md, flexWrap: 'wrap' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionRow: { flexDirection: 'row', gap: Theme.spacing.md },
  planHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.primarySoft,
  },
  sectionTitle: { marginBottom: Theme.spacing.md },
  menuList: { gap: Theme.spacing.sm },
  menuRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  menuRowPressed: { borderColor: Theme.colors.primary },
  menuImage: { width: 56, height: 56, borderRadius: Theme.borderRadius.md },
  menuBody: { flex: 1, gap: 2 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  footerInfo: { flex: 1 },
  footerButton: { minWidth: 180 },
});
