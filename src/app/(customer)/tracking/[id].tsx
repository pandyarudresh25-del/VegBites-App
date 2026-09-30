import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { AppText } from '../../../components/AppText';
import { Theme } from '../../../theme';
import { ArrowLeft, Bike, Check, Phone } from 'lucide-react-native';
import { useLanguage } from '../../../context/LanguageContext';

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const STATUSES = [
    { id: '1', label: t('tracking.pending'), completed: true },
    { id: '2', label: t('tracking.accepted'), completed: true },
    { id: '3', label: t('tracking.preparing'), completed: true },
    { id: '4', label: t('tracking.foodReady'), completed: true },
    { id: '5', label: t('tracking.outForDelivery'), completed: true },
    { id: '6', label: t('tracking.delivered'), completed: false },
  ];

  // Animation for the moving delivery marker
  const markerPosition = useSharedValue(0);

  useEffect(() => {
    markerPosition.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000 }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );
  }, [markerPosition]);

  const markerAnimatedStyle = useAnimatedStyle(() => {
    return {
      left: `${markerPosition.value * 80}%`, // Moves across the route
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>{t('tracking.title')}</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* LIVE MAP AREA */}
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.mapContainer}>
           <View style={styles.mapGraphic}>
              <View style={styles.routeLine}>
                 <View style={styles.mapDotVendor}>
                    <AppText variant="caption" color="#fff" style={{fontWeight: 'bold'}}>V</AppText>
                 </View>
                 <View style={styles.mapPath} />
                 <Animated.View style={[styles.movingMarker, markerAnimatedStyle]}>
                    <Bike size={18} color="#FFFFFF" strokeWidth={2.5} />
                 </Animated.View>
                 <View style={styles.mapDotCustomer}>
                    <AppText variant="caption" color="#fff" style={{fontWeight: 'bold'}}>Me</AppText>
                 </View>
              </View>
           </View>
           <View style={styles.etaContainer}>
             <AppText variant="h2" color={Theme.colors.primary}>15 Mins</AppText>
             <AppText variant="caption" color={Theme.colors.textSecondary}>{t('tracking.estimatedArrival')}</AppText>
           </View>
        </Animated.View>

        {/* TIMELINE */}
        <View style={styles.timeline}>
          {STATUSES.map((status, index) => (
            <Animated.View key={status.id} entering={FadeInDown.delay(100 + index * 100).springify()}>
              <View style={styles.statusRow}>
                
                <View style={styles.timelineIndicator}>
                  <View style={[styles.dot, status.completed && styles.dotCompleted]}>
                    {status.completed && <Check size={12} color="#fff" strokeWidth={3} />}
                  </View>
                  {index < STATUSES.length - 1 && (
                    <View style={[styles.line, STATUSES[index+1].completed && styles.lineCompleted]} />
                  )}
                </View>

                <AppText 
                  variant="h3" 
                  style={[styles.statusText, !status.completed && { color: Theme.colors.textMuted }]}
                >
                  {status.label}
                </AppText>
                
              </View>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.deliveryPersonCard}>
          <Image source={require('../../../../assets/images/gujarati_thali.jpg')} style={styles.driverAvatar} />
          <View style={styles.driverInfo}>
             <AppText variant="h3">Rajesh Bhai</AppText>
             <AppText variant="bodySmall" color={Theme.colors.textSecondary}>{t('tracking.deliveryPartner')}</AppText>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Phone size={20} color={Theme.colors.primary} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(800).springify()} style={styles.footer}>
        <TouchableOpacity 
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(customer)/home')}
        >
          <AppText variant="button">{t('tracking.backToHome')}</AppText>
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
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  mapContainer: {
    marginHorizontal: Theme.spacing.xl,
    marginBottom: Theme.spacing.xxl,
    borderRadius: Theme.borderRadius.xl,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  mapGraphic: {
    height: 180,
    backgroundColor: '#E8E4D9', // Soft map background
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xxl,
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 40,
  },
  mapDotVendor: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  mapDotCustomer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    position: 'absolute',
    right: 0,
  },
  mapPath: {
    flex: 1,
    height: 4,
    backgroundColor: Theme.colors.border,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    zIndex: 1,
    marginHorizontal: 16,
  },
  movingMarker: {
    position: 'absolute',
    zIndex: 4,
    top: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.surface,
  },
  etaContainer: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  timeline: {
    paddingLeft: Theme.spacing.xl,
    paddingRight: Theme.spacing.xl,
    marginBottom: Theme.spacing.xxl,
  },
  statusRow: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineIndicator: {
    width: 24,
    alignItems: 'center',
    marginRight: Theme.spacing.lg,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  dotCompleted: {
    backgroundColor: Theme.colors.success,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Theme.colors.border,
    marginTop: -2,
    marginBottom: -2,
    zIndex: 1,
  },
  lineCompleted: {
    backgroundColor: Theme.colors.success,
  },
  statusText: {
    marginTop: -2,
  },
  deliveryPersonCard: {
    marginHorizontal: Theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
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
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Theme.spacing.md,
  },
  driverInfo: {
    flex: 1,
    gap: 4,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  footer: {
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    height: 56,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  }
});
