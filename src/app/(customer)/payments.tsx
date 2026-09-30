import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import { ArrowLeft, CreditCard, Landmark, Banknote, Smartphone, WalletCards } from 'lucide-react-native';

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
  { id: 'upi', label: 'UPI', icon: Landmark },
  { id: 'gpay', label: 'Google Pay', icon: WalletCards },
  { id: 'phonepe', label: 'PhonePe', icon: Smartphone },
  { id: 'paytm', label: 'Paytm', icon: WalletCards },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
];

export default function PaymentsScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState('cod');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Payment Methods</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.list}>
          {PAYMENT_METHODS.map((method, index) => {
            const Icon = method.icon;
            return (
              <Animated.View key={method.id} entering={FadeInDown.delay(100 + index * 50).springify()}>
                <TouchableOpacity 
                  style={styles.methodRow}
                  activeOpacity={0.7}
                  onPress={() => setSelectedMethod(method.id)}
                >
                  <View style={[styles.radio, selectedMethod === method.id && styles.radioSelected]}>
                    {selectedMethod === method.id && <View style={styles.radioInner} />}
                  </View>
                  
                  <View style={styles.iconContainer}>
                    <Icon size={20} color={Theme.colors.success} />
                  </View>
                  
                  <AppText variant="h3">{method.label}</AppText>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.footer}>
        <TouchableOpacity 
          style={styles.payButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(customer)/order-confirmation')}
        >
          <AppText variant="button">Pay Now</AppText>
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
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  list: {
    gap: Theme.spacing.xl,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.lg,
  },
  radioSelected: {
    borderColor: Theme.colors.success,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Theme.colors.success,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  footer: {
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  payButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    height: 56,
    borderRadius: Theme.borderRadius.pill,
  }
});
