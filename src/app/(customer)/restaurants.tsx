import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, Image, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Search, SlidersHorizontal, Star, Store, X } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, ScreenHeader, EmptyState } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { SEED_RESTAURANTS, SEED_MENU } from '../../data/catalogue';

type SortKey = 'relevance' | 'rating' | 'time' | 'priceLow';
type FilterKey = 'pureVeg' | 'topRated' | 'under30' | 'offers';

/**
 * Restaurant discovery. Search, filters and sort are all real:
 * they operate on the catalogue and the empty state is reachable
 * (previously the list was static and filters did nothing).
 */
export default function RestaurantsScreen() {
  const router = useRouter();
  const { t, language, currency } = useLanguage();

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterKey[]>(['pureVeg']);
  const [sort, setSort] = useState<SortKey>('relevance');
  const [showSort, setShowSort] = useState(false);

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);
  const allFiltersActive = filters.length === 0;

  const toggleFilter = (key: FilterKey) =>
    setFilters((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const SORTS: { key: SortKey; label: string }[] = [
    { key: 'relevance', label: t('screens.restaurants.sortRelevance') },
    { key: 'rating', label: t('screens.restaurants.sortRating') },
    { key: 'time', label: t('screens.restaurants.sortTime') },
    { key: 'priceLow', label: t('screens.restaurants.sortPriceLow') },
  ];

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'pureVeg', label: t('screens.restaurants.vegOnly') },
    { key: 'topRated', label: t('screens.restaurants.filterTopRated') },
    { key: 'under30', label: t('screens.restaurants.filterUnder30') },
    { key: 'offers', label: t('screens.restaurants.filterOffers') },
  ];

  /** A restaurant matches if the query hits its name OR any of its dishes. */
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let list = SEED_RESTAURANTS.filter((restaurant) => {
      if (filters.includes('pureVeg') && !restaurant.pureVeg) return false;
      if (filters.includes('topRated') && restaurant.rating < 4.3) return false;
      if (filters.includes('under30') && restaurant.deliveryMins > 30) return false;
      if (filters.includes('offers') && !restaurant.offerText) return false;
      if (!needle) return true;
      const dishes = SEED_MENU.filter((item) => item.restaurantId === restaurant.id);
      return (
        restaurant.name.toLowerCase().includes(needle) ||
        restaurant.nameGu.includes(needle) ||
        dishes.some(
          (d) =>
            d.name.toLowerCase().includes(needle) ||
            d.nameGu.includes(needle) ||
            d.category.toLowerCase().includes(needle),
        )
      );
    });

    list = [...list].sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'time') return a.deliveryMins - b.deliveryMins;
      if (sort === 'priceLow') return a.costForTwo - b.costForTwo;
      // relevance: open first, then best rated
      return Number(b.isOpen) - Number(a.isOpen) || b.rating - a.rating;
    });
    return list;
  }, [query, filters, sort]);

  const hasActiveQueryOrFilter = Boolean(query.trim()) || !allFiltersActive;

  return (
    <AppScrollScreen contentStyle={{ gap: Theme.spacing.lg }}>
      <ScreenHeader
        title={t('restaurants.title')}
        subtitle={t('restaurants.subtitle', { count: SEED_RESTAURANTS.length })}
        left={
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
            <ArrowLeft size={22} color={Theme.colors.text} />
          </Pressable>
        }
      />

      {/* search */}
      <View style={styles.searchBar}>
        <Search size={17} color={Theme.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('screens.restaurants.search')}
          placeholderTextColor={Theme.colors.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel={t('common.remove')}>
            <X size={16} color={Theme.colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {/* filters + sort */}
      <View style={styles.controlRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {FILTERS.map((filter) => {
            const active = filters.includes(filter.key);
            return (
              <Pressable
                key={filter.key}
                onPress={() => toggleFilter(filter.key)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}
              >
                {active ? <X size={11} color={Theme.colors.surface} /> : null}
                <AppText variant="caption" color={active ? Theme.colors.surface : Theme.colors.textSecondary}>
                  {filter.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable onPress={() => setShowSort((s) => !s)} style={styles.sortButton} accessibilityRole="button">
          <SlidersHorizontal size={14} color={Theme.colors.primary} />
          <AppText variant="caption" color={Theme.colors.primary}>
            {t('screens.restaurants.sort')}
          </AppText>
        </Pressable>
      </View>

      {showSort ? (
        <Animated.View entering={FadeInDown.duration(Theme.motion.fast)} style={styles.sortSheet}>
          {SORTS.map((option) => {
            const active = sort === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => {
                  setSort(option.key);
                  setShowSort(false);
                }}
                style={styles.sortRow}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <AppText variant="bodySmall" color={active ? Theme.colors.primary : Theme.colors.textSecondary}>
                  {option.label}
                </AppText>
                {active ? <View style={styles.sortActiveDot} /> : null}
              </Pressable>
            );
          })}
        </Animated.View>
      ) : null}

      {/* results */}
      {results.length === 0 ? (
        <EmptyState
          icon={<Store size={28} color={Theme.colors.primary} />}
          title={t('screens.restaurants.noResults')}
          body={t('screens.restaurants.noResultsHint')}
          action={
            hasActiveQueryOrFilter ? (
              <AppButton
                title={t('screens.restaurants.clearFilters')}
                variant="outline"
                onPress={() => {
                  setQuery('');
                  setFilters([]);
                }}
              />
            ) : undefined
          }
        />
      ) : (
        <View style={{ gap: Theme.spacing.md }}>
          {results.map((restaurant, index) => (
            <Animated.View key={restaurant.id} entering={FadeInDown.delay(index * 50).duration(Theme.motion.base)}>
              <Pressable
                onPress={() => router.push(`/restaurant/${restaurant.id}`)}
                style={[styles.card, !restaurant.isOpen && styles.cardClosed]}
                accessibilityRole="button"
              >
                {restaurant.image ? (
                  <Image source={restaurant.image} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbFallback]} />
                )}

                <View style={{ flex: 1, gap: 3 }}>
                  <AppText variant="h3" numberOfLines={1}>
                    {label(restaurant.name, restaurant.nameGu)}
                  </AppText>

                  <View style={styles.metaRow}>
                    <View style={styles.ratingPill}>
                      <Star size={10} color={Theme.colors.surface} fill={Theme.colors.surface} />
                      <AppText variant="caption" color={Theme.colors.surface}>
                        {restaurant.rating}
                      </AppText>
                    </View>
                    <AppText variant="caption">
                      {t('screens.restaurants.deliveryMins', { mins: restaurant.deliveryMins })}
                    </AppText>
                    <AppText variant="caption">· {restaurant.distanceKm} {t('common.km')}</AppText>
                  </View>

                  <AppText variant="caption">
                    {t('screens.restaurants.costForTwo', { amount: currency(restaurant.costForTwo) })} ·{' '}
                    {t('screens.restaurants.minOrder', { amount: currency(restaurant.minOrder) })}
                  </AppText>

                  {restaurant.offerText ? (
                    <AppText variant="caption" color={Theme.colors.success} numberOfLines={1}>
                      {restaurant.offerText}
                    </AppText>
                  ) : null}

                  {!restaurant.isOpen ? (
                    <AppText variant="caption" color={Theme.colors.error}>
                      {t('restaurants.closed')}
                    </AppText>
                  ) : null}
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      )}
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    height: 46,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', color: Theme.colors.text, height: '100%' },
  controlRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  chipRow: { gap: Theme.spacing.sm, paddingRight: Theme.spacing.md },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Theme.spacing.md,
    height: 34,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  chipActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Theme.spacing.md,
    height: 34,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.primarySoft,
  },
  sortSheet: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    paddingVertical: Theme.spacing.xs,
    ...Theme.shadows.soft,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  sortActiveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Theme.colors.primary },
  card: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    ...Theme.shadows.soft,
  },
  cardClosed: { opacity: 0.6 },
  thumb: { width: 84, height: 84, borderRadius: Theme.borderRadius.lg },
  thumbFallback: { backgroundColor: Theme.colors.surfaceSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Theme.colors.success,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Theme.borderRadius.sm,
  },
});
