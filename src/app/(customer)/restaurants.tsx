import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { AppPressable } from '../../components/AppPressable';
import { Theme } from '../../theme';
import { Search, MapPin, Clock, ArrowLeft, Star, SlidersHorizontal } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function RestaurantsScreen() {
  const router = useRouter();
  
  const restaurants = [
    { id: 'r1', name: 'Honest Restaurant', cuisine: 'Fast Food, North Indian', rating: '4.5', time: '30-40 min', price: '₹200 for two', image: require('../../../assets/images/punjabi_thali.jpg'), offer: '50% OFF', suboffer: 'UPTO ₹100' },
    { id: 'r2', name: 'Gopi Dining Hall', cuisine: 'Gujarati Thali, Punjabi', rating: '4.8', time: '40-50 min', price: '₹400 for two', image: require('../../../assets/images/gujarati_thali.jpg'), offer: 'FREE SWEET', suboffer: 'ON ORDERS ABOVE ₹300' },
    { id: 'r3', name: 'Sankalp', cuisine: 'South Indian, Dosa', rating: '4.6', time: '25-35 min', price: '₹300 for two', image: require('../../../assets/images/south_indian.jpg'), offer: '20% OFF', suboffer: 'UPTO ₹50' },
    { id: 'r4', name: 'Bikanervala', cuisine: 'Sweets, Snacks, North Indian', rating: '4.4', time: '20-30 min', price: '₹250 for two', image: require('../../../assets/images/jain_food.jpg'), offer: 'FREE DELIVERY', suboffer: '' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AppPressable onPress={() => router.back()} style={styles.backButton} scaleTo={0.9}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </AppPressable>
        <AppText variant="h2" style={styles.headerTitle}>Restaurants</AppText>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Theme.colors.primary} />
          <View style={styles.searchDivider} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search for restaurants..."
            placeholderTextColor={Theme.colors.textMuted}
          />
          <AppPressable style={styles.filterButton}>
            <SlidersHorizontal size={20} color={Theme.colors.textSecondary} />
          </AppPressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Categories Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContent}>
          {['All', 'Gujarati', 'Punjabi', 'South Indian', 'Jain', 'Fast Food'].map((cat, i) => (
             <AppPressable key={cat} style={[styles.chip, i === 0 && styles.activeChip]} scaleTo={0.9}>
               <AppText variant="button" color={i === 0 ? Theme.colors.surface : Theme.colors.textSecondary}>
                 {cat}
               </AppText>
             </AppPressable>
          ))}
        </ScrollView>

        <AppText variant="h3" style={styles.sectionTitle}>Explore near you</AppText>

        <View style={styles.list}>
          {restaurants.map((item, index) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(index * 100).springify()}>
              <AppPressable scaleTo={0.98} onPress={() => router.push(`/customer/restaurant/${item.id}` as any)}>
                <View style={styles.restaurantCard}>
                  <View style={styles.restaurantImageContainer}>
                    <Image source={item.image} style={styles.restaurantImage} />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.restaurantGradient}
                    />
                    <View style={styles.offerBadge}>
                      <AppText variant="h3" color="#fff" style={styles.offerText}>{item.offer}</AppText>
                      {item.suboffer ? (
                        <AppText variant="caption" color="#fff" style={styles.offerSubtext}>{item.suboffer}</AppText>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.restaurantInfo}>
                    <View style={styles.restaurantHeaderRow}>
                      <AppText variant="h3" style={styles.name} numberOfLines={1}>{item.name}</AppText>
                      <View style={styles.ratingBadge}>
                        <AppText variant="caption" color="#fff" style={styles.ratingText}>{item.rating}</AppText>
                        <Star size={10} color="#fff" fill="#fff" />
                      </View>
                    </View>
                    <AppText variant="bodySmall" color={Theme.colors.textSecondary} numberOfLines={1}>
                      {item.cuisine} • {item.price}
                    </AppText>
                    <View style={styles.metaRow}>
                      <Clock size={12} color={Theme.colors.textMuted} />
                      <AppText variant="caption" color={Theme.colors.textMuted}> {item.time} • 2.5 km</AppText>
                    </View>
                  </View>
                </View>
              </AppPressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
  },
  headerTitle: {
    fontSize: 22,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  searchContainer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.md,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  searchDivider: {
    width: 1,
    height: 24,
    backgroundColor: Theme.colors.border,
    marginHorizontal: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.text,
    fontWeight: '500',
  },
  filterButton: {
    padding: Theme.spacing.xs,
  },
  content: {
    paddingBottom: Theme.spacing.xxl,
    backgroundColor: Theme.colors.background,
  },
  chipScroll: {
    marginVertical: Theme.spacing.lg,
  },
  chipContent: {
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  chip: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  activeChip: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOpacity: 0.1,
  },
  sectionTitle: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  list: {
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.xl,
  },
  restaurantCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: Theme.spacing.sm,
  },
  restaurantImageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  restaurantGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  offerBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: Theme.spacing.lg,
  },
  offerText: {
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  offerSubtext: {
    fontWeight: '700',
    opacity: 0.9,
  },
  restaurantInfo: {
    padding: Theme.spacing.lg,
  },
  restaurantHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
});
