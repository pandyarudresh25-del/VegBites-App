import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { AppCard } from '../../components/AppCard';
import { Theme } from '../../theme';
import { Settings, HelpCircle, LogOut, Store, Star, ChevronRight } from 'lucide-react-native';

export default function VendorProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AppText variant="h2">Profile</AppText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <Animated.View entering={FadeInDown.delay(0).springify()}>
          <AppCard padding="lg" style={styles.vendorCard}>
             <View style={styles.vendorInfo}>
               <View style={styles.avatarPlaceholder} />
               <View style={styles.vendorText}>
                 <AppText variant="h2">Shree Krishna Tiffin</AppText>
                 <AppText variant="body" color={Theme.colors.textMuted}>Ramesh Bhai</AppText>
                 <AppText variant="caption" color={Theme.colors.textMuted}>+91 98765 43210</AppText>
               </View>
             </View>
             
             <View style={styles.divider} />
             
             <View style={styles.statsRow}>
               <View style={styles.stat}>
                 <AppText variant="h3">4.8</AppText>
                 <AppText variant="caption" color={Theme.colors.textMuted}>Rating</AppText>
               </View>
               <View style={styles.statLine} />
               <View style={styles.stat}>
                 <AppText variant="h3">1,245</AppText>
                 <AppText variant="caption" color={Theme.colors.textMuted}>Total Orders</AppText>
               </View>
               <View style={styles.statLine} />
               <View style={styles.stat}>
                 <AppText variant="h3">1.5 Yrs</AppText>
                 <AppText variant="caption" color={Theme.colors.textMuted}>On VegBites</AppText>
               </View>
             </View>
          </AppCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <AppCard  style={styles.menuCard}>
            {[
              { id: 'settings', title: 'Business Settings', icon: Settings },
              { id: 'help', title: 'Help & Support', icon: HelpCircle },
            ].map((item, index) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.menuItem, index === 0 && styles.borderBottom]}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.iconContainer}>
                    <item.icon size={20} color={Theme.colors.primary} />
                  </View>
                  <AppText variant="h3">{item.title}</AppText>
                </View>
                <ChevronRight size={20} color={Theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </AppCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            activeOpacity={0.8}
            onPress={() => router.replace('/(auth)/welcome')}
          >
             <LogOut size={20} color={Theme.colors.error} />
             <AppText variant="h3" color={Theme.colors.error}>Logout</AppText>
          </TouchableOpacity>
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
  vendorCard: {
    gap: Theme.spacing.md,
  },
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.lg,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Theme.colors.surfaceSecondary,
  },
  vendorText: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statLine: {
    width: 1,
    height: 32,
    backgroundColor: Theme.colors.border,
  },
  menuCard: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.error,
  },
});
