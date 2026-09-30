import React, { useState } from 'react';
import { View, StyleSheet, TextInput, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { Apple } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams();
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  
  // Focus animation
  const isFocused = useSharedValue(false);
  const borderAnimatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: withSpring(isFocused.value ? Theme.colors.primary : Theme.colors.border),
      borderWidth: withSpring(isFocused.value ? 2 : 1),
    };
  });

  const handleSendOTP = () => {
    if (phone.length >= 10) {
      router.push({
        pathname: '/(auth)/otp',
        params: { role }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          
          <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
            <AppText variant="h1" style={styles.title} align="center">
              {t('login.title')}
            </AppText>
            <AppText variant="body" color={Theme.colors.textSecondary} align="center">
              {t('login.subtitle')}
            </AppText>
          </Animated.View>

          <View style={styles.formContainer}>
            <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
              <Animated.View style={[styles.inputContainer, borderAnimatedStyle]}>
                <View style={styles.countryCode}>
                  <AppText variant="h3" color={Theme.colors.text}>+91</AppText>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={t('login.phonePlaceholder')}
                  placeholderTextColor={Theme.colors.textMuted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={10}
                  onFocus={() => isFocused.value = true}
                  onBlur={() => isFocused.value = false}
                  returnKeyType="done"
                />
              </Animated.View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
              <AppButton 
                title={t('login.continue')} 
                onPress={handleSendOTP}
                disabled={phone.length < 10}
                style={styles.actionButton}
              />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(400).duration(600).springify()} style={styles.dividerContainer}>
              <View style={styles.divider} />
              <AppText variant="caption" color={Theme.colors.textMuted} style={styles.dividerText}>
                {t('login.orLoginWith')}
              </AppText>
              <View style={styles.divider} />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(500).duration(600).springify()} style={styles.socialContainer}>
              <View style={styles.socialButton}>
                 <AppText variant="h3" color={Theme.colors.primary}>G</AppText>
              </View>
              <View style={styles.socialButton}>
                 <Apple size={22} color={Theme.colors.text} />
              </View>
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  },
  header: {
    marginBottom: Theme.spacing.xxl * 1.5,
    alignItems: 'center',
  },
  title: {
    marginBottom: Theme.spacing.sm,
    fontSize: 24,
  },
  formContainer: {
    gap: Theme.spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.pill,
    height: 56, 
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.md,
  },
  countryCode: {
    paddingHorizontal: Theme.spacing.md,
    borderRightWidth: 1,
    borderRightColor: Theme.colors.border,
    justifyContent: 'center',
    height: '60%',
  },
  input: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
    fontSize: 18,
    fontWeight: '500',
    color: Theme.colors.text,
    height: '100%',
  },
  actionButton: {
    height: 56,
    borderRadius: Theme.borderRadius.pill,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Theme.spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.border,
  },
  dividerText: {
    marginHorizontal: Theme.spacing.md,
    letterSpacing: 0,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Theme.spacing.xl,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
});
