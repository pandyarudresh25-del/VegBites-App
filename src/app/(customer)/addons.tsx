import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Check, IceCreamCone } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import { SEED_ADDONS } from '../../data/catalogue';

/**
 * Add-ons offered after building a thali.
 *
 * Add-ons are real catalogue items, so selecting them here puts them straight into
 * the cart through `store.addItem` — they then flow through checkout, the order and
 * tracking like any other dish. Skipping is a first-class action, not a dead end.
 */
export default function AddonsScreen() {
  const router = useRouter();
  const { t, language, currency } = useLanguage();
  const { addItem } = useAppStore();

  const [selected, setSelected] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  const chosen = useMemo(() => SEED_ADDONS.filter((item) => selected.includes(item.id)), [selected]);
  const total = useMemo(() => chosen.reduce((sum, item) => sum + item.price, 0), [chosen]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]));

  const handleContinue = () => {
    chosen.forEach((item) => addItem(item));
    if (chosen.length > 0) {
      setToast(t('screens.tiffin.addonsAdded', { count: chosen.length }));
      setTimeout(() => router.push('/cart'), 600);
      return;
    }
    router.push('/cart');
  };

  const back = (
    <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
      <ArrowLeft size={22} color={Theme.colors.text} />
    </Pressable>
  );

  if (SEED_ADDONS.length === 0) {
    return (
      <AppScrollScreen>
        <ScreenHeader title={t('screens.tiffin.addonsTitle')} left={back} />
        <EmptyState
          icon={<IceCreamCone size={28} color={Theme.colors.primary} />}
          title={t('screens.tiffin.addonsEmpty')}
          body={t('screens.tiffin.addonsEmptyHint')}
          action={<AppButton title={t('screens.tiffin.goToCart')} onPress={() => router.push('/cart')} />}
        />
      </AppScrollScreen>
    );
  }

  return (
    <AppScrollScreen
      contentStyle={{ paddingBottom: Theme.spacing.xl }}
      footer={
        <View style={styles.footer}>
          <AppButton variant="outline" title={t('screens.tiffin.skipAddons')} onPress={handleContinue} />
          <View style={{ width: Theme.spacing.md, flex: 1 }}>
            <AppButton
              disabled={selected.length === 0}
              title={
                selected.length === 0
                  ? t('screens.tiffin.addonsCtaEmpty')
                  : t('screens.tiffin.addonsCta', { count: selected.length, total: currency(total) })
              }
              onPress={handleContinue}
            />
          </View>
        </View>
      }
    >
      <ScreenHeader title={t('screens.tiffin.addonsTitle')} subtitle={t('screens.tiffin.addonsSubtitle')} left={back} />

      <View style={styles.list}>
        {SEED_ADDONS.map((item, index) => {
          const isOn = selected.includes(item.id);
          return (
            <Animated.View key={item.id} entering={FadeInDown.delay(40 + index * 30).duration(Theme.motion.fast)}>
              <Pressable
                onPress={() => toggle(item.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isOn }}
                accessibilityLabel={label(item.name, item.nameGu)}
                style={[styles.row, isOn && styles.rowOn]}
              >
                <View style={[styles.checkbox, isOn && styles.checkboxOn]}>
                  {isOn ? <Check size={14} color={Theme.colors.surface} /> : null}
                </View>

                {item.image ? (
                  <Image source={item.image} style={styles.image} />
                ) : (
                  <View style={[styles.image, styles.imageFallback]}>
                    <IceCreamCone size={18} color={Theme.colors.primary} />
                  </View>
                )}

                <View style={styles.body}>
                  <AppText variant="h3" numberOfLines={1}>
                    {label(item.name, item.nameGu)}
                  </AppText>
                  <AppText variant="caption" color={Theme.colors.textMuted} numberOfLines={1}>
                    {label(item.description, item.descriptionGu)}
                  </AppText>
                </View>

                <AppText variant="price">{currency(item.price)}</AppText>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      {toast ? (
        <View style={styles.toast}>
          <AppText variant="caption" color={Theme.colors.surface}>
            {toast}
          </AppText>
        </View>
      ) : null}
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  list: { gap: Theme.spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  rowOn: { borderColor: Theme.colors.primary },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  image: { width: 44, height: 44, borderRadius: Theme.borderRadius.md },
  imageFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background },
  body: { flex: 1, gap: 2 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  toast: {
    position: 'absolute',
    top: Theme.spacing.huge,
    alignSelf: 'center',
    backgroundColor: Theme.colors.text,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
    zIndex: 10,
  },
});
