import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { 
  useAnimatedScrollHandler, 
  useSharedValue, 
  useAnimatedStyle, 
  interpolate, 
  Extrapolation,
  FadeInUp,
  FadeIn
} from 'react-native-reanimated';
import { AppText } from '../../../components/AppText';
import { AppButton } from '../../../components/AppButton';
import { AppPressable } from '../../../components/AppPressable';
import { Theme } from '../../../theme';
import { ArrowLeft, Star, Clock, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const MENU_ITEMS = [
  { id: 'm1', name: 'Gujarati Thali', desc: 'Rotli, 2 Sabji, Dal, Rice, Sweet, Farsan, Papad', price: 180, isVeg: true, image: require('../../../../assets/images/gujarati_thali.jpg') },
  { id: 'm2', name: 'Special Punjabi Thali', desc: 'Naan, Paneer Sabji, Dal Makhani, Rice, Sweet', price: 220, isVeg: true, image: require('../../../../assets/images/gujarati_thali.jpg') },
  { id: 'm3', name: 'Dal Dhokli', desc: 'Traditional Gujarati comfort food made with wheat flour', price: 120, isVeg: true, image: require('../../../../assets/images/gujarati_thali.jpg') },
];

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const scrollY = useSharedValue(0);
  const [cart, setCart] = useState<Record<string, number>>({});

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(scrollY.value, [0, 240], [280, 110], Extrapolation.CLAMP);
    return { height };
  });

  const imageOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 200], [1, 0], Extrapolation.CLAMP);
    return { opacity };
  });

  const headerTitleOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [150, 200], [0, 1], Extrapolation.CLAMP);
    return { opacity };
  });

  const addToCart = (itemId: string) => {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      if (current <= 1) {
        const newCart = { ...prev };
        delete newCart[itemId];
        return newCart;
      }
      return { ...prev, [itemId]: current - 1 };
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = MENU_ITEMS.reduce((sum, item) => sum + (cart[item.id] || 0) * item.price, 0);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerContainer, headerStyle]}>
        <Animated.View style={[styles.headerImageContainer, imageOpacity]}>
          <Image 
            source={require('../../../../assets/images/gujarati_thali.jpg')} 
            style={styles.headerImage}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.8)']}
            style={styles.headerGradient}
          />
        </Animated.View>
        <SafeAreaView style={styles.headerTop}>
           <AppPressable onPress={() => router.back()} style={styles.backButton}>
             <ArrowLeft size={24} color={Theme.colors.surface} />
           </AppPressable>
           <Animated.View style={headerTitleOpacity}>
             <AppText variant="h3" color={Theme.colors.surface}>Gopi Dining Hall</AppText>
           </Animated.View>
           <View style={{ width: 40 }} />
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView 
        onScroll={scrollHandler} 
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.infoSection}>
           <View style={styles.titleRow}>
             <AppText variant="h1" style={styles.name}>Gopi Dining Hall</AppText>
             <View style={styles.ratingBadge}>
               <Star size={14} color="#fff" fill="#fff" />
               <AppText variant="button" color="#fff">4.8</AppText>
             </View>
           </View>
           <AppText variant="body" color={Theme.colors.textSecondary}>Authentic Gujarati Thali, Punjabi</AppText>
           
           <View style={styles.metaRow}>
             <View style={styles.metaItem}>
               <Clock size={16} color={Theme.colors.textMuted} />
               <AppText variant="caption" color={Theme.colors.textMuted}>40-50 min</AppText>
             </View>
             <View style={styles.metaItem}>
               <Info size={16} color={Theme.colors.textMuted} />
               <AppText variant="caption" color={Theme.colors.textMuted}>Pure Veg</AppText>
             </View>
           </View>
        </Animated.View>

        <View style={styles.menuSection}>
          <AppText variant="h2" style={styles.menuTitle}>Recommended</AppText>
            <View style={styles.menuList}>
              {MENU_ITEMS.map((item, index) => (
                <View key={item.id}>
                  <TouchableOpacity 
                    style={styles.menuItem} 
                    activeOpacity={0.7}
                    onPress={() => router.push('/(customer)/restaurant/item')}
                  >
                    <View style={styles.itemInfo}>
                      <View style={styles.vegIconContainer}>
                        <View style={styles.vegIconInner} />
                      </View>
                      <AppText variant="h3" style={{ marginBottom: 6 }}>{item.name}</AppText>
                      <AppText variant="price" style={{ marginBottom: 8 }}>₹{item.price}</AppText>
                      <AppText variant="caption" color={Theme.colors.textMuted} numberOfLines={2} style={{ lineHeight: 18 }}>
                        {item.desc}
                      </AppText>
                    </View>
                    <View style={styles.itemImageContainer}>
                      <Image source={{ uri: item.image }} style={styles.itemImage} />
                      <View style={styles.addButtonWrapper}>
                        {cart[item.id] ? (
                          <View style={styles.qtyControls}>
                             <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.qtyBtn}>
                               <AppText variant="h3" color={Theme.colors.surface}>-</AppText>
                             </TouchableOpacity>
                             <AppText variant="h3" color={Theme.colors.surface}>{cart[item.id]}</AppText>
                             <TouchableOpacity onPress={() => addToCart(item.id)} style={styles.qtyBtn}>
                               <AppText variant="h3" color={Theme.colors.surface}>+</AppText>
                             </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity onPress={() => addToCart(item.id)} style={styles.addBtn}>
                            <AppText variant="h3" color={Theme.colors.primary}>ADD</AppText>
                            <AppText variant="h3" color={Theme.colors.primary} style={styles.addBtnPlus}>+</AppText>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                  {index < MENU_ITEMS.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
        </View>
      </Animated.ScrollView>

      {totalItems > 0 && (
        <Animated.View entering={FadeInUp.duration(400)} style={styles.cartFooter}>
          <SafeAreaView>
            <AppPressable 
              style={styles.cartBar}
              scaleTo={0.97}
              onPress={() => router.push('/(customer)/cart')}
            >
              <View>
                <AppText variant="h3" color="#fff">{totalItems} Item{totalItems > 1 ? 's' : ''}</AppText>
                <AppText variant="bodySmall" color="#fff" style={{ opacity: 0.9 }}>₹{totalPrice} plus taxes</AppText>
              </View>
              <View style={styles.cartBarRight}>
                <AppText variant="h3" color="#fff" style={{ marginRight: 8 }}>View Cart</AppText>
                <ArrowLeft size={20} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} />
              </View>
            </AppPressable>
          </SafeAreaView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Theme.colors.primary,
  },
  headerImageContainer: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: Theme.colors.text,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 280,
    paddingBottom: 140,
  },
  infoSection: {
    padding: Theme.spacing.xl,
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32, // overlap header
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  name: {
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Theme.spacing.xl,
    marginTop: Theme.spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuSection: {
    marginTop: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  menuList: {},
  menuTitle: {
    paddingVertical: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
  },
  vegIconContainer: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: Theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 8,
  },
  vegIconInner: {
    width: 8,
    height: 8,
    backgroundColor: Theme.colors.success,
    borderRadius: 4,
  },
  itemInfo: {
    flex: 1,
    paddingRight: Theme.spacing.lg,
  },
  itemImageContainer: {
    alignItems: 'center',
    width: 140,
    height: 140,
  },
  itemImage: {
    width: 140,
    height: 140,
    borderRadius: 24,
    backgroundColor: Theme.colors.surfaceSecondary,
  },
  addButtonWrapper: {
    position: 'absolute',
    bottom: -16,
    width: 120,
    alignSelf: 'center',
  },
  addBtn: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnPlus: {
    position: 'absolute',
    right: 12,
    top: 6,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.primary,
    borderRadius: 16,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 10,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  qtyBtn: {
    paddingHorizontal: 12,
  },
  cartFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
  },
  cartBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    marginHorizontal: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    borderRadius: 20,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  cartBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
