import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import { ArrowLeft, Tag } from 'lucide-react-native';
import { useLanguage } from '../../context/LanguageContext';

const CART_ITEMS = [
  { id: '1', name: 'Gujarati Thali', quantity: 1, price: 120, image: require('../../../assets/images/gujarati_thali.jpg') },
  { id: '2', name: 'Buttermilk', quantity: 1, price: 20, image: require('../../../assets/images/south_indian.jpg') },
  { id: '3', name: 'Papad', quantity: 1, price: 15, image: require('../../../assets/images/jain_food.jpg') },
];

export default function CartScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const itemTotal = CART_ITEMS.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 30;
  const platformFee = 5;
  const taxes = 12;
  const discount = 15;
  const total = itemTotal + deliveryFee + platformFee + taxes - discount;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>{t('cart.title')}</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.itemsList}>
          {CART_ITEMS.map((item, index) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(100 + index * 50).springify()}>
              <View style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Image source={item.image as any} style={styles.itemImage} />
                  <AppText variant="h3">{item.name} <AppText variant="bodySmall" color={Theme.colors.textMuted}>x{item.quantity}</AppText></AppText>
                </View>
                <AppText variant="h3">₹{item.price}</AppText>
              </View>
              {index < CART_ITEMS.length - 1 && (
                <View style={styles.dottedDivider} />
              )}
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.offersSection}>
           <TouchableOpacity style={styles.offerRow} activeOpacity={0.7}>
              <View style={styles.offerLeft}>
                 <Tag size={20} color={Theme.colors.primary} />
                 <AppText variant="h3">{t('cart.applyCoupon')}</AppText>
              </View>
              <AppText variant="caption" color={Theme.colors.primary}>{t('cart.viewOffers')}</AppText>
           </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.billDetailsCard}>
           <AppText variant="h3" style={styles.billTitle}>{t('cart.billDetails')}</AppText>
           
           <View style={styles.billRow}>
             <AppText variant="bodySmall" color={Theme.colors.textSecondary}>{t('cart.itemTotal')}</AppText>
             <AppText variant="bodySmall" color={Theme.colors.textSecondary}>₹{itemTotal}</AppText>
           </View>
           
           <View style={styles.billRow}>
             <AppText variant="bodySmall" color={Theme.colors.textSecondary}>{t('cart.deliveryFee')}</AppText>
             <AppText variant="bodySmall" color={Theme.colors.textSecondary}>₹{deliveryFee}</AppText>
           </View>
           
           <View style={styles.billRow}>
             <AppText variant="bodySmall" color={Theme.colors.textSecondary}>{t('cart.platformFee')}</AppText>
             <AppText variant="bodySmall" color={Theme.colors.textSecondary}>₹{platformFee}</AppText>
           </View>

           <View style={styles.billRow}>
             <AppText variant="bodySmall" color={Theme.colors.textSecondary}>{t('cart.taxes')}</AppText>
             <AppText variant="bodySmall" color={Theme.colors.textSecondary}>₹{taxes}</AppText>
           </View>
           
           <View style={styles.billRow}>
             <AppText variant="bodySmall" color={Theme.colors.success}>{t('cart.discount')}</AppText>
             <AppText variant="bodySmall" color={Theme.colors.success}>-₹{discount}</AppText>
           </View>
           
           <View style={styles.solidDivider} />

           <View style={styles.totalRow}>
             <AppText variant="h2">{t('cart.grandTotal')}</AppText>
             <AppText variant="h2">₹{total}</AppText>
           </View>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.footer}>
        <TouchableOpacity 
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(customer)/checkout')}
        >
          <AppText variant="button">{t('cart.proceedToCheckout')}</AppText>
        </TouchableOpacity>
      </Animated.View>
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
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
  },
  content: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  itemsList: {
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xl,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  dottedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderStyle: 'dashed',
    marginVertical: Theme.spacing.md,
  },
  offersSection: {
    marginBottom: Theme.spacing.xl,
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderStyle: 'dashed',
  },
  offerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  billDetailsCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  billTitle: {
    marginBottom: Theme.spacing.lg,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  solidDivider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
  },
  footer: {
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    height: 56,
    borderRadius: Theme.borderRadius.pill,
  }
});
