import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import { ArrowLeft } from 'lucide-react-native';
import { useLanguage } from '../../context/LanguageContext';

const PLANS = [
  { id: '1', name: '7 Days Plan', price: '₹699', oldPrice: null },
  { id: '2', name: '15 Days Plan', price: '₹1299', oldPrice: null },
  { id: '3', name: 'Monthly Plan', price: '₹1999', oldPrice: '₹2500' },
];

export default function PlansScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <AppText variant="h1" align="center" style={styles.title}>
            {t('plans.title')}
          </AppText>
          <AppText variant="body" align="center" color={Theme.colors.textSecondary} style={styles.subtitle}>
            {t('plans.subtitle')}
          </AppText>
        </Animated.View>

        <View style={styles.plansList}>
          {PLANS.map((plan, index) => (
            <Animated.View key={plan.id} entering={FadeInDown.delay(100 + index * 100).springify()}>
              <TouchableOpacity 
                style={styles.planCard} 
                activeOpacity={0.7}
                onPress={() => router.push('/(customer)/tiffins/vendors')}
              >
                <View style={styles.planInfo}>
                  <AppText variant="h2" color={Theme.colors.text}>{plan.name}</AppText>
                  {plan.oldPrice && (
                    <AppText variant="bodySmall" style={styles.oldPrice}>{plan.oldPrice}</AppText>
                  )}
                </View>
                <AppText variant="h2" color={Theme.colors.text}>{plan.price}</AppText>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.footer}>
           <TouchableOpacity style={styles.pauseButton} activeOpacity={0.7}>
             <AppText variant="button" color={Theme.colors.text}>{t('plans.pauseSubscription')}</AppText>
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
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  title: {
    marginBottom: Theme.spacing.sm,
    fontSize: 24,
  },
  subtitle: {
    marginBottom: Theme.spacing.xxl,
  },
  plansList: {
    gap: Theme.spacing.lg,
  },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  planInfo: {
    flexDirection: 'column',
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: Theme.colors.textMuted,
    marginTop: 4,
  },
  footer: {
    marginTop: Theme.spacing.xxl,
    alignItems: 'center',
  },
  pauseButton: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
});
