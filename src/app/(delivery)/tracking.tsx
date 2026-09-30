import React from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppCard } from '../../components/AppCard';
import { Theme } from '../../theme';
import { ArrowLeft, Navigation, Phone, MessageSquare } from 'lucide-react-native';

export default function DeliveryTrackingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Map Area Placeholder */}
      <View style={styles.mapArea}>
        <AppText variant="h2" color={Theme.colors.textMuted}>Map View</AppText>
        
        <SafeAreaView style={styles.headerAbsolute}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Theme.colors.text} />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.bottomSheet}>
         <View style={styles.dragHandle} />
         
         <AppText variant="h2" style={styles.sheetTitle}>Delivery #1234</AppText>
         
         <AppCard padding="md" style={styles.addressCard}>
            <View style={styles.addressRow}>
               <View style={styles.iconBox}>
                 <Navigation size={20} color={Theme.colors.primary} />
               </View>
               <View style={styles.addressText}>
                 <AppText variant="caption" color={Theme.colors.textMuted}>Deliver to</AppText>
                 <AppText variant="h3">123, Shanti Niketan, Vastrapur</AppText>
                 <AppText variant="bodySmall" color={Theme.colors.textMuted}>1.2 km away • 5 mins</AppText>
               </View>
            </View>
         </AppCard>

         <View style={styles.customerRow}>
            <View style={styles.customerInfo}>
               <View style={styles.avatarPlaceholder} />
               <View>
                 <AppText variant="h3">Jay Patel</AppText>
                 <AppText variant="caption" color={Theme.colors.textMuted}>Customer</AppText>
               </View>
            </View>
            
            <View style={styles.contactActions}>
               <TouchableOpacity style={styles.circleBtn}>
                 <MessageSquare size={20} color={Theme.colors.primary} />
               </TouchableOpacity>
               <TouchableOpacity style={styles.circleBtn}>
                 <Phone size={20} color={Theme.colors.primary} />
               </TouchableOpacity>
            </View>
         </View>

         <View style={styles.footer}>
           <AppButton 
             title="Mark as Delivered" 
             onPress={() => router.push('/(delivery)/dashboard')}
           />
         </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.surfaceSecondary,
  },
  mapArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bottomSheet: {
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.border,
    alignSelf: 'center',
    marginBottom: Theme.spacing.lg,
  },
  sheetTitle: {
    marginBottom: Theme.spacing.md,
  },
  addressCard: {
    backgroundColor: Theme.colors.surfaceSecondary,
    marginBottom: Theme.spacing.lg,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressText: {
    flex: 1,
    gap: 2,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.surfaceSecondary,
  },
  contactActions: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingBottom: Theme.spacing.lg,
  },
});
