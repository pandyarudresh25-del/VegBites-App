import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TextInput, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { AppPressable } from '../../components/AppPressable';
import { Theme } from '../../theme';
import { Search, MapPin, User as UserIcon } from 'lucide-react-native';
import { useLanguage } from '../../context/LanguageContext';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', name: 'Thali', image: require('../../../assets/images/gujarati_thali.jpg') },
  { id: '2', name: 'Punjabi', image: require('../../../assets/images/punjabi_thali.jpg') },
  { id: '3', name: 'Jain Food', image: require('../../../assets/images/jain_food.jpg') },
  { id: '4', name: 'South Indian', image: require('../../../assets/images/south_indian.jpg') },
  { id: '5', name: 'More', image: require('../../../assets/images/icon.png') },
];

const POPULAR = [
  { id: 'p1', name: 'Gujarati Thali', price: '₹120', image: require('../../../assets/images/gujarati_thali.jpg') },
  { id: 'p2', name: 'Punjabi Thali', price: '₹150', image: require('../../../assets/images/punjabi_thali.jpg') },
];

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header */}
      <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.header}>
        <View style={styles.headerLeft}>
          <AppPressable style={styles.locationRow} onPress={() => router.push('/(customer)/address')}>
            <MapPin size={16} color={Theme.colors.primary} />
            <AppText variant="h3" style={styles.locationText}>Ahmedabad, Gujarat</AppText>
          </AppPressable>
          <AppText variant="body" color={Theme.colors.textSecondary} style={styles.greeting}>{t('home.greeting')} 👋</AppText>
        </View>
        <AppPressable style={styles.avatar} onPress={() => router.push('/(customer)/profile')}>
          <Image source={require('../../../assets/images/icon.png')} style={styles.avatarImage} />
        </AppPressable>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 2. Search Bar */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.searchWrapper}>
          <AppPressable style={styles.searchContainer} onPress={() => {}} scaleTo={0.97}>
            <Search size={20} color={Theme.colors.textMuted} style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder={t('home.searchPlaceholder')}
              placeholderTextColor={Theme.colors.textMuted}
              editable={false}
              pointerEvents="none"
            />
          </AppPressable>
        </Animated.View>

        {/* 3. Two Large Cards */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.mainOptionsContainer}>
          <AppPressable style={styles.mainCard} scaleTo={0.96} onPress={() => router.push('/(customer)/tiffins')}>
             <AppText variant="h3" style={styles.mainCardTitle} align="center">{t('home.tiffinService')}</AppText>
             <Image source={require('../../../assets/images/gujarati_thali.jpg')} style={[styles.mainCardImage, { borderRadius: 30 }]} />
          </AppPressable>
          <AppPressable style={styles.mainCard} scaleTo={0.96} onPress={() => router.push('/(customer)/restaurants')}>
             <AppText variant="h3" style={styles.mainCardTitle} align="center">{t('home.restaurant')}</AppText>
             <Image source={require('../../../assets/images/south_indian.jpg')} style={[styles.mainCardImage, { borderRadius: 30 }]} />
          </AppPressable>
        </Animated.View>

        {/* 3.5 Top Rated */}
        <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="h3" style={styles.sectionTitle}>{t('home.topRated')}</AppText>
            <AppText variant="button" color={Theme.colors.primary} style={{fontSize: 14}}>{t('home.viewAll')}</AppText>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topRatedScroll}>
            {[
              { id: 't1', name: 'Gujarati Thali', rating: '4.8', vendor: 'Shree Krishna Tiffin', image: require('../../../assets/images/gujarati_thali.jpg') },
              { id: 't2', name: 'Punjabi Thali', rating: '4.5', vendor: 'Maa ni Rasoi', image: require('../../../assets/images/punjabi_thali.jpg') }
            ].map((item, idx) => (
              <Animated.View key={item.id} entering={FadeInRight.delay(250 + idx * 50).springify()}>
                <AppPressable style={styles.topRatedCard} scaleTo={0.96}>
                  <Image source={item.image as any} style={styles.topRatedImage} />
                  <View style={styles.ratingBadge}>
                     <AppText variant="caption" color="#FFF" style={{fontWeight: '700'}}>★ {item.rating}</AppText>
                  </View>
                  <AppText variant="h3" style={{marginTop: 8}}>{item.name}</AppText>
                  <AppText variant="caption" color={Theme.colors.textSecondary}>{item.vendor}</AppText>
                </AppPressable>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* 4. Categories */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="h3" style={styles.sectionTitle}>{t('home.categories')}</AppText>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {CATEGORIES.map((cat, idx) => (
              <Animated.View key={cat.id} entering={FadeInRight.delay(300 + idx * 50).springify()}>
                <AppPressable style={styles.categoryItem} scaleTo={0.9}>
                  <View style={styles.categoryIconContainer}>
                    <Image source={cat.image as any} style={styles.categoryImage} />
                  </View>
                  <AppText variant="caption" align="center" style={styles.categoryText}>{cat.name}</AppText>
                </AppPressable>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* 5. Popular Near You */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="h3" style={styles.sectionTitle}>{t('home.popular')}</AppText>
          </View>
          <View style={styles.popularList}>
            {POPULAR.map((item, idx) => (
              <Animated.View key={item.id} entering={FadeInRight.delay(400 + idx * 50).springify()}>
                <AppPressable style={styles.popularCard} scaleTo={0.98}>
                  <Image source={item.image as any} style={styles.popularImage} />
                  <View style={styles.popularInfo}>
                    <AppText variant="h3">{item.name}</AppText>
                    <AppText variant="price" color={Theme.colors.textSecondary} style={{marginTop: 4}}>{item.price}</AppText>
                  </View>
                </AppPressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.surfaceSecondary,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingBottom: Theme.spacing.xxl,
  },
  searchWrapper: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    height: 52,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.lg,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Theme.colors.text,
  },
  mainOptionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  mainCard: {
    flex: 1,
    backgroundColor: Theme.colors.surfaceHighlight, // Light peach
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    height: 160,
    justifyContent: 'space-between',
  },
  mainCardTitle: {
    fontSize: 16,
    lineHeight: 20,
  },
  mainCardImage: {
    width: 70,
    height: 70,
    resizeMode: 'cover',
  },
  section: {
    marginTop: Theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
  },
  topRatedScroll: {
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  topRatedCard: {
    width: width * 0.45,
  },
  topRatedImage: {
    width: '100%',
    height: 120,
    borderRadius: Theme.borderRadius.lg,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  categoriesScroll: {
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.lg,
  },
  categoryItem: {
    alignItems: 'center',
    width: 60,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  popularList: {
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  popularCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
  },
  popularImage: {
    width: 70,
    height: 70,
    borderRadius: Theme.borderRadius.md,
  },
  popularInfo: {
    flex: 1,
    paddingLeft: Theme.spacing.md,
  },
});
