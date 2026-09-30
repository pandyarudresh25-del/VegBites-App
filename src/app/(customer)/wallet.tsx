import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowDownLeft, ArrowLeft, Plus, WalletCards } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';

export default function WalletScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const transactions = [
    { title: t('account.walletCredit'), detail: 'Today, 10:32 AM', amount: '+ ₹100', positive: true },
    { title: t('account.deliverySavings'), detail: 'Yesterday', amount: '+ ₹30', positive: true },
    { title: t('account.earnedFromOrder'), detail: '24 Sep 2026', amount: '+ ₹15', positive: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <ArrowLeft size={22} color={Theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="h2">{t('account.wallet')}</AppText>
        <View style={styles.iconButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(320)} style={styles.balanceCard}>
          <View style={styles.balanceIcon}><WalletCards size={24} color="#FFFFFF" /></View>
          <AppText variant="bodySmall" color="#FFF4E8">{t('account.availableBalance')}</AppText>
          <AppText variant="h1" color="#FFFFFF" style={styles.balance}>₹245.50</AppText>
          <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
            <Plus size={18} color={Theme.colors.primary} />
            <AppText variant="h3" color={Theme.colors.primary}>{t('account.addMoney')}</AppText>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(80).duration(320)}>
          <AppText variant="h3" style={styles.sectionTitle}>{t('account.recentTransactions')}</AppText>
          <View style={styles.list}>
            {transactions.map((item, index) => (
              <View key={item.title} style={[styles.row, index < transactions.length - 1 && styles.divider]}>
                <View style={styles.transactionIcon}><ArrowDownLeft size={18} color={Theme.colors.success} /></View>
                <View style={styles.rowBody}>
                  <AppText variant="h3">{item.title}</AppText>
                  <AppText variant="caption" color={Theme.colors.textMuted}>{item.detail}</AppText>
                </View>
                <AppText variant="h3" color={item.positive ? Theme.colors.success : Theme.colors.text}>{item.amount}</AppText>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Theme.spacing.lg, paddingVertical: Theme.spacing.md },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Theme.spacing.xl, gap: Theme.spacing.xxl },
  balanceCard: { backgroundColor: Theme.colors.primary, borderRadius: Theme.borderRadius.xl, padding: Theme.spacing.xl, minHeight: 200 },
  balanceIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', marginBottom: Theme.spacing.lg },
  balance: { marginTop: Theme.spacing.xs, marginBottom: Theme.spacing.xl },
  addButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm, backgroundColor: Theme.colors.surface, paddingHorizontal: Theme.spacing.lg, paddingVertical: Theme.spacing.md, borderRadius: Theme.borderRadius.pill },
  sectionTitle: { marginBottom: Theme.spacing.md },
  list: { backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.lg, borderWidth: 1, borderColor: Theme.colors.border, paddingHorizontal: Theme.spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Theme.spacing.lg },
  divider: { borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  transactionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EAF5E8', justifyContent: 'center', alignItems: 'center', marginRight: Theme.spacing.md },
  rowBody: { flex: 1, gap: Theme.spacing.xs },
});
