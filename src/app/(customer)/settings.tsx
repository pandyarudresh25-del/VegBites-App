import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, ChevronRight, CreditCard, Globe2, HelpCircle, LogOut } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const settings = [
    { label: t('account.language'), value: t('account.appLanguage'), icon: Globe2, route: '/(auth)/language' },
    { label: t('account.paymentMethods'), icon: CreditCard, route: '/(customer)/payments' },
    { label: t('account.helpSupport'), icon: HelpCircle, route: '/(customer)/support' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}><ArrowLeft size={22} color={Theme.colors.text} /></TouchableOpacity>
        <AppText variant="h2">{t('account.settings')}</AppText>
        <View style={styles.iconButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(320)} style={styles.list}>
          {settings.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity key={item.label} activeOpacity={0.75} onPress={() => router.push(item.route as any)} style={[styles.row, index < settings.length - 1 && styles.divider]}>
                <View style={styles.iconWrap}><Icon size={19} color={Theme.colors.primary} /></View>
                <AppText variant="h3" style={styles.label}>{item.label}</AppText>
                {item.value && <AppText variant="caption" color={Theme.colors.textMuted}>{item.value}</AppText>}
                <ChevronRight size={20} color={Theme.colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(80).duration(320)} style={styles.footer}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.replace('/(auth)/welcome')} style={styles.logout}>
            <LogOut size={19} color={Theme.colors.error} />
            <AppText variant="h3" color={Theme.colors.error}>{t('profile.logout')}</AppText>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Theme.spacing.lg, paddingVertical: Theme.spacing.md },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Theme.spacing.xl, gap: Theme.spacing.lg },
  list: { backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.lg, paddingHorizontal: Theme.spacing.lg, borderWidth: 1, borderColor: Theme.colors.border },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Theme.spacing.lg, gap: Theme.spacing.md },
  divider: { borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  iconWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: Theme.colors.surfaceHighlight, justifyContent: 'center', alignItems: 'center' },
  label: { flex: 1 },
  footer: { marginTop: Theme.spacing.md },
  logout: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Theme.spacing.sm, paddingVertical: Theme.spacing.lg, backgroundColor: '#FFF0ED', borderRadius: Theme.borderRadius.lg },
});
