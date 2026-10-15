import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowRight, Check, MapPin, Navigation, Star } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, EmptyState } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import { SEED_RESTAURANTS } from '../../data/catalogue';

/**
 * Onboarding step 2 of 2 (after OTP): set a delivery area and meet the kitchens
 * that serve it. Both steps write real state — the picked area becomes the
 * customer's default address, and the nearby list is the seeded catalogue sorted
 * by real distance, so "Start ordering" drops them into a working app.
 */
const AREAS = [
  { area: 'Kalawad Road', areaGu: 'કાળાવાડ રોડ', pincode: '360005' },
  { area: 'University Road', areaGu: 'યુનિવર્સિટી રોડ', pincode: '360005' },
  { area: 'Ring Road', areaGu: 'રિંગ રોડ', pincode: '360001' },
  { area: 'Mavdi', areaGu: 'માવડી', pincode: '360004' },
] as const;

export default function SetupScreen() {
  const router = useRouter();
  const { t, language, currency } = useLanguage();
  const { user, addAddress, selectAddress, reduceMotion } = useAppStore();

  const [picked, setPicked] = useState<string>(AREAS[0].area);
  const [step, setStep] = useState<'area' | 'nearby'>('area');

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);
  const enter = (delay = 0) => (reduceMotion ? undefined : FadeInDown.delay(delay).duration(Theme.motion.base));

  /** The three kitchens closest to the customer, from the seeded catalogue. */
  const nearby = useMemo(() => [...SEED_RESTAURANTS].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3), []);

  const saveArea = () => {
    const chosen = AREAS.find((entry) => entry.area === picked) ?? AREAS[0];
    const created = addAddress({
      label: 'home',
      name: user?.name ?? 'Customer',
      phone: user?.phone ?? '9876543210',
      line1: label(chosen.area, chosen.areaGu),
      line2: label('Rajkot, Gujarat', 'રાજકોટ, ગુજરાત'),
      city: 'Rajkot',
      pincode: chosen.pincode,
    });
    selectAddress(created.id);
    setStep('nearby');
  };

  if (!user) {
    return (
      <AppScrollScreen>
        <EmptyState
          icon={<MapPin size={28} color={Theme.colors.primary} />}
          title={t('screens.setup.guestTitle')}
          body={t('screens.setup.guestBody')}
          action={<AppButton title={t('nav.login')} onPress={() => router.replace('/(auth)/login')} />}
        />
      </AppScrollScreen>
    );
  }

  return (
    <AppScrollScreen>
      <View style={styles.head}>
        <AppText variant="h1">{t('screens.setup.title')}</AppText>
        <AppText variant="bodySmall" color={Theme.colors.textSecondary}>
          {step === 'area' ? t('screens.setup.whereHint') : t('screens.setup.nearbyHint')}
        </AppText>
        <View style={styles.steps}>
          <View style={[styles.stepDot, styles.stepDotOn]} />
          <View style={[styles.stepDot, step === 'nearby' && styles.stepDotOn]} />
        </View>
      </View>

      {step === 'area' ? (
        <>
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Navigation size={17} color={Theme.colors.primary} />
              <AppText variant="h3">{t('screens.setup.areaLabel')}</AppText>
            </View>
            {AREAS.map((entry) => {
              const active = picked === entry.area;
              return (
                <Pressable
                  key={entry.area}
                  onPress={() => setPicked(entry.area)}
                  style={[styles.areaRow, active && styles.areaRowActive]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <MapPin size={16} color={active ? Theme.colors.primary : Theme.colors.textMuted} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodySmall" color={active ? Theme.colors.text : Theme.colors.textSecondary}>
                      {label(entry.area, entry.areaGu)}
                    </AppText>
                    <AppText variant="caption" color={Theme.colors.textMuted}>
                      {entry.pincode}
                    </AppText>
                  </View>
                  {active ? <Check size={16} color={Theme.colors.primary} strokeWidth={3} /> : null}
                </Pressable>
              );
            })}
          </View>

          <AppButton
            title={t('screens.setup.continueLabel')}
            rightIcon={<ArrowRight size={16} color={Theme.colors.surface} />}
            onPress={saveArea}
          />
          <Pressable onPress={() => router.replace('/home')} hitSlop={8} accessibilityRole="button">
            <AppText variant="caption" color={Theme.colors.textMuted} style={styles.skip}>
              {t('screens.setup.skip')}
            </AppText>
          </Pressable>
        </>
      ) : (
        <>
          {nearby.map((kitchen, index) => (
            <Animated.View key={kitchen.id} entering={enter(index * 60)}>
              <Pressable
                onPress={() => router.replace(`/restaurant/${kitchen.id}` as never)}
                style={styles.kitchen}
                accessibilityRole="button"
              >
                {kitchen.image ? (
                  <Image source={kitchen.image} style={styles.kitchenImage} />
                ) : (
                  <View style={[styles.kitchenImage, styles.kitchenFallback]} />
                )}
                <View style={{ flex: 1 }}>
                  <AppText variant="h3" numberOfLines={1}>
                    {label(kitchen.name, kitchen.nameGu)}
                  </AppText>
                  <View style={styles.metaRow}>
                    <Star size={12} color={Theme.colors.primary} fill={Theme.colors.primary} />
                    <AppText variant="caption" color={Theme.colors.textSecondary}>
                      {kitchen.rating} · {kitchen.deliveryMins} {t('flow.common.mins')} · {kitchen.distanceKm}{' '}
                      {t('common.km')}
                    </AppText>
                  </View>
                  <AppText variant="caption" color={Theme.colors.textMuted}>
                    {t('screens.restaurants.costForTwo', { amount: currency(kitchen.costForTwo) })}
                  </AppText>
                </View>
                <ArrowRight size={16} color={Theme.colors.textMuted} />
              </Pressable>
            </Animated.View>
          ))}

          <AppButton title={t('screens.setup.start')} onPress={() => router.replace('/home')} />
        </>
      )}
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  head: { gap: Theme.spacing.sm, marginTop: Theme.spacing.huge },
  steps: { flexDirection: 'row', gap: Theme.spacing.sm, marginTop: Theme.spacing.xs },
  stepDot: {
    width: 26,
    height: 4,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.disabled,
  },
  stepDotOn: { backgroundColor: Theme.colors.primary },
  card: {
    gap: Theme.spacing.sm,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  areaRowActive: { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primarySoft },
  kitchen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  kitchenImage: { width: 56, height: 56, borderRadius: Theme.borderRadius.md },
  kitchenFallback: { backgroundColor: Theme.colors.surfaceSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginVertical: 2 },
  skip: { textAlign: 'center', marginTop: Theme.spacing.md },
});
