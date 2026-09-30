import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { AppText } from '../../../../components/AppText';
import { AppButton } from '../../../../components/AppButton';
import { Theme } from '../../../../theme';
import { ArrowLeft, Star, Clock, MapPin } from 'lucide-react-native';
import { useLanguage } from '../../../../context/LanguageContext';

const MENU_ITEMS = [
  { id: '1', name: 'Gujarati Thali', price: '₹120', rating: '4.8', image: require('../../../../../assets/images/gujarati_thali.jpg') },
  { id: '2', name: 'Punjabi Thali', price: '₹150', rating: '4.5', image: require('../../../../../assets/images/punjabi_thali.jpg') },
  { id: '3', name: 'Jain Thali', price: '₹140', rating: '4.7', image: require('../../../../../assets/images/jain_food.jpg') },
];

export default function VendorMenuScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>{t('vendor.menu')}</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Vendor Header */}
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.vendorHeader}>
          <Image source={require('../../../../../assets/images/gujarati_thali.jpg')} style={styles.vendorCover} />
          <View style={styles.vendorInfoCard}>
            <AppText variant="h2" style={styles.vendorName}>Shree Krishna Tiffin</AppText>
            <View style={styles.vendorMeta}>
              <View style={styles.ratingBadge}>
                <Star size={12} color="#fff" fill="#fff" />
                <AppText variant="caption" color="#fff" style={styles.ratingText}>4.8</AppText>
              </View>
              <AppText variant="caption" color={Theme.colors.textMuted}>Gujarati Thali • 20 mins</AppText>
            </View>
          </View>
        </Animated.View>

        {/* Build Your Thali Banner */}
        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
          <TouchableOpacity 
            style={styles.buildThaliCard} 
            activeOpacity={0.8}
            onPress={() => router.push(`/customer/tiffins/${id}/thali` as any)}
          >
            <View style={styles.buildThaliContent}>
               <AppText variant="h2" style={{marginBottom: 4}}>{t('vendor.buildYourThali')}</AppText>
               <AppText variant="bodySmall" color={Theme.colors.textSecondary} style={{marginBottom: 12}}>
                 {t('vendor.customizeThali')}
               </AppText>
               <AppButton 
                 title={t('vendor.buildNow')} 
                 onPress={() => router.push(`/customer/tiffins/${id}/thali` as any)} 
                 style={styles.buildButton}
               />
            </View>
            <Image source={require('../../../../../assets/images/gujarati_thali.jpg')} style={styles.buildThaliImage} />
          </TouchableOpacity>
        </Animated.View>

        {/* Popular Items */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>{t('vendor.popularItems')}</AppText>
          <View style={styles.menuList}>
            {MENU_ITEMS.map((item, idx) => (
              <Animated.View key={item.id} entering={FadeInRight.delay(250 + idx * 50).springify()}>
                <View style={styles.menuItemCard}>
                  <Image source={item.image as any} style={styles.menuItemImage} />
                  <View style={styles.menuItemInfo}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                      <AppText variant="h3">{item.name}</AppText>
                      <View style={[styles.ratingBadge, {backgroundColor: Theme.colors.success, paddingHorizontal: 4}]}>
                         <Star size={10} color="#fff" fill="#fff" />
                         <AppText variant="caption" color="#fff" style={{fontSize: 10}}>{item.rating}</AppText>
                      </View>
                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12}}>
                      <AppText variant="price" color={Theme.colors.text}>{item.price}</AppText>
                      <TouchableOpacity style={styles.addButton}>
                        <AppText variant="button" color={Theme.colors.primary} style={{fontSize: 14}}>{t('vendor.add')}</AppText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
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
    paddingBottom: Theme.spacing.xxl,
  },
  vendorHeader: {
    marginBottom: Theme.spacing.xl,
  },
  vendorCover: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  vendorInfoCard: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: Theme.spacing.xl,
    marginTop: -40,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    alignItems: 'center',
  },
  vendorName: {
    fontSize: 22,
    marginBottom: 8,
  },
  vendorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  ratingText: {
    fontWeight: '800',
  },
  buildThaliCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF0DE', // Light peach/orange matching brand
    marginHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    height: 140,
    marginBottom: Theme.spacing.xl,
  },
  buildThaliContent: {
    flex: 1,
    padding: Theme.spacing.lg,
    justifyContent: 'center',
  },
  buildButton: {
    height: 36,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.pill,
    alignSelf: 'flex-start',
  },
  buildThaliImage: {
    width: 140,
    height: '100%',
    resizeMode: 'cover',
  },
  section: {
    marginTop: Theme.spacing.sm,
  },
  sectionTitle: {
    paddingHorizontal: Theme.spacing.xl,
    marginBottom: Theme.spacing.md,
    fontSize: 18,
  },
  menuList: {
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.lg,
  },
  menuItemCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemImage: {
    width: 90,
    height: 90,
    borderRadius: Theme.borderRadius.md,
  },
  menuItemInfo: {
    flex: 1,
    paddingLeft: Theme.spacing.md,
    justifyContent: 'center',
  },
  addButton: {
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.pill,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});
