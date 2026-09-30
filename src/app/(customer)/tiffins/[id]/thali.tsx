import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../../../components/AppText';
import { AppButton } from '../../../../components/AppButton';
import { Theme } from '../../../../theme';
import { ArrowLeft, Minus, Plus } from 'lucide-react-native';
import { useLanguage } from '../../../../context/LanguageContext';

const ITEMS = [
  { id: '1', name: 'Rotli', count: 4 },
  { id: '2', name: 'Sabji', count: 2 },
  { id: '3', name: 'Dal', count: 1 },
  { id: '4', name: 'Rice', count: 1 },
];

export default function BuildThaliScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [counts, setCounts] = useState(ITEMS.map(i => i.count));

  const updateCount = (index: number, delta: number) => {
    const newCounts = [...counts];
    newCounts[index] = Math.max(0, newCounts[index] + delta);
    setCounts(newCounts);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>{t('vendor.buildYourThali')}</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.imageContainer}>
          <Image 
            source={require('../../../../../assets/images/gujarati_thali.jpg')} 
            style={styles.thaliImage} 
          />
        </Animated.View>

        <View style={styles.itemsList}>
          {ITEMS.map((item, index) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(100 + index * 50).springify()}>
              <View style={styles.itemRow}>
                <AppText variant="h3">{item.name}</AppText>
                
                <View style={styles.stepper}>
                  <TouchableOpacity onPress={() => updateCount(index, -1)} style={styles.stepperButton}>
                    <Minus size={16} color={Theme.colors.text} />
                  </TouchableOpacity>
                  <AppText variant="h3" style={styles.stepperCount}>{counts[index]}</AppText>
                  <TouchableOpacity onPress={() => updateCount(index, 1)} style={styles.stepperButton}>
                    <Plus size={16} color={Theme.colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.divider} />
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.footer}>
        <TouchableOpacity 
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(customer)/addons')}
        >
          <AppText variant="button">{t('vendor.addToCart')}</AppText>
          <AppText variant="button">₹120</AppText>
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
  imageContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxl,
  },
  thaliImage: {
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  itemsList: {
    gap: Theme.spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    height: 36,
  },
  stepperButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperCount: {
    width: 32,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginTop: Theme.spacing.md,
  },
  footer: {
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    height: 56,
    borderRadius: Theme.borderRadius.pill,
    paddingHorizontal: Theme.spacing.xl,
  }
});
