import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { AppCard } from '../../components/AppCard';
import { AppPressable } from '../../components/AppPressable';
import { Theme } from '../../theme';
import { ArrowLeft, CalendarDays, CheckCircle2, AlertCircle, CalendarClock, ChevronRight, PauseCircle, RefreshCw, XCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MySubscriptionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AppPressable onPress={() => router.back()} style={styles.backButton} scaleTo={0.9}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </AppPressable>
        <AppText variant="h2" style={styles.headerTitle}>My Subscription</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <View style={styles.subCard}>
             <LinearGradient
               colors={['#FFF8F0', '#FFF']}
               style={StyleSheet.absoluteFill}
             />
             <View style={styles.subHeader}>
               <View style={styles.iconBox}>
                 <CalendarDays size={24} color="#F59E0B" />
               </View>
               <View style={styles.subTitleBox}>
                 <AppText variant="h2">Monthly Plan</AppText>
                 <AppText variant="price" color={Theme.colors.primary}>₹1999</AppText>
               </View>
               <View style={styles.statusBadge}>
                 <View style={styles.statusDot} />
                 <AppText variant="caption" color={Theme.colors.success} style={{ fontWeight: '700' }}>Active</AppText>
               </View>
             </View>

             <View style={styles.divider} />

             <View style={styles.detailRow}>
               <View style={styles.detailLeft}>
                 <Image source={require('../../../assets/images/gujarati_thali.jpg')} style={styles.providerAvatar} />
                 <AppText variant="body" color={Theme.colors.textSecondary}>Provider</AppText>
               </View>
               <AppText variant="h3">Shree Krishna Tiffin</AppText>
             </View>
             
             <View style={styles.detailRow}>
               <View style={styles.detailLeft}>
                 <AppText variant="body" color={Theme.colors.textSecondary}>Meals</AppText>
               </View>
               <AppText variant="h3">Dinner (Gujarati Thali)</AppText>
             </View>
             
             <View style={styles.detailRow}>
               <View style={styles.detailLeft}>
                 <AppText variant="body" color={Theme.colors.textSecondary}>Next Delivery</AppText>
               </View>
               <AppText variant="h3">Tomorrow, 07:00 PM</AppText>
             </View>
             
             <View style={styles.detailRow}>
               <View style={styles.detailLeft}>
                 <AppText variant="body" color={Theme.colors.textSecondary}>Expires on</AppText>
               </View>
               <AppText variant="h3">Sept 20, 2026</AppText>
             </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
          <View style={styles.upcomingCard}>
            <View style={styles.upcomingHeader}>
              <CalendarClock size={20} color={Theme.colors.primary} />
              <AppText variant="h3" style={{ marginLeft: 8 }}>Upcoming Deliveries</AppText>
            </View>
            <View style={styles.upcomingDays}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                const isActive = i < 5;
                const isToday = i === 2;
                return (
                  <View key={i} style={[
                    styles.dayCircle, 
                    isActive && styles.dayCircleActive,
                    isToday && styles.dayCircleToday
                  ]}>
                    <AppText 
                      variant="caption" 
                      color={isToday ? '#fff' : (isActive ? Theme.colors.primary : Theme.colors.textMuted)}
                      style={{ fontWeight: isToday ? '800' : '500' }}
                    >
                      {day}
                    </AppText>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
          <AppText variant="h2" style={styles.sectionTitle}>Manage Plan</AppText>
          <View style={styles.manageCard}>
             <AppPressable style={[styles.manageBtn, styles.borderBottom]}>
               <View style={styles.manageBtnLeft}>
                 <View style={[styles.manageIconBg, { backgroundColor: '#FEF3C7' }]}>
                   <PauseCircle size={20} color="#F59E0B" />
                 </View>
                 <AppText variant="h3">Pause Subscription</AppText>
               </View>
               <ChevronRight size={20} color={Theme.colors.textMuted} />
             </AppPressable>
             
             <AppPressable style={[styles.manageBtn, styles.borderBottom]}>
               <View style={styles.manageBtnLeft}>
                 <View style={[styles.manageIconBg, { backgroundColor: '#E0F2FE' }]}>
                   <RefreshCw size={20} color="#0284C7" />
                 </View>
                 <AppText variant="h3">Change Plan</AppText>
               </View>
               <ChevronRight size={20} color={Theme.colors.textMuted} />
             </AppPressable>
             
             <AppPressable style={styles.manageBtn}>
               <View style={styles.manageBtnLeft}>
                 <View style={[styles.manageIconBg, { backgroundColor: '#FEE2E2' }]}>
                   <XCircle size={20} color={Theme.colors.error} />
                 </View>
                 <AppText variant="h3" color={Theme.colors.error}>Cancel Subscription</AppText>
               </View>
               <ChevronRight size={20} color={Theme.colors.textMuted} />
             </AppPressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600).springify()}>
          <View style={styles.infoBox}>
            <AlertCircle size={24} color={Theme.colors.primary} />
            <AppText variant="bodySmall" color={Theme.colors.textSecondary} style={styles.infoText}>
              You can pause your subscription up to 3 times a month. Refunds for cancelled days will be credited to your Wallet.
            </AppText>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 22,
  },
  content: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl * 2,
  },
  subCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    padding: Theme.spacing.xl,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.md,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  subTitleBox: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    paddingTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  providerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  upcomingCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 24,
    padding: Theme.spacing.xl,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  upcomingDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleActive: {
    backgroundColor: Theme.colors.primary + '15',
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  dayCircleToday: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
    transform: [{ scale: 1.1 }],
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.xs,
    marginLeft: Theme.spacing.xs,
  },
  manageCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.lg,
  },
  manageBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  manageIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Theme.colors.primary + '10',
    padding: Theme.spacing.lg,
    borderRadius: 20,
    gap: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.primary + '30',
  },
  infoText: {
    flex: 1,
    lineHeight: 20,
  },
});
