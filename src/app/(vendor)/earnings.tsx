import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { AppCard } from '../../components/AppCard';
import { Theme } from '../../theme';
import { TrendingUp, Calendar, CreditCard, ChevronRight } from 'lucide-react-native';

export default function VendorEarningsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AppText variant="h2">Earnings</AppText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <Animated.View entering={FadeInDown.delay(0).springify()}>
          <AppCard padding="lg" style={styles.balanceCard}>
            <AppText variant="caption" color={Theme.colors.surfaceSecondary}>Available Balance</AppText>
            <AppText variant="h1" color="#fff" style={styles.balanceText}>₹12,450.00</AppText>
            <TouchableOpacity style={styles.withdrawBtn} activeOpacity={0.8}>
               <AppText variant="button" color={Theme.colors.primary}>Withdraw to Bank</AppText>
            </TouchableOpacity>
          </AppCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <AppText variant="h3" style={styles.sectionTitle}>Summary</AppText>
          <View style={styles.statsGrid}>
            <AppCard padding="lg" style={styles.statCard}>
              <View style={styles.iconBox}>
                <TrendingUp size={20} color={Theme.colors.success} />
              </View>
              <AppText variant="caption" color={Theme.colors.textMuted} style={styles.statLabel}>Today</AppText>
              <AppText variant="h3">₹1,240</AppText>
            </AppCard>
            <AppCard padding="lg" style={styles.statCard}>
              <View style={styles.iconBox}>
                <Calendar size={20} color={Theme.colors.primary} />
              </View>
              <AppText variant="caption" color={Theme.colors.textMuted} style={styles.statLabel}>This Week</AppText>
              <AppText variant="h3">₹8,450</AppText>
            </AppCard>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <AppText variant="h3" style={styles.sectionTitle}>Recent Transactions</AppText>
          <AppCard  style={styles.txCard}>
             {[
               { id: 1, title: 'Order #1234', date: 'Today, 12:30 PM', amount: '+ ₹240', pos: true },
               { id: 2, title: 'Order #1233', date: 'Today, 11:15 AM', amount: '+ ₹120', pos: true },
               { id: 3, title: 'Bank Withdrawal', date: 'Yesterday', amount: '- ₹5,000', pos: false },
             ].map((tx, index) => (
               <TouchableOpacity key={tx.id} style={[styles.txItem, index < 2 && styles.borderBottom]}>
                 <View style={styles.txLeft}>
                   <View style={[styles.txIconBox, { backgroundColor: tx.pos ? Theme.colors.successSoft : Theme.colors.primarySoft }]}>
                     {tx.pos ? <TrendingUp size={16} color={Theme.colors.success} /> : <CreditCard size={16} color={Theme.colors.error} />}
                   </View>
                   <View>
                     <AppText variant="body">{tx.title}</AppText>
                     <AppText variant="caption" color={Theme.colors.textMuted}>{tx.date}</AppText>
                   </View>
                 </View>
                 <AppText variant="body" color={tx.pos ? Theme.colors.success : Theme.colors.text}>
                   {tx.amount}
                 </AppText>
               </TouchableOpacity>
             ))}
          </AppCard>
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
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  content: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.lg,
  },
  balanceCard: {
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    paddingVertical: Theme.spacing.xxl,
  },
  balanceText: {
    marginTop: 8,
    marginBottom: Theme.spacing.lg,
  },
  withdrawBtn: {
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: 12,
    borderRadius: Theme.borderRadius.md,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  statCard: {
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  statLabel: {
    marginBottom: 4,
  },
  txCard: {
    backgroundColor: Theme.colors.surface,
    overflow: 'hidden',
  },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  txIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
