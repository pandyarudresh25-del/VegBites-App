import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import { ChevronRight, Package, Calendar, MapPin, Wallet, Gift, HelpCircle, Bell, Settings, LogOut } from 'lucide-react-native';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const MENU_ITEMS = [
    { id: '1', label: t('profile.myOrders'), icon: Package, value: null, route: '/(customer)/orders' },
    { id: '2', label: t('profile.mySubscription'), icon: Calendar, value: null, route: '/(customer)/subscription' },
    { id: '3', label: t('profile.savedAddresses'), icon: MapPin, value: null, route: '/(customer)/address' },
    { id: '4', label: t('profile.wallet'), icon: Wallet, value: '₹245.50', route: '/(customer)/wallet' },
    { id: '5', label: t('profile.loyaltyPoints'), icon: Gift, value: '120', route: '/(customer)/loyalty' },
    { id: '6', label: t('profile.notifications'), icon: Bell, value: null, route: '/(customer)/notifications' },
    { id: '7', label: t('profile.settings'), icon: Settings, value: null, route: '/(customer)/settings' },
    { id: '8', label: t('profile.helpSupport'), icon: HelpCircle, value: null, route: '/(customer)/support' },
    { id: '9', label: t('profile.logout'), icon: LogOut, value: null, route: '/(auth)/welcome' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
          <Image source={require('../../../assets/images/gujarati_thali.jpg')} style={styles.avatar} />
          <View style={styles.userInfo}>
            <AppText variant="h2">Jay Patel</AppText>
            <AppText variant="bodySmall" color={Theme.colors.textSecondary}>+91 98765 43210</AppText>
          </View>
        </Animated.View>

        <View style={styles.list}>
          {MENU_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isLogout = item.id === '9';
            return (
              <Animated.View key={item.id} entering={FadeInDown.delay(100 + index * 50).springify()}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (item.route) router.push(item.route as any);
                  }}
                >
                  <View style={styles.menuLeft}>
                    <Icon size={20} color={isLogout ? Theme.colors.error : Theme.colors.success} style={styles.menuIcon} />
                    <AppText variant="h3" style={[styles.menuLabel, isLogout && { color: Theme.colors.error }]}>{item.label}</AppText>
                  </View>
                  
                  {item.value ? (
                    <AppText variant="bodySmall" color={Theme.colors.textSecondary}>{item.value}</AppText>
                  ) : (
                    <ChevronRight size={20} color={Theme.colors.textMuted} />
                  )}
                </TouchableOpacity>
                {index < MENU_ITEMS.length - 1 && <View style={styles.divider} />}
              </Animated.View>
            );
          })}
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.xxl,
    paddingBottom: Theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xxl * 1.5,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: Theme.spacing.lg,
  },
  userInfo: {
    justifyContent: 'center',
  },
  list: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.sm,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: Theme.spacing.lg,
  },
  menuLabel: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginLeft: 46, // Aligns with text
  }
});
