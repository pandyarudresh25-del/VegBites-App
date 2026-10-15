import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, ShieldCheck, Smartphone } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Phone entry. Validates the number before allowing the OTP step and passes
 * both the phone and the requested role forward, so OTP can sign the user in
 * and route them correctly.
 */
export default function LoginScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const { t } = useLanguage();

  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const digits = phone.replace(/\D/g, '');
  const isValid = digits.length === 10 && /^[6-9]/.test(digits);

  const handleSendOtp = () => {
    if (!isValid) {
      setError(t('flow.auth.invalidPhone'));
      return;
    }
    setError(null);
    router.push({ pathname: '/(auth)/otp', params: { phone: digits, role: role ?? 'customer' } });
  };

  return (
    <AppScrollScreen contentStyle={styles.content}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        style={styles.back}
        accessibilityLabel={t('common.back')}
      >
        <ArrowLeft size={22} color={Theme.colors.text} />
      </Pressable>

      <Animated.View entering={FadeInDown.duration(Theme.motion.base)} style={styles.header}>
        <View style={styles.iconBubble}>
          <Smartphone size={26} color={Theme.colors.primary} />
        </View>
        <AppText variant="h1" align="center" style={{ marginTop: Theme.spacing.lg }}>
          {t('login.title')}
        </AppText>
        <AppText variant="body" align="center" style={{ marginTop: Theme.spacing.sm }}>
          {t('login.subtitle')}
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(Theme.motion.base)} style={styles.form}>
        <View style={[styles.inputWrap, error ? styles.inputWrapError : null]}>
          <View style={styles.countryCode}>
            <AppText variant="h3">+91</AppText>
          </View>
          <TextInput
            style={styles.input}
            placeholder={t('flow.auth.phoneLabel')}
            placeholderTextColor={Theme.colors.textMuted}
            keyboardType="number-pad"
            inputMode="numeric"
            value={phone}
            onChangeText={(value) => {
              setPhone(value.replace(/\D/g, '').slice(0, 10));
              setError(null);
            }}
            maxLength={10}
            returnKeyType="done"
            autoFocus={Platform.OS !== 'web'}
            onSubmitEditing={handleSendOtp}
          />
        </View>

        {error ? (
          <AppText variant="bodySmall" color={Theme.colors.error}>
            {error}
          </AppText>
        ) : (
          <AppText variant="caption">{t('flow.auth.demoHint')}</AppText>
        )}

        <AppButton title={t('flow.auth.sendOtp')} onPress={handleSendOtp} disabled={!isValid} />

        <View style={styles.terms}>
          <ShieldCheck size={14} color={Theme.colors.success} />
          <AppText variant="caption" style={{ flex: 1 }}>
            {t('flow.auth.terms')}
          </AppText>
        </View>
      </Animated.View>
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Theme.spacing.md, gap: Theme.spacing.xl },
  back: { width: 40, height: 40, justifyContent: 'center' },
  header: { alignItems: 'center' },
  iconBubble: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: { gap: Theme.spacing.md },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.md,
  },
  inputWrapError: { borderColor: Theme.colors.error },
  countryCode: {
    paddingRight: Theme.spacing.md,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: Theme.colors.border,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: Theme.spacing.md,
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.text,
    letterSpacing: 1,
    height: '100%',
  },
  terms: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
  },
});
