import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, FadeInDown, FadeIn, withRepeat, withSequence } from 'react-native-reanimated';
import { useLanguage } from '../../context/LanguageContext';

export default function OtpScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams();
  const { t } = useLanguage();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);
  const focusIndex = useSharedValue(-1);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
      focusIndex.value = index + 1;
    } else if (text && index === 5) {
      handleVerify(newOtp);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      focusIndex.value = index - 1;
    }
  };

  const handleVerify = (currentOtp = otp) => {
    if (currentOtp.every(val => val.length === 1)) {
      setIsVerifying(true);
      setTimeout(() => {
        if (role === 'vendor') {
          router.replace('/(vendor)/dashboard');
        } else if (role === 'delivery') {
          router.replace('/(delivery)/dashboard');
        } else {
          router.replace('/(customer)/address');
        }
      }, 500);
    }
  };

  const OtpBox = ({ digit, index }: { digit: string, index: number }) => {
    const boxStyle = useAnimatedStyle(() => {
      const isFocused = focusIndex.value === index;
      return {
        transform: [{ scale: withSpring(isFocused || digit ? 1.05 : 1, { damping: 12 }) }],
        borderColor: withTiming(isFocused || digit ? Theme.colors.primary : Theme.colors.border),
        backgroundColor: withTiming(Theme.colors.surface),
      };
    });

    return (
      <Animated.View style={[styles.otpBoxWrapper, boxStyle]}>
        <TextInput
          ref={ref => { inputs.current[index] = ref; }}
          style={styles.otpInput}
          maxLength={1}
          keyboardType="number-pad"
          value={digit}
          onFocus={() => { focusIndex.value = index; }}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          selectTextOnFocus
          editable={!isVerifying}
        />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
            <AppText variant="h1" align="center" style={styles.title}>
              {t('otp.title')}
            </AppText>
            <AppText variant="body" align="center" color={Theme.colors.textSecondary} style={{ lineHeight: 22 }}>
              {t('otp.subtitle')}
              <AppText variant="h3" color={Theme.colors.text}>+91 98765 43210</AppText>
            </AppText>
          </Animated.View>

          <View style={styles.formContainer}>
            <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <OtpBox key={index} digit={digit} index={index} />
              ))}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.resendContainer}>
              <AppText variant="bodySmall" color={Theme.colors.textMuted}>
                {t('otp.didntReceive')}{' '}
              </AppText>
              <AppText variant="bodySmall" color={Theme.colors.primary} style={styles.timer}>
                {t('otp.resend')}
              </AppText>
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
  },
  title: {
    marginBottom: Theme.spacing.md,
    fontSize: 24,
  },
  formContainer: {
    gap: Theme.spacing.xl,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.sm,
  },
  otpBoxWrapper: {
    width: 48,
    height: 48,
    backgroundColor: Theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 24,
    color: Theme.colors.text,
    fontWeight: '700',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  timer: {
    fontWeight: '700',
  },
});
