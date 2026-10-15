import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, Image, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Minus, Plus, Soup, Sparkles } from 'lucide-react-native';
import { AppText } from '../../../../components/AppText';
import { AppButton } from '../../../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../../../components/AppScreen';
import { Theme } from '../../../../theme';
import { useLanguage } from '../../../../context/LanguageContext';
import { useAppStore } from '../../../../store/AppStore';
import { IMAGES, SEED_MENU, SEED_RESTAURANTS, THALI_COMPONENTS } from '../../../../data/catalogue';

const MAX_EXTRA_PER_COMPONENT = 4;

/**
 * Build-your-own thali.
 *
 * Reads the kitchen id from the route, prices the thali honestly (base price plus
 * per-portion extras above what the vendor includes) and writes the customised
 * thali into the cart through `store.addItem`, with the composition carried as a
 * line note so the cart, checkout, order and tracking screens all show what was
 * customised. Add-ons are the next step of the same journey.
 */
export default function BuildThaliScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language, currency } = useLanguage();
  const { addItem } = useAppStore();

  const [counts, setCounts] = useState<number[]>(() => THALI_COMPONENTS.map((c) => c.defaultCount));
  const [toast, setToast] = useState<string | null>(null);
  const [instructions, setLocalInstructions] = useState('');

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  const vendor = useMemo(() => SEED_RESTAURANTS.find((r) => r.id === id), [id]);
  const base = useMemo(
    () =>
      SEED_MENU.find((m) => m.restaurantId === id && m.category === 'Thali') ??
      SEED_MENU.find((m) => m.restaurantId === id),
    [id],
  );

  const extras = useMemo(
    () =>
      THALI_COMPONENTS.reduce(
        (sum, component, index) =>
          sum + Math.max(0, (counts[index] ?? component.defaultCount) - component.defaultCount) * component.extraPrice,
        0,
      ),
    [counts],
  );

  const total = (base?.price ?? 0) + extras;

  const composition = useMemo(() => {
    const parts = THALI_COMPONENTS.map((component, index) => ({
      name: component.name,
      nameGu: component.nameGu,
      count: counts[index] ?? component.defaultCount,
    })).filter((part) => part.count > 0);
    return {
      en: parts.map((part) => `${part.count} ${part.name}`).join(' · '),
      gu: parts.map((part) => `${part.count} ${part.nameGu}`).join(' · '),
    };
  }, [counts]);

  const updateCount = (index: number, delta: number) => {
    setCounts((prev) => {
      const next = [...prev];
      const floor = 0;
      const ceiling = THALI_COMPONENTS[index].defaultCount + MAX_EXTRA_PER_COMPONENT;
      next[index] = Math.min(ceiling, Math.max(floor, (next[index] ?? 0) + delta));
      return next;
    });
  };

  const handleAdd = () => {
    if (!base) return;
    // Special instructions ride along in the line note, so the kitchen sees them.
    const note = instructions.trim()
      ? {
          en: `${composition.en} · ${instructions.trim()}`,
          gu: `${composition.gu} · ${instructions.trim()}`,
        }
      : { en: composition.en, gu: composition.gu };
    addItem({ ...base, price: total, mrp: undefined }, 1, note);
    setToast(t('screens.tiffin.thaliAdded', { name: label(base.name, base.nameGu) }));
    setTimeout(() => router.push('/addons'), 700);
  };

  const back = (
    <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
      <ArrowLeft size={22} color={Theme.colors.text} />
    </Pressable>
  );

  if (!vendor || !base) {
    return (
      <AppScrollScreen>
        <ScreenHeader title={t('screens.tiffin.buildTitle')} left={back} />
        <EmptyState
          icon={<Soup size={28} color={Theme.colors.primary} />}
          title={t('flow.notFound.title')}
          body={t('flow.notFound.body')}
          action={<AppButton title={t('flow.notFound.cta')} onPress={() => router.replace('/tiffins')} />}
        />
      </AppScrollScreen>
    );
  }

  return (
    <AppScrollScreen
      contentStyle={{ paddingBottom: Theme.spacing.xl }}
      footer={
        <View style={styles.footer}>
          <View style={styles.footerTotals}>
            <AppText variant="h3">{currency(total)}</AppText>
            <AppText variant="caption" color={Theme.colors.textMuted} numberOfLines={1}>
              {extras > 0
                ? `${label(base.name, base.nameGu)} + ${currency(extras)} ${t('screens.tiffin.extraTotal').toLowerCase()}`
                : label(base.name, base.nameGu)}
            </AppText>
          </View>
          <View style={{ width: Theme.spacing.md }} />
          <AppButton title={t('screens.tiffin.addThali', { total: currency(total) })} onPress={handleAdd} />
        </View>
      }
    >
      <ScreenHeader title={t('screens.tiffin.buildTitle')} subtitle={vendor.name} left={back} />

      <Animated.View entering={FadeInDown.duration(Theme.motion.base)} style={styles.hero}>
        <Image source={base.image ?? IMAGES.gujaratiThali} style={styles.heroImage} />
        <View style={styles.heroBody}>
          <AppText variant="h3">{label(base.name, base.nameGu)}</AppText>
          <AppText variant="bodySmall" color={Theme.colors.textMuted}>
            {t('screens.tiffin.buildSubtitle')}
          </AppText>
        </View>
      </Animated.View>

      <View style={styles.card}>
        {THALI_COMPONENTS.map((component, index) => {
          const count = counts[index] ?? component.defaultCount;
          const isExtra = count > component.defaultCount;
          return (
            <Animated.View
              key={component.id}
              entering={FadeInDown.delay(60 + index * 30).duration(Theme.motion.fast)}
            >
              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <AppText variant="h3">{label(component.name, component.nameGu)}</AppText>
                  <AppText variant="caption" color={isExtra ? Theme.colors.primary : Theme.colors.textMuted}>
                    {count <= component.defaultCount
                      ? t('screens.tiffin.included')
                      : t('screens.tiffin.extraEach', { amount: currency(component.extraPrice) })}
                  </AppText>
                </View>

                <View style={styles.stepper}>
                  <Pressable
                    onPress={() => updateCount(index, -1)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.remove')}
                    style={styles.stepperButton}
                  >
                    <Minus size={16} color={count === 0 ? Theme.colors.border : Theme.colors.primary} />
                  </Pressable>
                  <AppText variant="h3" style={styles.stepperCount}>
                    {count}
                  </AppText>
                  <Pressable
                    onPress={() => updateCount(index, 1)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={t('flow.common.add')}
                    style={styles.stepperButton}
                  >
                    <Plus
                      size={16}
                      color={count >= component.defaultCount + MAX_EXTRA_PER_COMPONENT ? Theme.colors.border : Theme.colors.primary}
                    />
                  </Pressable>
                </View>
              </View>
              {index < THALI_COMPONENTS.length - 1 ? <View style={styles.divider} /> : null}
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.instructions}>
        <AppText variant="h3">{t('screens.thali.instructions')}</AppText>
        <TextInput
          value={instructions}
          onChangeText={setLocalInstructions}
          placeholder={t('screens.thali.instructionsHint')}
          placeholderTextColor={Theme.colors.textMuted}
          multiline
          maxLength={140}
          style={styles.instructionsInput}
          accessibilityLabel={t('screens.thali.instructions')}
        />
      </View>

      {extras > 0 ? (
        <View style={styles.extrasBanner}>
          <Sparkles size={16} color={Theme.colors.primary} />
          <AppText variant="caption" color={Theme.colors.primary} style={{ flex: 1 }}>
            {t('screens.tiffin.extraTotal')} · {currency(extras)}
          </AppText>
        </View>
      ) : null}

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
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  heroImage: { width: 64, height: 64, borderRadius: Theme.borderRadius.md },
  heroBody: { flex: 1, gap: 2 },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Theme.spacing.md, paddingVertical: Theme.spacing.sm },
  rowInfo: { flex: 1, gap: 2 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    height: 36,
  },
  stepperButton: { width: 40, height: 36, alignItems: 'center', justifyContent: 'center' },
  stepperCount: { width: 28, textAlign: 'center' },
  divider: { height: 1, backgroundColor: Theme.colors.border },
  instructions: { gap: Theme.spacing.sm },
  instructionsInput: {
    minHeight: 64,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    fontSize: 15,
    color: Theme.colors.text,
    textAlignVertical: 'top',
  },
  extrasBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  footerTotals: { flex: 1, gap: 2 },
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

/**
 * Prerender one HTML page per seeded kitchen at export time, so deep links to a
 * kitchen or tiffin vendor ship real content instead of an empty shell.
 * (Exported routes without params cannot be rendered by a static host.)
 */
export async function generateStaticParams(): Promise<Record<string, string>[]> {
  // Only vendors with a published thali: the builder needs a real menu item, and
  // pre-rendering an id it cannot resolve would ship a not-found page.
  return SEED_RESTAURANTS.filter((restaurant) =>
    SEED_MENU.some((item) => item.restaurantId === restaurant.id),
  ).map((restaurant) => ({ id: restaurant.id }));
}
