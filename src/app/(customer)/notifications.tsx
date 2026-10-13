import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import { ArrowLeft, Bell, Gift, Package, Info } from 'lucide-react-native';

const NOTIFICATIONS = [
  { id: '1', title: 'Order Delivered Successfully! 🎉', desc: 'Your Gujarati Thali order has been delivered. Enjoy your meal!', time: '10 mins ago', type: 'order' },
  { id: '2', title: 'Flash Sale! 50% OFF 🚀', desc: 'Get 50% OFF on all Punjabi items. Offer valid till 8 PM today.', time: '2 hours ago', type: 'promo' },
  { id: '3', title: 'Subscription Renewed', desc: 'Your monthly tiffin subscription has been renewed successfully.', time: '1 day ago', type: 'info' },
];

export default function NotificationsScreen() {
  const router = useRouter();

  const getIcon = (type: string) => {
    switch(type) {
      case 'order': return <Package size={24} color={Theme.colors.success} />;
      case 'promo': return <Gift size={24} color={Theme.colors.primary} />;
      default: return <Info size={24} color="#0284C7" />;
    }
  };

  const getIconBg = (type: string) => {
    switch(type) {
      case 'order': return Theme.colors.success + '20';
      case 'promo': return Theme.colors.primary + '20';
      default: return Theme.colors.primarySoft;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Notifications</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {NOTIFICATIONS.map((notif, index) => (
          <Animated.View key={notif.id} entering={FadeInDown.delay(index * 100).springify()}>
             <TouchableOpacity style={styles.card} activeOpacity={0.7}>
               <View style={[styles.iconBox, { backgroundColor: getIconBg(notif.type) }]}>
                 {getIcon(notif.type)}
               </View>
               <View style={styles.textContainer}>
                 <AppText variant="h3" style={{marginBottom: 4}}>{notif.title}</AppText>
                 <AppText variant="bodySmall" color={Theme.colors.textSecondary} style={{marginBottom: 8, lineHeight: 20}}>
                   {notif.desc}
                 </AppText>
                 <AppText variant="caption" color={Theme.colors.textMuted}>{notif.time}</AppText>
               </View>
             </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  }
});
