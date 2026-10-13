import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, ChevronRight, Gift, Star } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';

export default function LoyaltyScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const rewards = [
    { title: t('account.freeButtermilk'), points: '80 pts', color: Theme.colors.surfaceHighlight },
    { title: t('account.nextTiffinDiscount'), points: '150 pts', color: Theme.colors.successSoft },
    { title: t('account.freeDelivery'), points: '200 pts', color: Theme.colors.surfaceSecondary },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}><ArrowLeft size={22} color={Theme.colors.text} /></TouchableOpacity>
        <AppText variant="h2">{t('account.loyalty')}</AppText>
        <View style={styles.iconButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(320)} style={styles.pointsCard}>
          <View style={styles.star}><Star size={24} color={Theme.colors.primary} fill={Theme.colors.primary} /></View>
          <AppText variant="bodySmall" color={Theme.colors.textSecondary}>{t('account.pointsBalance')}</AppText>
          <AppText variant="h1" style={styles.points}>120</AppText>
          <AppText variant="caption" color={Theme.colors.textSecondary}>{t('account.nextReward')}</AppText>
          <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(80).duration(320)}>
          <AppText variant="h3" style={styles.sectionTitle}>{t('account.rewards')}</AppText>
          <View style={styles.list}>
            {rewards.map((reward, index) => (
              <TouchableOpacity key={reward.title} activeOpacity={0.8} style={[styles.reward, index < rewards.length - 1 && styles.divider]}>
                <View style={[styles.rewardIcon, { backgroundColor: reward.color }]}><Gift size={19} color={Theme.colors.primary} /></View>
                <View style={styles.rewardBody}>
                  <AppText variant="h3">{reward.title}</AppText>
                  <AppText variant="caption" color={Theme.colors.textMuted}>{reward.points}</AppText>
                </View>
                <ChevronRight size={20} color={Theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Theme.spacing.lg, paddingVertical: Theme.spacing.md },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Theme.spacing.xl, gap: Theme.spacing.xxl },
  pointsCard: { backgroundColor: Theme.colors.surfaceHighlight, borderRadius: Theme.borderRadius.xl, padding: Theme.spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: Theme.colors.border },
  star: { width: 52, height: 52, borderRadius: 26, backgroundColor: Theme.colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: Theme.spacing.md },
  points: { color: Theme.colors.primary, fontSize: 44, marginVertical: Theme.spacing.xs },
  progressTrack: { width: '100%', height: 8, borderRadius: 4, backgroundColor: Theme.colors.surface, marginTop: Theme.spacing.lg, overflow: 'hidden' },
  progressFill: { width: '60%', height: '100%', backgroundColor: Theme.colors.primary, borderRadius: 4 },
  sectionTitle: { marginBottom: Theme.spacing.md },
  list: { backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.lg, paddingHorizontal: Theme.spacing.lg, borderWidth: 1, borderColor: Theme.colors.border },
  reward: { flexDirection: 'row', alignItems: 'center', paddingVertical: Theme.spacing.lg },
  divider: { borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  rewardIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: Theme.spacing.md },
  rewardBody: { flex: 1, gap: Theme.spacing.xs },
});
