import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';

const OTP_LENGTH = 6;
const DEMO_OTP = '123456';

/**
 * OTP verification.
 *
 * Uses one hidden TextInput behind six visual boxes rather than six separate
 * inputs — this keeps paste, autofill and backspace behaviour correct on both
 * native and web. On success it calls `store.signIn()` so the rest of the app
 * (profile, checkout, wallet) has a real user.
 */
export default function OtpScreen() {
  const router = useRouter();
  const { phone, role } = useLocalSearchParams<{ phone?: string; role?: string }>();
  const { t } = useLanguage();
  const { signIn } = useAppStore();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [verifying, setVerifying] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const maskedPhone = useMemo(() => {
    const digits = (phone ?? '').replace(/\D/g, '');
    return digits.length === 10 ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : `+91 ${phone ?? ''}`;
  }, [phone]);

  // resend countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const verify = (value = code) => {
    if (value.length < OTP_LENGTH) return;
    setVerifying(true);
    // Simulated verification round-trip; the state machine is what matters.
    setTimeout(() => {
      if (value === DEMO_OTP) {
        signIn(phone ?? '9876543210');
        setError(null);
        setVerifying(false);
        // Role-aware landing. Customer app is the only one in scope for now.
        if (role === 'vendor') router.replace('/vendor/dashboard');
        else if (role === 'delivery') router.replace('/delivery/dashboard');
        else router.replace('/(auth)/setup');
      } else {
        setVerifying(false);
        setError(t('flow.auth.invalidOtp'));
        setCode('');
      }
    }, 700);
  };

  const handleChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setCode(digits);
    setError(null);
    if (digits.length === OTP_LENGTH) verify(digits);
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
        <AppText variant="h1" align="center">
          {t('flow.auth.otpTitle')}
        </AppText>
        <AppText variant="body" align="center" style={{ marginTop: Theme.spacing.sm }}>
          {t('flow.auth.otpSubtitle', { phone: maskedPhone })}
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(Theme.motion.base)} style={styles.form}>
        {/* the real input is invisible but focusable, so keyboards/autofill work */}
        <Pressable onPress={() => inputRef.current?.focus()} style={styles.boxes} accessibilityRole="none">
          {Array.from({ length: OTP_LENGTH }).map((_, index) => {
            const char = code[index];
            const isCursor = index === Math.min(code.length, OTP_LENGTH - 1);
            return (
              <View
                key={index}
                style={[
                  styles.box,
                  char ? styles.boxFilled : null,
                  !char && isCursor && !error ? styles.boxActive : null,
                  error ? styles.boxError : null,
                ]}
              >
                <AppText variant="h2" color={error ? Theme.colors.error : Theme.colors.text}>
                  {char ?? ''}
                </AppText>
              </View>
            );
          })}
        </Pressable>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleChange}
          keyboardType="number-pad"
          inputMode="numeric"
          autoFocus
          maxLength={OTP_LENGTH}
          textContentType="oneTimeCode"
          style={styles.hiddenInput}
          accessibilityLabel={t('flow.auth.otpTitle')}
        />

        {error ? (
          <AppText variant="bodySmall" color={Theme.colors.error} align="center">
            {error}
          </AppText>
        ) : (
          <AppText variant="caption" align="center">
            {t('flow.auth.demoHint')}
          </AppText>
        )}

        <AppButton
          title={verifying ? t('otp.verifying') : t('flow.auth.verify')}
          onPress={() => verify()}
          disabled={code.length < OTP_LENGTH}
          isLoading={verifying}
        />

        <View style={styles.footerRow}>
          <Pressable onPress={() => router.back()} disabled={verifying}>
            <AppText variant="bodySmall" color={Theme.colors.primary}>
              {t('flow.auth.changeNumber')}
            </AppText>
          </Pressable>

          {secondsLeft > 0 ? (
            <AppText variant="caption">{t('flow.auth.resendIn', { seconds: secondsLeft })}</AppText>
          ) : (
            <Pressable
              onPress={() => {
                setSecondsLeft(30);
                setCode('');
                setError(null);
              }}
            >
              <AppText variant="bodySmall" color={Theme.colors.primary}>
                {t('flow.auth.resend')}
              </AppText>
            </Pressable>
          )}
        </View>

        <View style={styles.secureRow}>
          <ShieldCheck size={14} color={Theme.colors.success} />
          <AppText variant="caption" style={{ flex: 1 }}>
            {t('flow.payment.secure')}
          </AppText>
        </View>
      </Animated.View>
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Theme.spacing.md, gap: Theme.spacing.xxl },
  back: { width: 40, height: 40, justifyContent: 'center' },
  header: { alignItems: 'center' },
  form: { gap: Theme.spacing.lg },
  boxes: { flexDirection: 'row', justifyContent: 'space-between', gap: Theme.spacing.sm },
  box: {
    flex: 1,
    height: 58,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primarySoft },
  boxActive: { borderColor: Theme.colors.textSecondary },
  boxError: { borderColor: Theme.colors.error },
  // Positioned off-screen rather than display:none — a hidden input cannot
  // receive focus, which would break typing entirely.
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
});
