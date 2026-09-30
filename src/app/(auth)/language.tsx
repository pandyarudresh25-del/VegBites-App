import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppPressable } from '../../components/AppPressable';
import { Theme } from '../../theme';
import { Check, Languages } from 'lucide-react-native';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Animated.View entering={FadeInRight.duration(600).springify()} style={styles.header}>
          <AppText variant="h1" style={styles.title}>{t('language.title')}</AppText>
          <AppText variant="body" color={Theme.colors.textSecondary} style={styles.subtitle}>
            {t('language.subtitle')}
          </AppText>
        </Animated.View>

        <View style={styles.langList}>
          
          <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
            <AppPressable
              scaleTo={0.98}
              onPress={() => setLanguage('en')}
              style={[
                styles.langCard,
                language === 'en' && styles.langCardSelected
              ]}
            >
              <View style={[styles.avatar, language === 'en' && styles.avatarSelected]}>
                <Languages size={24} color={language === 'en' ? Theme.colors.primary : Theme.colors.textSecondary} />
              </View>
              <AppText variant="h3" style={styles.langName}>{t('language.english')}</AppText>
              <View style={[styles.radio, language === 'en' && styles.radioSelected]}>
                 {language === 'en' && <Check size={14} color="#fff" strokeWidth={3} />}
              </View>
            </AppPressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
            <AppPressable
              scaleTo={0.98}
              onPress={() => setLanguage('gu')}
              style={[
                styles.langCard,
                language === 'gu' && styles.langCardSelected
              ]}
            >
              <View style={[styles.avatar, language === 'gu' && styles.avatarSelected]}>
                <AppText variant="h2" color={language === 'gu' ? Theme.colors.primary : Theme.colors.textSecondary}>અ</AppText>
              </View>
              <AppText variant="h3" style={styles.langName}>{t('language.gujarati')}</AppText>
              <View style={[styles.radio, language === 'gu' && styles.radioSelected]}>
                 {language === 'gu' && <Check size={14} color="#fff" strokeWidth={3} />}
              </View>
            </AppPressable>
          </Animated.View>

        </View>

      </View>
      
      <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.footer}>
        <AppButton 
          title={t('language.continue')}
          onPress={() => router.push('/(auth)/login')}
          style={styles.button}
        />
      </Animated.View>
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
    paddingTop: Theme.spacing.xxl,
  },
  header: {
    marginBottom: Theme.spacing.xxl,
    alignItems: 'center',
    marginTop: Theme.spacing.xxl,
  },
  title: {
    marginBottom: Theme.spacing.sm,
    fontSize: 24,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22,
  },
  langList: {
    gap: Theme.spacing.lg,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  langCardSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSelected: {
    backgroundColor: '#FFE5CC',
  },
  langName: {
    flex: 1,
    marginLeft: Theme.spacing.lg,
    fontSize: 16,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  radioSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  footer: {
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
  },
  button: {
    width: '100%',
    borderRadius: Theme.borderRadius.pill,
  },
});
