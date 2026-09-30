import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Animated.View entering={FadeIn.duration(800)} style={styles.imageContainer}>
          <Image 
            source={require('../../../assets/images/gujarati_thali.jpg')} 
            style={styles.heroImage}
          />
        </Animated.View>
        
        <View style={styles.textContent}>
          <Animated.View entering={FadeInDown.duration(600).springify().delay(200)}>
            <AppText variant="h1" style={styles.title}>
              {t('welcome.title')}
            </AppText>
            <AppText variant="body" color={Theme.colors.textSecondary} style={styles.subtitle}>
              {t('welcome.subtitle')}
            </AppText>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.footer}>
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => router.push('/(customer)/home')}
            activeOpacity={0.7}
          >
            <AppText variant="button" color={Theme.colors.primary}>{t('welcome.skip')}</AppText>
          </TouchableOpacity>
          <AppButton 
            title={t('welcome.next')}
            onPress={() => router.push('/(auth)/language')}
            fullWidth={false}
            style={styles.nextButton}
          />
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
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.xxl * 2,
    justifyContent: 'space-between',
    paddingBottom: Theme.spacing.xl,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xxl,
  },
  heroImage: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    marginBottom: Theme.spacing.sm,
    resizeMode: 'cover',
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    lineHeight: 48,
    marginBottom: Theme.spacing.md,
  },
  subtitle: {
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Theme.spacing.lg,
  },
  skipButton: {
    flex: 1,
    height: 56,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    flex: 1,
    borderRadius: Theme.borderRadius.pill,
  },
});
