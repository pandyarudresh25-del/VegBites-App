import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';

const { width } = Dimensions.get('window');

export default function VendorDashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AppText variant="h3" color={Theme.colors.textSecondary}>Vendor App</AppText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <AppText variant="h1" style={styles.title}>Dashboard</AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <AppText variant="caption" color={Theme.colors.textMuted}>Orders</AppText>
            <AppText variant="h2">24</AppText>
          </View>
          <View style={styles.metricCard}>
            <AppText variant="caption" color={Theme.colors.textMuted}>Earnings</AppText>
            <AppText variant="h2">₹2,450</AppText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>Active Order</AppText>
          
          <TouchableOpacity 
            style={styles.orderCard}
            activeOpacity={0.8}
            onPress={() => router.push('/(vendor)/order/1234')}
          >
            <AppText variant="h3" style={styles.orderNumber}>#1234</AppText>
            <AppText variant="bodySmall" color={Theme.colors.textSecondary} style={styles.orderName}>Jay Patel</AppText>
            
            <View style={styles.orderMeta}>
              <AppText variant="bodySmall" color={Theme.colors.textMuted}>2 Thali</AppText>
              <AppText variant="h3">₹240</AppText>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.declineButton} activeOpacity={0.7}>
                <AppText variant="button" color={Theme.colors.text}>Decline</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} activeOpacity={0.7}>
                <AppText variant="button">Accept</AppText>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
  },
  content: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.xxl,
  },
  title: {
    marginBottom: Theme.spacing.lg,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xxl,
  },
  metricCard: {
    flex: 1,
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
    alignItems: 'center',
    gap: 8,
  },
  section: {
    marginTop: Theme.spacing.md,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.md,
    fontSize: 18,
  },
  orderCard: {
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
  orderNumber: {
    fontSize: 18,
    marginBottom: 4,
  },
  orderName: {
    marginBottom: Theme.spacing.md,
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  declineButton: {
    flex: 1,
    height: 48,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    flex: 1,
    height: 48,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
