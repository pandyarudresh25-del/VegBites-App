import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import { ArrowLeft, MapPin, Clock, Edit2 } from 'lucide-react-native';
import { useLanguage } from '../../context/LanguageContext';

export default function CheckoutScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [deliveryTiming, setDeliveryTiming] = useState<'morning' | 'evening'>('morning');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>{t('checkout.title')}</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Delivery Address Section */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.sectionCard}>
           <View style={styles.sectionHeader}>
             <AppText variant="h3">{t('checkout.deliveryAddress')}</AppText>
             <TouchableOpacity style={styles.editButton} onPress={() => router.push('/(customer)/address')}>
                <Edit2 size={14} color={Theme.colors.primary} />
                <AppText variant="bodySmall" color={Theme.colors.primary} style={{marginLeft: 4}}>{t('checkout.edit')}</AppText>
             </TouchableOpacity>
           </View>
           
           <View style={styles.addressRow}>
             <View style={styles.addressIconWrapper}>
                <MapPin size={20} color={Theme.colors.primary} />
             </View>
             <View style={styles.addressDetails}>
                <AppText variant="h3" style={{marginBottom: 2}}>Home</AppText>
                <AppText variant="bodySmall" color={Theme.colors.textSecondary}>B-402, Shivam Apartment, Vastrapur, Ahmedabad</AppText>
             </View>
           </View>
           <View style={styles.mapPreview}>
             <Image source={require('../../../assets/images/gujarati_thali.jpg')} style={styles.mapPreviewImage} />
           </View>
        </Animated.View>

        {/* Delivery Timing Section */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.sectionCard}>
           <View style={styles.sectionHeader}>
             <AppText variant="h3">{t('checkout.deliveryTiming')}</AppText>
           </View>
           
           <View style={styles.timingGrid}>
             <TouchableOpacity 
               style={[styles.timingOption, deliveryTiming === 'morning' && styles.timingOptionActive]}
               onPress={() => setDeliveryTiming('morning')}
               activeOpacity={0.7}
             >
               <Clock size={20} color={deliveryTiming === 'morning' ? Theme.colors.primary : Theme.colors.textMuted} />
               <View style={{marginLeft: 12}}>
                 <AppText variant="h3" color={deliveryTiming === 'morning' ? Theme.colors.text : Theme.colors.textMuted}>{t('checkout.morning')}</AppText>
                 <AppText variant="bodySmall" color={Theme.colors.textSecondary}>{t('checkout.morningTime')}</AppText>
               </View>
             </TouchableOpacity>

             <TouchableOpacity 
               style={[styles.timingOption, deliveryTiming === 'evening' && styles.timingOptionActive]}
               onPress={() => setDeliveryTiming('evening')}
               activeOpacity={0.7}
             >
               <Clock size={20} color={deliveryTiming === 'evening' ? Theme.colors.primary : Theme.colors.textMuted} />
               <View style={{marginLeft: 12}}>
                 <AppText variant="h3" color={deliveryTiming === 'evening' ? Theme.colors.text : Theme.colors.textMuted}>{t('checkout.evening')}</AppText>
                 <AppText variant="bodySmall" color={Theme.colors.textSecondary}>{t('checkout.eveningTime')}</AppText>
               </View>
             </TouchableOpacity>
           </View>
        </Animated.View>

        {/* Order Summary */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.sectionCard}>
           <View style={styles.sectionHeader}>
             <AppText variant="h3">{t('checkout.orderSummary')}</AppText>
           </View>
           <View style={styles.summaryRow}>
             <AppText variant="body">1x Gujarati Thali</AppText>
             <AppText variant="body">₹120</AppText>
           </View>
           <View style={styles.summaryRow}>
             <AppText variant="body">1x Buttermilk</AppText>
             <AppText variant="body">₹20</AppText>
           </View>
           <View style={styles.summaryRow}>
             <AppText variant="body">1x Papad</AppText>
             <AppText variant="body">₹15</AppText>
           </View>
           <View style={styles.solidDivider} />
           <View style={styles.summaryRow}>
             <AppText variant="h3">{t('checkout.totalInclTaxes')}</AppText>
             <AppText variant="h2">₹155</AppText>
           </View>
        </Animated.View>

      </ScrollView>

      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.footer}>
        <View style={styles.footerTotal}>
           <AppText variant="bodySmall" color={Theme.colors.textSecondary}>{t('checkout.grandTotal')}</AppText>
           <AppText variant="h2">₹155</AppText>
        </View>
        <TouchableOpacity 
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(customer)/payments')}
        >
          <AppText variant="button">{t('checkout.selectPayment')}</AppText>
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
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
    gap: Theme.spacing.lg,
  },
  sectionCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  addressIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  addressDetails: {
    flex: 1,
  },
  mapPreview: {
    height: 80,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
  },
  mapPreviewImage: {
    width: '100%',
    height: '100%',
  },
  timingGrid: {
    gap: Theme.spacing.sm,
  },
  timingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  timingOptionActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  solidDivider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  footerTotal: {
    flex: 1,
  },
  actionButton: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    height: 56,
    borderRadius: Theme.borderRadius.pill,
  }
});
