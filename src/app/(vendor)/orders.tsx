import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { AppCard } from '../../components/AppCard';
import { AppButton } from '../../components/AppButton';
import { Theme } from '../../theme';
import { Package, Clock } from 'lucide-react-native';

const VENDOR_ORDERS = [
  { id: '1234', customer: 'Jay Patel', items: '2 Thali (Gujarati, Punjabi)', total: 240, status: 'New' },
  { id: '1235', customer: 'Amit Shah', items: '1 Jain Thali', total: 140, status: 'Preparing' },
  { id: '1236', customer: 'Neha Desai', items: '4 Regular Thali', total: 400, status: 'Food Ready' },
];

export default function VendorOrdersScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'active' | 'completed'>('active');

  const filteredOrders = VENDOR_ORDERS; // Mock filtering

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AppText variant="h2">Orders</AppText>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, tab === 'active' && styles.activeTab]}
          onPress={() => setTab('active')}
        >
          <AppText variant="button" color={tab === 'active' ? Theme.colors.primary : Theme.colors.textMuted}>
            Active
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, tab === 'completed' && styles.activeTab]}
          onPress={() => setTab('completed')}
        >
          <AppText variant="button" color={tab === 'completed' ? Theme.colors.primary : Theme.colors.textMuted}>
            Completed
          </AppText>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
             <Package size={48} color={Theme.colors.border} />
             <AppText variant="h3" color={Theme.colors.textMuted} style={{ marginTop: Theme.spacing.md }}>
               No orders found
             </AppText>
          </View>
        ) : (
          filteredOrders.map((order, index) => (
            <Animated.View key={order.id} entering={FadeInDown.delay(index * 100).springify()}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => router.push(`/order/${order.id}` as any)}>
                <AppCard padding="lg" style={styles.orderCard}>
                   <View style={styles.orderHeader}>
                     <AppText variant="h3">#{order.id}</AppText>
                     <AppText variant="price">₹{order.total}</AppText>
                   </View>
                   
                   {order.status === 'Preparing' ? (
                     <AppButton 
                       title="Update to Ready" 
                       onPress={() => router.push(`/order/${order.id}` as any)}
                     />
                   ) : (
                     <View style={styles.customerRow}>
                       <AppText variant="body" style={styles.customerName}>{order.customer}</AppText>
                       <View style={styles.statusBadge}>
                         <AppText variant="caption" color={Theme.colors.primary}>{order.status}</AppText>
                       </View>
                     </View>
                   )}
                   
                   <AppText variant="bodySmall" color={Theme.colors.textMuted}>{order.items}</AppText>
                   
                   <View style={styles.timeRow}>
                     <Clock size={14} color={Theme.colors.textMuted} />
                     <AppText variant="caption" color={Theme.colors.textMuted}>Ordered 5 mins ago</AppText>
                   </View>
                </AppCard>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}

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
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Theme.colors.primary,
  },
  content: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  orderCard: {
    gap: Theme.spacing.xs,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  customerName: {
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: Theme.colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Theme.spacing.sm,
  },
});
