import React from 'react';
import { View, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Bell,
  ChevronRight,
  MapPin,
  PlayCircle,
  Search,
  Star,
  UtensilsCrossed,
  Store,
  Clock,
  Wallet,
  Receipt,
} from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppScreen } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import { SEED_RESTAURANTS, SEED_PLANS, SEED_REELS, SEED_MENU } from '../../data/catalogue';
import { STATUS_KEY } from '../../domain/types';

/**
 * Home.
 *
 * Previously hardcoded to "Ahmedabad, Gujarat", a fake "Jay Patel" greeting and
 * two literal restaurant cards. It now reads the catalogue + store: the city
 * comes from the customer's saved address, the greeting comes from the signed-in
 * user, the live-order card appears only when an order is actually active, and
 * every label is localized.
 */
export default function HomeScreen() {
  const router = useRouter();
  const { t, language, currency } = useLanguage();
  const { user, selectedAddress, activeOrders, cartCount } = useAppStore();

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t('home.greetingMorning') : hour < 17 ? t('home.greetingAfternoon') : t('home.greetingEvening');
  const city = selectedAddress?.city ?? 'Rajkot';
  const firstName = user?.name?.split(' ')[0];
  const liveOrder = activeOrders[0];

  const tiffinPlans = SEED_PLANS.slice(0, 3);
  const topRestaurants = SEED_RESTAURANTS.filter((r) => r.isOpen).slice(0, 4);
  const bestsellers = SEED_MENU.filter((item) => item.isBestseller).slice(0, 5);
  const heroReel = SEED_REELS[0];

  return (
    <AppScreen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* ---------------- header ---------------- */}
        <Animated.View entering={FadeInDown.duration(Theme.motion.base)} style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.locationRow}>
              <MapPin size={14} color={Theme.colors.primary} />
              <AppText variant="caption" color={Theme.colors.textSecondary}>
                {city}, {label('Gujarat', 'ગુજરાત')}
              </AppText>
            </View>
            <AppText variant="h2" style={{ marginTop: 2 }}>
              {firstName ? `${greeting}, ${firstName} 👋` : `${greeting} 👋`}
            </AppText>
            <AppText variant="bodySmall" style={{ marginTop: 2 }}>
              {t('home.tagline')}
            </AppText>
          </View>
          <Pressable
            onPress={() => router.push('/notifications')}
            style={styles.headerIcon}
            accessibilityLabel={t('profile.notifications')}
          >
            <Bell size={19} color={Theme.colors.text} />
          </Pressable>
        </Animated.View>

        {/* ---------------- search ---------------- */}
        <Pressable
          onPress={() => router.push('/restaurants')}
          style={styles.searchBar}
          accessibilityRole="search"
        >
          <Search size={17} color={Theme.colors.textMuted} />
          <AppText variant="bodySmall" style={{ flex: 1 }}>
            {t('home.searchPlaceholder')}
          </AppText>
        </Pressable>

        {/* ---------------- live order ---------------- */}
        {liveOrder ? (
          <Animated.View entering={FadeInDown.delay(40).duration(Theme.motion.base)}>
            <Pressable onPress={() => router.push(`/tracking/${liveOrder.id}`)} style={styles.liveOrderCard}>
              <View style={styles.liveOrderIcon}>
                <Clock size={18} color={Theme.colors.surface} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="label" color={Theme.colors.surface}>
                  {t(STATUS_KEY[liveOrder.status])}
                </AppText>
                <AppText variant="caption" color={Theme.colors.surface} style={{ opacity: 0.85 }}>
                  #{liveOrder.id} · {label(liveOrder.restaurantName, liveOrder.restaurantNameGu)}
                </AppText>
              </View>
              <View style={styles.trackPill}>
                <AppText variant="caption" color={Theme.colors.primary}>
                  {t('home.trackOrder')}
                </AppText>
                <ChevronRight size={13} color={Theme.colors.primary} />
              </View>
            </Pressable>
          </Animated.View>
        ) : null}

        {/* ---------------- two core services ---------------- */}
        <View style={styles.serviceRow}>
          <Pressable
            onPress={() => router.push('/tiffins')}
            style={[styles.serviceTile, styles.serviceTileTiffin]}
          >
            <View style={styles.serviceIcon}>
              <UtensilsCrossed size={20} color={Theme.colors.surface} />
            </View>
            <AppText variant="h3" color={Theme.colors.surface}>
              {t('flow.tabs.tiffin')}
            </AppText>
            <AppText variant="caption" color={Theme.colors.surface} style={{ opacity: 0.9 }}>
              {t('home.featuredTiffinSub')}
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => router.push('/restaurants')}
            style={[styles.serviceTile, styles.serviceTileRestaurant]}
          >
            <View style={styles.serviceIcon}>
              <Store size={20} color={Theme.colors.surface} />
            </View>
            <AppText variant="h3" color={Theme.colors.surface}>
              {t('flow.tabs.restaurants')}
            </AppText>
            <AppText variant="caption" color={Theme.colors.surface} style={{ opacity: 0.9 }}>
              {t('restaurants.pureVeg')} · {t('restaurants.subtitle', { count: SEED_RESTAURANTS.length })}
            </AppText>
          </Pressable>
        </View>

        {/* ---------------- tiffin plans ---------------- */}
        <Section
          title={t('home.featuredTiffin')}
          action={t('flow.common.viewAll')}
          onAction={() => router.push('/tiffins')}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {tiffinPlans.map((plan) => (
              <Pressable
                key={plan.id}
                onPress={() => router.push(`/tiffins/${plan.id}/plans`)}
                style={styles.planCard}
              >
                <View style={styles.planBadge}>
                  <AppText variant="caption" color={Theme.colors.success}>
                    {plan.meals} {t('tiffin.mealsPerMonth', { count: plan.meals }).replace(String(plan.meals), '').trim()}
                  </AppText>
                </View>
                <AppText variant="h3" numberOfLines={1}>
                  {label(plan.name, plan.nameGu)}
                </AppText>
                <AppText variant="price" style={{ marginTop: 4 }}>
                  {currency(plan.price)}
                </AppText>
                {plan.mrp ? (
                  <AppText variant="caption" style={styles.strike}>
                    {currency(plan.mrp)}
                  </AppText>
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        </Section>

        {/* ---------------- restaurants ---------------- */}
        <Section
          title={t('home.popular')}
          action={t('flow.common.viewAll')}
          onAction={() => router.push('/restaurants')}
        >
          <View style={{ gap: Theme.spacing.md }}>
            {topRestaurants.map((restaurant, index) => (
              <Animated.View key={restaurant.id} entering={FadeInDown.delay(index * 50).duration(Theme.motion.base)}>
                <Pressable
                  onPress={() => router.push(`/restaurant/${restaurant.id}`)}
                  style={styles.restaurantCard}
                >
                  {restaurant.image ? (
                    <Image source={restaurant.image} style={styles.restaurantThumb} />
                  ) : (
                    <View style={[styles.restaurantThumb, styles.thumbFallback]} />
                  )}
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText variant="h3" numberOfLines={1}>
                      {label(restaurant.name, restaurant.nameGu)}
                    </AppText>
                    <View style={styles.metaRow}>
                      <Star size={12} color={Theme.colors.primary} fill={Theme.colors.primary} />
                      <AppText variant="caption" color={Theme.colors.text}>
                        {restaurant.rating}
                      </AppText>
                      <AppText variant="caption">· {restaurant.deliveryMins} {t('flow.common.mins')}</AppText>
                      <AppText variant="caption">· {restaurant.distanceKm} {t('common.km')}</AppText>
                    </View>
                    {restaurant.offerText ? (
                      <AppText variant="caption" color={Theme.colors.success} numberOfLines={1}>
                        {restaurant.offerText}
                      </AppText>
                    ) : null}
                  </View>
                  <ChevronRight size={16} color={Theme.colors.textMuted} />
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Section>

        {/* ---------------- bestsellers ---------------- */}
        <Section title={t('home.popularDishes')} action={t('flow.common.viewAll')} onAction={() => router.push('/restaurants')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {bestsellers.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/restaurant/${item.restaurantId}`)}
                style={styles.dishCard}
              >
                {item.image ? (
                  <Image source={item.image} style={styles.dishImage} />
                ) : (
                  <View style={[styles.dishImage, styles.thumbFallback]} />
                )}
                <AppText variant="bodySmall" numberOfLines={1} color={Theme.colors.text}>
                  {label(item.name, item.nameGu)}
                </AppText>
                <AppText variant="price">{currency(item.price)}</AppText>
              </Pressable>
            ))}
          </ScrollView>
        </Section>

        {/* ---------------- reels ---------------- */}
        <Pressable onPress={() => router.push('/reels')} style={styles.reelCard}>
          {heroReel.image ? <Image source={heroReel.image} style={styles.reelImage} /> : null}
          <View style={styles.reelOverlay}>
            <View style={styles.reelBadge}>
              <PlayCircle size={13} color={Theme.colors.surface} />
              <AppText variant="caption" color={Theme.colors.surface}>
                {t('flow.reels.todayThali')}
              </AppText>
            </View>
            <AppText variant="h3" color={Theme.colors.surface} numberOfLines={1}>
              {label(heroReel.caption, heroReel.captionGu)}
            </AppText>
          </View>
        </Pressable>

        {/* ---------------- quick links ---------------- */}
        <View style={styles.quickRow}>
          <QuickLink icon={<Receipt size={17} color={Theme.colors.primary} />} label={t('nav.orders')} onPress={() => router.push('/orders')} />
          <QuickLink icon={<Wallet size={17} color={Theme.colors.primary} />} label={t('nav.wallet')} onPress={() => router.push('/wallet')} />
          <QuickLink icon={<UtensilsCrossed size={17} color={Theme.colors.primary} />} label={t('nav.subscriptions')} onPress={() => router.push('/subscription')} />
        </View>

        {cartCount > 0 ? (
          <Pressable onPress={() => router.push('/cart')} style={styles.cartBar}>
            <AppText variant="label" color={Theme.colors.surface}>
              {t('flow.cart.itemsCount', { count: cartCount })} · {t('flow.tabs.cart')}
            </AppText>
            <ChevronRight size={15} color={Theme.colors.surface} />
          </Pressable>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

const Section: React.FC<{
  title: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}> = ({ title, action, onAction, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <AppText variant="h2">{title}</AppText>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <AppText variant="caption" color={Theme.colors.primary}>
            {action}
          </AppText>
        </Pressable>
      ) : null}
    </View>
    {children}
  </View>
);

const QuickLink: React.FC<{ icon: React.ReactNode; label: string; onPress: () => void }> = ({
  icon,
  label,
  onPress,
}) => (
  <Pressable onPress={onPress} style={styles.quickLink}>
    <View style={styles.quickIcon}>{icon}</View>
    <AppText variant="caption">{label}</AppText>
  </Pressable>
);

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Theme.layout.screenPaddingX,
    paddingBottom: Theme.spacing.huge,
    gap: Theme.spacing.lg,
  },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: Theme.spacing.sm },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
  },
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
  liveOrderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.text,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
  },
  liveOrderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.pill,
  },
  serviceRow: { flexDirection: 'row', gap: Theme.spacing.md },
  serviceTile: {
    flex: 1,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    gap: 2,
    ...Theme.shadows.soft,
  },
  serviceTileTiffin: { backgroundColor: Theme.colors.primary },
  serviceTileRestaurant: { backgroundColor: Theme.colors.success },
  serviceIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },
  section: { gap: Theme.spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hScroll: { gap: Theme.spacing.md, paddingRight: Theme.spacing.sm },
  planCard: {
    width: 168,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    ...Theme.shadows.soft,
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.successSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.sm,
  },
  strike: { textDecorationLine: 'line-through' },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    ...Theme.shadows.soft,
  },
  restaurantThumb: { width: 58, height: 58, borderRadius: Theme.borderRadius.md },
  thumbFallback: { backgroundColor: Theme.colors.surfaceSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dishCard: { width: 124, gap: 4 },
  dishImage: { width: 124, height: 88, borderRadius: Theme.borderRadius.lg, marginBottom: 2 },
  reelCard: {
    height: 168,
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  reelImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  reelOverlay: { padding: Theme.spacing.lg, gap: 4, backgroundColor: 'rgba(43,33,28,0.42)' },
  reelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.pill,
  },
  quickRow: { flexDirection: 'row', gap: Theme.spacing.md },
  quickLink: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
  },
  quickIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.pill,
    paddingHorizontal: Theme.spacing.lg,
    height: 48,
  },
});
