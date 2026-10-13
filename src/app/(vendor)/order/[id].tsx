import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../../components/AppText';
import { Theme } from '../../../theme';
import { ArrowLeft } from 'lucide-react-native';

export default function VendorOrderDetailsScreen() {
  const router = useRouter();
  const [status, setStatus] = useState('preparing'); // 'preparing' | 'ready'

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Order Details</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.orderMetaContainer}>
          <AppText variant="h2" style={styles.orderNumber}>#1234</AppText>
          <AppText variant="body" color={Theme.colors.textSecondary} style={styles.orderName}>Jay Patel</AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.itemsList}>
          <View style={styles.itemRow}>
            <AppText variant="h3">2 Thali</AppText>
            <AppText variant="h3">₹240</AppText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.addressContainer}>
          <AppText variant="caption" color={Theme.colors.textMuted} style={styles.addressLabel}>Address</AppText>
          <AppText variant="bodySmall" color={Theme.colors.textSecondary} style={styles.addressText}>
            123, Shanti Niketan, Vastrapur, Ahmedabad.
          </AppText>
        </Animated.View>

      </ScrollView>

      <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.footer}>
        {status === 'preparing' ? (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: Theme.colors.primary }]}
            activeOpacity={0.8}
            onPress={() => setStatus('ready')}
          >
            <AppText variant="button">Food Ready</AppText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: Theme.colors.primary }]} // Blue button as shown in reference
            activeOpacity={0.8}
            onPress={() => router.push('/(vendor)/dashboard')}
          >
            <AppText variant="button">Handover</AppText>
          </TouchableOpacity>
        )}
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
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  orderMetaContainer: {
    marginBottom: Theme.spacing.xxl,
  },
  orderNumber: {
    marginBottom: 4,
  },
  orderName: {
    fontSize: 16,
  },
  itemsList: {
    marginBottom: Theme.spacing.xxl,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressContainer: {
    marginTop: Theme.spacing.lg,
  },
  addressLabel: {
    marginBottom: 4,
  },
  addressText: {
    lineHeight: 20,
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
    height: 56,
    borderRadius: Theme.borderRadius.pill,
  }
});
