import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import { Package, Clock, RefreshCw, Star } from 'lucide-react-native';
import { useLanguage } from '../../context/LanguageContext';

const ACTIVE_ORDERS = [
  { id: '1234', date: 'Today, 12:30 PM', items: '2x Gujarati Thali, 1x Buttermilk', total: '₹260', status: 'On the Way' },
];

const PAST_ORDERS = [
  { id: '1233', date: 'Yesterday, 08:00 PM', items: '1x Punjabi Thali', total: '₹150', status: 'Delivered' },
  { id: '1228', date: '21 Aug, 01:15 PM', items: '2x Gujarati Thali', total: '₹240', status: 'Delivered' },
];

export default function OrdersScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AppText variant="h2" style={styles.headerTitle}>{t('orders.title')}</AppText>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
          activeOpacity={0.8}
        >
          <AppText variant="h3" color={activeTab === 'active' ? '#fff' : Theme.colors.textMuted}>{t('orders.activeOrders')}</AppText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
          activeOpacity={0.8}
        >
          <AppText variant="h3" color={activeTab === 'past' ? '#fff' : Theme.colors.textMuted}>{t('orders.pastOrders')}</AppText>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {activeTab === 'active' && ACTIVE_ORDERS.map((order, index) => (
          <Animated.View key={order.id} entering={FadeInDown.delay(index * 100).springify()}>
            <View style={styles.orderCard}>
               <View style={styles.orderHeader}>
                 <View>
                   <AppText variant="h3">{t('orders.order')} #{order.id}</AppText>
                   <AppText variant="caption" color={Theme.colors.textMuted}>{order.date}</AppText>
                 </View>
                 <View style={styles.statusPill}>
                   <AppText variant="caption" color={Theme.colors.primary} style={{fontWeight: 'bold'}}>{order.status}</AppText>
                 </View>
               </View>
               <View style={styles.divider} />
               <AppText variant="bodySmall" color={Theme.colors.textSecondary} style={{marginBottom: 8}}>{order.items}</AppText>
               <AppText variant="h3" style={{marginBottom: Theme.spacing.lg}}>{order.total}</AppText>
               
               <TouchableOpacity 
                 style={styles.trackButton}
                 activeOpacity={0.7}
                 onPress={() => router.push('/(customer)/tracking/1234')}
               >
                 <Clock size={16} color="#fff" style={{marginRight: 8}} />
                 <AppText variant="button" color="#fff">{t('orders.trackOrder')}</AppText>
               </TouchableOpacity>
            </View>
          </Animated.View>
        ))}

        {activeTab === 'past' && PAST_ORDERS.map((order, index) => (
          <Animated.View key={order.id} entering={FadeInDown.delay(index * 100).springify()}>
            <View style={styles.orderCard}>
               <View style={styles.orderHeader}>
                 <View>
                   <AppText variant="h3">{t('orders.order')} #{order.id}</AppText>
                   <AppText variant="caption" color={Theme.colors.textMuted}>{order.date}</AppText>
                 </View>
                 <AppText variant="caption" color={Theme.colors.success} style={{fontWeight: 'bold'}}>{order.status}</AppText>
               </View>
               <View style={styles.divider} />
               <AppText variant="bodySmall" color={Theme.colors.textSecondary} style={{marginBottom: 8}}>{order.items}</AppText>
               <AppText variant="h3" style={{marginBottom: Theme.spacing.lg}}>{order.total}</AppText>
               
               <View style={styles.pastActionRow}>
                 <TouchableOpacity style={styles.reorderButton} activeOpacity={0.7}>
                   <RefreshCw size={14} color={Theme.colors.text} style={{marginRight: 6}} />
                   <AppText variant="bodySmall">{t('orders.reorder')}</AppText>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.rateButton} activeOpacity={0.7} onPress={() => router.push('/(customer)/reviews')}>
                   <Star size={14} color={Theme.colors.primary} style={{marginRight: 6}} />
                   <AppText variant="bodySmall" color={Theme.colors.primary}>{t('orders.rateOrder')}</AppText>
                 </TouchableOpacity>
               </View>
            </View>
          </Animated.View>
        ))}

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
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Theme.spacing.xl,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.pill,
    padding: 4,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.pill,
  },
  activeTab: {
    backgroundColor: Theme.colors.text,
  },
  content: {
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
    gap: Theme.spacing.lg,
  },
  orderCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusPill: {
    backgroundColor: Theme.colors.surfaceHighlight, // Light orange
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.pill,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.md,
  },
  trackButton: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.primary,
    height: 48,
    borderRadius: Theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pastActionRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  reorderButton: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateButton: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
