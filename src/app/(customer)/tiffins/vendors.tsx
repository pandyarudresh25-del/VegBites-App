import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Clock, Star, UtensilsCrossed } from 'lucide-react-native';
import { AppText } from '../../../components/AppText';
import { AppButton } from '../../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../../components/AppScreen';
import { Theme } from '../../../theme';
import { useLanguage } from '../../../context/LanguageContext';
import { SEED_RESTAURANTS } from '../../../data/catalogue';

/**
 * Tiffin kitchens.
 *
 * Lists the seeded kitchens rather than a hand-written array, so the ids here
 * match the ids the detail screens look up — previously this screen invented
 * ids ('1', '2', '3') that no other screen could resolve.
 */
export default function TiffinVendorsScreen() {
  const router = useRouter();
  const { t, language, currency, count } = useLanguage();

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  const back = (
    <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
      <ArrowLeft size={22} color={Theme.colors.text} />
    </Pressable>
  );

  if (SEED_RESTAURANTS.length === 0) {
    return (
      <AppScrollScreen>
        <ScreenHeader title={t('screens.tiffin.vendorsTitle')} left={back} />
        <EmptyState
          icon={<UtensilsCrossed size={28} color={Theme.colors.primary} />}
          title={t('screens.tiffin.noVendors')}
          body={t('screens.tiffin.noVendorsHint')}
          action={<AppButton title={t('flow.notFound.cta')} onPress={() => router.replace('/home')} />}
        />
      </AppScrollScreen>
    );
  }

  return (
    <AppScrollScreen>
      <ScreenHeader
        title={t('screens.tiffin.vendorsTitle')}
        subtitle={t('screens.tiffin.vendorsSubtitle')}
        left={back}
      />
      <View style={styles.list}>
        {SEED_RESTAURANTS.map((vendor, index) => (
          <Animated.View key={vendor.id} entering={FadeInDown.delay(40 + index * 40).duration(Theme.motion.base)}>
            <Pressable
              onPress={() => router.push(`/tiffins/${vendor.id}` as never)}
              accessibilityRole="button"
              accessibilityLabel={label(vendor.name, vendor.nameGu)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              {vendor.image ? (
                <Image source={vendor.image} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.imageFallback]}>
                  <UtensilsCrossed size={22} color={Theme.colors.primary} />
                </View>
              )}

              <View style={styles.body}>
                <AppText variant="h3" numberOfLines={1}>
                  {label(vendor.name, vendor.nameGu)}
                </AppText>

                <View style={styles.metaRow}>
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
                </View>

                <AppText variant="caption" color={Theme.colors.textMuted} numberOfLines={1}>
                  {t('screens.restaurants.minOrder', { amount: currency(vendor.minOrder) })} ·{' '}
                  {t('screens.restaurants.costForTwo', { amount: currency(vendor.costForTwo) })}
                </AppText>

                {!vendor.isOpen ? (
                  <AppText variant="caption" color={Theme.colors.error}>
                    {t('restaurants.closed')}
                  </AppText>
                ) : null}
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  list: { gap: Theme.spacing.md },
  card: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  cardPressed: { borderColor: Theme.colors.primary },
  image: { width: 76, height: 76, borderRadius: Theme.borderRadius.md },
  imageFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background },
  body: { flex: 1, gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
