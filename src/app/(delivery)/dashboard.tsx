import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';

export default function DeliveryDashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AppText variant="h3" color={Theme.colors.textSecondary}>Delivery Boy App</AppText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <AppText variant="h1" style={styles.title}>My Deliveries</AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
          
          <TouchableOpacity 
            style={styles.orderCard}
            activeOpacity={0.8}
            onPress={() => router.push('/(delivery)/delivery/1234')}
          >
            <View style={styles.orderHeader}>
              <AppText variant="h3" style={styles.orderNumber}>#1234</AppText>
              <AppText variant="h3">₹240</AppText>
            </View>
            
            <AppText variant="bodySmall" color={Theme.colors.textSecondary} style={styles.orderName}>Jay Patel</AppText>
            
            <AppText variant="bodySmall" color={Theme.colors.textMuted} style={styles.orderItems}>2 Thali</AppText>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.acceptButton} activeOpacity={0.7} onPress={() => router.push('/(delivery)/delivery/1234')}>
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
    marginBottom: Theme.spacing.xl,
  },
  section: {
    marginTop: Theme.spacing.md,
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 18,
  },
  orderName: {
    marginBottom: Theme.spacing.sm,
    fontSize: 16,
  },
  orderItems: {
    marginBottom: Theme.spacing.xl,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  acceptButton: {
    flex: 1,
    height: 48,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.primary, // Orange as per design
    justifyContent: 'center',
    alignItems: 'center',
  },
});
