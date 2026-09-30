import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../../components/AppText';
import { Theme } from '../../../theme';
import { ArrowLeft } from 'lucide-react-native';

export default function TiffinTimeScreen() {
  const router = useRouter();

  const navigateToPlans = () => {
    router.push('/(customer)/plans');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Tiffin Time</AppText>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(400).springify()}>
          <TouchableOpacity style={styles.timeCard} activeOpacity={0.8} onPress={navigateToPlans}>
            <View style={styles.textContainer}>
              <AppText variant="h2" style={styles.title}>Morning</AppText>
              <View style={styles.timeRow}>
                <View style={styles.timeDot} />
                <AppText variant="caption" color={Theme.colors.textSecondary} style={styles.timeText}>05:00 AM - 10:00 AM</AppText>
              </View>
            </View>
            <Image source={require('../../../../assets/images/gujarati_thali.jpg')} style={styles.image} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
          <TouchableOpacity style={styles.timeCard} activeOpacity={0.8} onPress={navigateToPlans}>
            <View style={styles.textContainer}>
              <AppText variant="h2" style={styles.title}>Evening</AppText>
              <View style={styles.timeRow}>
                <View style={[styles.timeDot, { backgroundColor: Theme.colors.primary }]} />
                <AppText variant="caption" color={Theme.colors.textSecondary} style={styles.timeText}>02:00 PM - 05:00 PM</AppText>
              </View>
            </View>
            <Image source={require('../../../../assets/images/gujarati_thali.jpg')} style={styles.image} />
          </TouchableOpacity>
        </Animated.View>
      </View>
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
    paddingTop: Theme.spacing.xxl,
    gap: Theme.spacing.lg,
  },
  timeCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    height: 120,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.success,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
    resizeMode: 'cover',
  },
});
