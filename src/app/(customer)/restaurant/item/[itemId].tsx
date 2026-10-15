import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Flame, Leaf, Sparkles, Star, UtensilsCrossed } from 'lucide-react-native';
import { AppText } from '../../../../components/AppText';
import { AppButton } from '../../../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../../../components/AppScreen';
import { QuantityStepper } from '../../../../components/QuantityStepper';
import { Theme } from '../../../../theme';
import { useLanguage } from '../../../../context/LanguageContext';
import { useAppStore } from '../../../../store/AppStore';
import { SEED_ADDONS, SEED_MENU, SEED_RESTAURANTS } from '../../../../data/catalogue';
import type { MenuItem } from '../../../../domain/types';

/**
 * Dish detail.
 *
 * This route existed but nothing in the app linked to it, and it rendered one
 * hardcoded thali with a rating badge and a price that did not come from anywhere.
 * It now resolves a real catalogue dish from `?itemId=`, and the restaurant menu
 * links to it. Quantity is committed to the cart through the store.
 */
export default function FoodDetailScreen() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const { t, language, currency } = useLanguage();
  const { cart, addItem, removeLine } = useAppStore();

  const [quantity, setLocalQuantity] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  const item: MenuItem | undefined = useMemo(
    () => SEED_MENU.find((entry) => entry.id === itemId) ?? SEED_ADDONS.find((entry) => entry.id === itemId),
    [itemId],
  );
  const restaurant = useMemo(
    () => SEED_RESTAURANTS.find((entry) => entry.id === item?.restaurantId),
    [item],
  );
  const line = useMemo(() => cart.find((entry) => entry.kind === 'item' && entry.refId === item?.id), [cart, item]);

  const back = (
    <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
      <ArrowLeft size={22} color={Theme.colors.text} />
    </Pressable>
  );

  if (!item) {
    return (
      <AppScrollScreen>
        <ScreenHeader title={t('screens.item.title')} left={back} />
        <EmptyState
          icon={<UtensilsCrossed size={28} color={Theme.colors.primary} />}
          title={t('flow.notFound.title')}
          body={t('flow.notFound.body')}
          action={<AppButton title={t('flow.notFound.cta')} onPress={() => router.replace('/restaurants')} />}
        />
      </AppScrollScreen>
    );
  }

  const handleAdd = () => {
    addItem(item, quantity);
    setToast(t('screens.restaurants.added', { name: label(item.name, item.nameGu) }));
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <AppScrollScreen
      footer={
        <View style={styles.footer}>
          <View style={styles.qtyBlock}>
            <AppText variant="caption" color={Theme.colors.textMuted}>
              {t('common.quantity')}
            </AppText>
            <QuantityStepper quantity={quantity} onChange={setLocalQuantity} removeWhenOne={false} min={1} />
          </View>
          <View style={styles.ctaBlock}>
            <AppButton
              title={t('screens.item.addFor', { total: currency(item.price * quantity) })}
              onPress={handleAdd}
            />
          </View>
        </View>
      }
    >
      <ScreenHeader
        title={t('screens.item.title')}
        subtitle={restaurant ? label(restaurant.name, restaurant.nameGu) : undefined}
        left={back}
      />

      <Animated.View entering={FadeInDown.duration(Theme.motion.base)} style={styles.hero}>
        {item.image ? (
          <Image source={item.image} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.heroFallback]}>
            <UtensilsCrossed size={28} color={Theme.colors.primary} />
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(50).duration(Theme.motion.base)} style={styles.body}>
        <View style={styles.titleRow}>
          <AppText variant="h1" style={{ flex: 1 }}>
            {label(item.name, item.nameGu)}
          </AppText>
          <View style={styles.priceBlock}>
            <AppText variant="price">{currency(item.price)}</AppText>
            {item.mrp && item.mrp > item.price ? (
              <AppText variant="caption" style={styles.strike}>
                {currency(item.mrp)}
              </AppText>
            ) : null}
          </View>
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Leaf size={13} color={Theme.colors.success} />
            <AppText variant="caption" color={Theme.colors.success}>
              {item.diet.includes('jain') ? t('screens.restaurants.vegOnly') : t('screens.item.veg')}
            </AppText>
          </View>
          {item.isBestseller ? (
            <View style={styles.badge}>
              <Star size={13} color={Theme.colors.primary} fill={Theme.colors.primary} />
              <AppText variant="caption" color={Theme.colors.primary}>
                {t('flow.common.bestseller')}
              </AppText>
            </View>
          ) : null}
          {item.isSpicy ? (
            <View style={styles.badge}>
              <Flame size={13} color={Theme.colors.primary} />
              <AppText variant="caption" color={Theme.colors.primary}>
                {t('screens.item.spicy')}
              </AppText>
            </View>
          ) : null}
        </View>

        <AppText variant="body" color={Theme.colors.textSecondary}>
          {label(item.description, item.descriptionGu)}
        </AppText>

        {item.category ? (
          <View style={styles.metaRow}>
            <AppText variant="caption" color={Theme.colors.textMuted}>
              {t('screens.item.category', { name: item.category })}
            </AppText>
          </View>
        ) : null}

        {line ? (
          <View style={styles.inCart}>
            <AppText variant="bodySmall" color={Theme.colors.success}>
              {t('screens.item.inCart', { count: line.quantity })}
            </AppText>
            <Pressable onPress={() => removeLine(line.id)} hitSlop={8} accessibilityRole="button">
              <AppText variant="caption" color={Theme.colors.error}>
                {t('common.remove')}
              </AppText>
            </Pressable>
          </View>
        ) : null}

        <AppButton
          variant="outline"
          title={t('screens.item.addAddons')}
          onPress={() => router.push('/addons')}
        />

        <View style={styles.tipRow}>
          <Sparkles size={14} color={Theme.colors.primary} />
          <AppText variant="caption" color={Theme.colors.textMuted} style={{ flex: 1 }}>
            {t('screens.item.tip')}
          </AppText>
        </View>
      </Animated.View>

      {toast ? (
        <View style={styles.toast}>
          <AppText variant="caption" color={Theme.colors.surface}>
            {toast}
          </AppText>
        </View>
      ) : null}
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: Theme.borderRadius.lg, overflow: 'hidden' },
  heroImage: { width: '100%', height: 190 },
  heroFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.surfaceHighlight },
  body: { gap: Theme.spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Theme.spacing.md },
  priceBlock: { alignItems: 'flex-end' },
  strike: { textDecorationLine: 'line-through', color: Theme.colors.textMuted },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Theme.spacing.sm },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.background,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  inCart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.successSoft,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  qtyBlock: { alignItems: 'center', gap: 2 },
  ctaBlock: { flex: 1 },
  toast: {
    position: 'absolute',
    top: Theme.spacing.huge,
    alignSelf: 'center',
    backgroundColor: Theme.colors.text,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
  },
});

/**
 * Prerender a page per catalogue dish so `/restaurant/item/r1i1` is deep-linkable
 * on a static host. (This route previously took the id as a query string, which a
 * static export cannot resolve — it rendered the not-found state until hydration.)
 */
export async function generateStaticParams(): Promise<Record<string, string>[]> {
  return [...SEED_MENU, ...SEED_ADDONS].map((entry) => ({ itemId: entry.id }));
}
