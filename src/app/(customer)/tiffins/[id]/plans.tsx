import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../../../components/AppText';
import { AppCard } from '../../../../components/AppCard';
import { AppPressable } from '../../../../components/AppPressable';
import { Theme } from '../../../../theme';
import { ArrowLeft, Check, CalendarDays } from 'lucide-react-native';
import { MOCK_DATA } from '../../../../data/mock';

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AppPressable onPress={() => router.back()} style={styles.backButton} scaleTo={0.9}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </AppPressable>
        <AppText variant="h2" style={styles.headerTitle}>Subscription Plans</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <AppText variant="h2" align="center" style={styles.title}>
            Choose your meal plan
          </AppText>
          <AppText variant="body" align="center" color={Theme.colors.textSecondary} style={styles.subtitle}>
            Subscribe and save on your daily tiffins. Skip meals anytime.
          </AppText>
        </Animated.View>

        <View style={styles.plansContainer}>
          {MOCK_DATA.subscriptions.map((plan, index) => (
            <Animated.View key={plan.id} entering={FadeInDown.delay((index + 1) * 100).duration(600).springify()}>
              <AppPressable 
                scaleTo={0.98}
                onPress={() => router.push(`/customer/tiffins/${id}/thali` as any)}
              >
                <AppCard 
                  style={[
                    styles.planCard,
                    index === 0 && styles.activePlanCard
                  ]} 
                  padding="lg"
                >
                  {index === 0 && (
                    <View style={styles.popularBadge}>
                      <AppText variant="caption" color="#fff" style={styles.popularText}>MOST POPULAR</AppText>
                    </View>
                  )}
                  
                  <View style={styles.planHeader}>
                    <View style={styles.planInfo}>
                      <AppText variant="h2" color={index === 0 ? Theme.colors.primary : Theme.colors.text}>{plan.name}</AppText>
                      <View style={styles.durationRow}>
                        <CalendarDays size={14} color={Theme.colors.textSecondary} />
                        <AppText variant="bodySmall" color={Theme.colors.textSecondary}>{plan.duration}</AppText>
                      </View>
                    </View>
                    <View style={styles.priceContainer}>
                      <AppText variant="price" color={index === 0 ? Theme.colors.primary : Theme.colors.text}>
                        ₹{plan.price}
                      </AppText>
                      <AppText variant="caption" color={Theme.colors.textMuted}>/ {plan.duration.split(' ')[0]}</AppText>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.featuresList}>
                    <View style={styles.featureRow}>
                      <Check size={16} color={Theme.colors.success} />
                      <AppText variant="bodySmall" color={Theme.colors.textSecondary}>Free delivery on all meals</AppText>
                    </View>
                    <View style={styles.featureRow}>
                      <Check size={16} color={Theme.colors.success} />
                      <AppText variant="bodySmall" color={Theme.colors.textSecondary}>Pause/Skip meals anytime</AppText>
                    </View>
                    <View style={styles.featureRow}>
                      <Check size={16} color={Theme.colors.success} />
                      <AppText variant="bodySmall" color={Theme.colors.textSecondary}>Special weekend sweet</AppText>
                    </View>
                  </View>
                </AppCard>
              </AppPressable>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(400).duration(600).springify()}>
          <AppPressable style={styles.pauseButton} scaleTo={0.97}>
            <AppText variant="button" color={Theme.colors.textSecondary}>Not ready? Just order once</AppText>
          </AppPressable>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
  },
  headerTitle: {
    fontSize: 22,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    padding: Theme.spacing.xl,
    paddingTop: Theme.spacing.xxl,
    paddingBottom: Theme.spacing.xxl * 2,
    gap: Theme.spacing.xl,
  },
  title: {
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    marginBottom: Theme.spacing.md,
    lineHeight: 24,
  },
  plansContainer: {
    gap: Theme.spacing.xl,
  },
  planCard: {
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: 24,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  activePlanCard: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.surfaceHighlight,
    shadowColor: Theme.colors.primary,
    shadowOpacity: 0.15,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 6,
    borderBottomLeftRadius: 16,
  },
  popularText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    marginTop: Theme.spacing.sm,
  },
  planInfo: {
    gap: 6,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginBottom: Theme.spacing.lg,
  },
  featuresList: {
    gap: Theme.spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  pauseButton: {
    marginTop: Theme.spacing.lg,
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: 16,
    backgroundColor: Theme.colors.background,
  },
});
