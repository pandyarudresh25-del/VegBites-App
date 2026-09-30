import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, ZoomIn, useSharedValue, useAnimatedStyle, withSpring, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppPressable } from '../../components/AppPressable';
import { Theme } from '../../theme';
import { Check, Clock, FileText } from 'lucide-react-native';
import { useLanguage } from '../../context/LanguageContext';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withSequence(
      withTiming(1.1, { duration: 800 }),
      withTiming(1, { duration: 800 })
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.animationContainer}>
          <Animated.View style={[styles.pulseRing, pulseStyle]} />
          <Animated.View entering={ZoomIn.duration(800).springify()} style={styles.iconContainer}>
            <Check size={48} color="#fff" strokeWidth={3} />
          </Animated.View>
        </View>
        
        <Animated.View entering={FadeInDown.delay(300).duration(600).springify()} style={styles.textContainer}>
          <AppText variant="h1" align="center" style={styles.title}>{t('orderConfirmation.title')}</AppText>
          <AppText variant="body" align="center" color={Theme.colors.textSecondary} style={styles.subtitle}>
            {t('orderConfirmation.subtitle')}
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(450).duration(600).springify()} style={styles.detailsCard}>
           <View style={styles.detailRow}>
             <View style={styles.detailLeft}>
               <FileText size={20} color={Theme.colors.primary} />
               <AppText variant="body" color={Theme.colors.textSecondary} style={{ marginLeft: 8 }}>{t('orderConfirmation.orderId')}</AppText>
             </View>
             <AppText variant="h3">#123489</AppText>
           </View>
           
           <View style={styles.divider} />
           
           <View style={styles.detailRow}>
             <View style={styles.detailLeft}>
               <Clock size={20} color={Theme.colors.success} />
               <AppText variant="body" color={Theme.colors.textSecondary} style={{ marginLeft: 8 }}>{t('orderConfirmation.estimatedDelivery')}</AppText>
             </View>
             <AppText variant="h3">30-45 mins</AppText>
           </View>
        </Animated.View>

      </View>

      <Animated.View entering={FadeInDown.delay(600).duration(600).springify()} style={styles.footer}>
         <AppButton 
           title={t('orderConfirmation.liveTracking')} 
           onPress={() => router.push('/(customer)/tracking/123489')}
           style={styles.trackButton}
         />
         <AppPressable 
           style={styles.secondaryButton} 
           scaleTo={0.97}
           onPress={() => router.push('/(customer)/home')}
         >
           <AppText variant="button" color={Theme.colors.textSecondary}>{t('orderConfirmation.backToHome')}</AppText>
         </AppPressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  animationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xxl,
    width: 160,
    height: 160,
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Theme.colors.success + '20',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxl * 1.5,
  },
  title: {
    marginBottom: Theme.spacing.sm,
    fontSize: 28,
  },
  subtitle: {
    maxWidth: '85%',
    lineHeight: 24,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: Theme.colors.surface,
    borderRadius: 24,
    padding: Theme.spacing.xl,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.lg,
  },
  footer: {
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
    gap: Theme.spacing.md,
  },
  trackButton: {
    height: 56,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.lg,
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: 16,
  },
});
