import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, Image, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Flame, Home as HomeIcon, Search, ShoppingBag, Star, Store, X } from 'lucide-react-native';
import { AppText } from '../../../components/AppText';
import { AppButton } from '../../../components/AppButton';
import { AppScreen, EmptyState } from '../../../components/AppScreen';
import { QuantityStepper } from '../../../components/QuantityStepper';
import { Theme } from '../../../theme';
import { useLanguage } from '../../../context/LanguageContext';
import { useAppStore } from '../../../store/AppStore';
import { SEED_MENU, SEED_RESTAURANTS } from '../../../data/catalogue';
import type { MenuItem } from '../../../domain/types';

/**
 * Restaurant menu with working add-to-cart.
 *
 * Adding an item routes through `store.addItem`, so the cart badge, cart screen
 * and checkout all update from one source. Items already in the cart render a
 * quantity stepper instead of an Add button.
 */
export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, language, currency } = useLanguage();
  const { cart, addItem, setQuantity } = useAppStore();

  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  const restaurant = useMemo(() => SEED_RESTAURANTS.find((r) => r.id === id), [id]);
  const menu = useMemo(() => SEED_MENU.filter((item) => item.restaurantId === id), [id]);

  const categories = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? menu.filter(
          (item) =>
            item.name.toLowerCase().includes(needle) ||
            item.nameGu.includes(needle) ||
            item.category.toLowerCase().includes(needle),
        )
      : menu;
    const grouped = new Map<string, MenuItem[]>();
    filtered.forEach((item) => {
      grouped.set(item.category, [...(grouped.get(item.category) ?? []), item]);
    });
    return [...grouped.entries()];
  }, [menu, query]);

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const lineFor = (itemId: string) => cart.find((line) => line.kind === 'item' && line.refId === itemId);

  if (!restaurant) {
    return (
      <AppScreen>
        <EmptyState
          icon={<Store size={28} color={Theme.colors.primary} />}
          title={t('screens.restaurants.noResults')}
          body={t('screens.restaurants.noResultsHint')}
          action={<AppButton title={t('flow.notFound.cta')} onPress={() => router.replace('/restaurants')} />}
        />
      </AppScreen>
    );
  }

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 1800);
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

      <AppScreen padded={false}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* hero */}
          <View style={styles.hero}>
            {restaurant.image ? (
              <Image source={restaurant.image} style={styles.heroImage} />
            ) : (
              <View style={[styles.heroImage, styles.thumbFallback]} />
            )}
            <View style={styles.heroScrim} />
            <Pressable
              onPress={() => router.back()}
              style={styles.heroBack}
              hitSlop={8}
              accessibilityLabel={t('common.back')}
            >
              <ArrowLeft size={20} color={Theme.colors.surface} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/home')}
              style={styles.heroHome}
              hitSlop={8}
              accessibilityLabel={t('flow.notFound.cta')}
            >
              <HomeIcon size={18} color={Theme.colors.surface} />
            </Pressable>
          </View>

          <View style={styles.body}>
            <AppText variant="h1">{label(restaurant.name, restaurant.nameGu)}</AppText>

            <View style={styles.metaRow}>
              <View style={styles.ratingPill}>
                <Star size={11} color={Theme.colors.surface} fill={Theme.colors.surface} />
                <AppText variant="caption" color={Theme.colors.surface}>
                  {restaurant.rating}
                </AppText>
              </View>
              <AppText variant="caption">
                {restaurant.ratingCount} {t('common.ratings')}
              </AppText>
              <AppText variant="caption">·</AppText>
              <AppText variant="caption">{t('screens.restaurants.vegOnly')}</AppText>
            </View>

            <AppText variant="bodySmall">
              {t('screens.restaurants.deliveryMins', { mins: restaurant.deliveryMins })} ·{' '}
              {restaurant.distanceKm} {t('common.km')} ·{' '}
              {t('screens.restaurants.costForTwo', { amount: currency(restaurant.costForTwo) })}
            </AppText>

            {restaurant.offerText ? (
              <View style={styles.offerStrip}>
                <AppText variant="caption" color={Theme.colors.success}>
                  {restaurant.offerText}
                </AppText>
              </View>
            ) : null}

            {/* menu search */}
            <View style={styles.searchBar}>
              <Search size={16} color={Theme.colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t('screens.restaurants.searchMenu')}
                placeholderTextColor={Theme.colors.textMuted}
                style={styles.searchInput}
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={10}>
                  <X size={15} color={Theme.colors.textMuted} />
                </Pressable>
              ) : null}
            </View>

            <AppText variant="eyebrow">{t('screens.restaurants.menu')}</AppText>

            {categories.length === 0 ? (
              <AppText variant="bodySmall" align="center" style={{ paddingVertical: Theme.spacing.xl }}>
                {t('screens.restaurants.noResultsHint')}
              </AppText>
            ) : (
              categories.map(([category, items]) => (
                <View key={category} style={{ gap: Theme.spacing.md }}>
                  <AppText variant="h3">{category}</AppText>
                  {items.map((item, index) => {
                    const line = lineFor(item.id);
                    return (
                      <Animated.View key={item.id} entering={FadeInDown.delay(index * 30).duration(Theme.motion.fast)}>
                        <View style={styles.itemRow}>
                          <View style={{ flex: 1, gap: 3 }}>
                            <View style={styles.itemTitleRow}>
                              <AppText variant="h3" numberOfLines={1} style={{ flexShrink: 1 }}>
                                {label(item.name, item.nameGu)}
                              </AppText>
                              {item.isBestseller ? (
                                <View style={styles.tagBestseller}>
                                  <AppText variant="caption" color={Theme.colors.primary}>
                                    {t('flow.common.bestseller')}
                                  </AppText>
                                </View>
                              ) : null}
                              {item.isSpicy ? <Flame size={13} color={Theme.colors.primary} /> : null}
                            </View>

                            <AppText variant="caption" numberOfLines={2}>
                              {label(item.description, item.descriptionGu)}
                            </AppText>

                            <View style={styles.priceRow}>
                              <AppText variant="price">{currency(item.price)}</AppText>
                              {item.mrp && item.mrp > item.price ? (
                                <AppText variant="caption" style={styles.strike}>
                                  {currency(item.mrp)}
                                </AppText>
                              ) : null}
                            </View>
                          </View>

                          {item.image ? (
                            <Image source={item.image} style={styles.itemImage} />
                          ) : (
                            <View style={[styles.itemImage, styles.thumbFallback]} />
                          )}

                          {/* add control sits under the image, as on the reference */}
                          <View style={styles.addWrap}>
                            {line ? (
                              <QuantityStepper
                                quantity={line.quantity}
                                onChange={(next) => (next <= 0 ? setQuantity(line.id, 0) : setQuantity(line.id, next))}
                              />
                            ) : (
                              <Pressable
                                onPress={() => {
                                  addItem(item);
                                  showToast(t('screens.restaurants.added', { name: label(item.name, item.nameGu) }));
                                }}
                                style={styles.addButton}
                                accessibilityRole="button"
                                accessibilityLabel={`${t('screens.restaurants.addToCart')} ${label(item.name, item.nameGu)}`}
                              >
                                <AppText variant="label" color={Theme.colors.primary}>
                                  {t('screens.restaurants.addToCart').toUpperCase()}
                                </AppText>
                              </Pressable>
                            )}
                          </View>
                        </View>
                      </Animated.View>
                    );
                  })}
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* sticky cart bar — only when the cart has something */}
        {cartCount > 0 ? (
          <Animated.View entering={FadeInDown.duration(Theme.motion.fast)} style={styles.cartBar}>
            <View style={{ flex: 1 }}>
              <AppText variant="caption" color={Theme.colors.surface}>
                {t('flow.cart.itemsCount', { count: cartCount })}
              </AppText>
              <AppText variant="h3" color={Theme.colors.surface}>
                {t('screens.restaurants.goToCart')}
              </AppText>
            </View>
            <Pressable
              onPress={() => router.push('/cart')}
              style={styles.cartButton}
              accessibilityRole="button"
            >
              <ShoppingBag size={16} color={Theme.colors.primary} />
              <AppText variant="label" color={Theme.colors.primary}>
                {t('flow.tabs.cart')}
              </AppText>
            </Pressable>
          </Animated.View>
        ) : null}
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: Theme.spacing.huge },
  hero: { height: 190 },
  heroImage: { width: '100%', height: '100%' },
  heroScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(43,33,28,0.22)',
  },
  heroBack: {
    position: 'absolute',
    top: Theme.spacing.md,
    left: Theme.spacing.md,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHome: {
    position: 'absolute',
    top: Theme.spacing.md,
    right: Theme.spacing.md,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: Theme.layout.screenPaddingX,
    paddingTop: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Theme.spacing.xs },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Theme.colors.success,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Theme.borderRadius.sm,
  },
  offerStrip: {
    marginTop: Theme.spacing.sm,
    backgroundColor: Theme.colors.successSoft,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.success,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    height: 42,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    marginTop: Theme.spacing.md,
  },
  searchInput: { flex: 1, fontSize: 13.5, fontWeight: '500', color: Theme.colors.text, height: '100%' },
  itemRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
  },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tagBestseller: {
    backgroundColor: Theme.colors.primarySoft,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Theme.borderRadius.sm,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm, marginTop: 2 },
  strike: { textDecorationLine: 'line-through' },
  itemImage: { width: 84, height: 84, borderRadius: Theme.borderRadius.md },
  thumbFallback: { backgroundColor: Theme.colors.surfaceSecondary },
  addWrap: { position: 'absolute', right: Theme.spacing.md, bottom: Theme.spacing.md },
  addButton: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.soft,
  },
  cartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.text,
    paddingHorizontal: Theme.layout.screenPaddingX,
    paddingVertical: Theme.spacing.md,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.lg,
    height: 40,
    borderRadius: Theme.borderRadius.pill,
  },
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

/**
 * Prerender one HTML page per seeded kitchen at export time, so deep links to a
 * kitchen or tiffin vendor ship real content instead of an empty shell.
 * (Exported routes without params cannot be rendered by a static host.)
 */
export async function generateStaticParams(): Promise<Record<string, string>[]> {
  return SEED_RESTAURANTS.map((restaurant) => ({ id: restaurant.id }));
}
