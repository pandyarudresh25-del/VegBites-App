import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Trash2, UtensilsCrossed } from 'lucide-react-native';
import { AppText } from '../../../components/AppText';
import { AppButton } from '../../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../../components/AppScreen';
import { Theme } from '../../../theme';
import { useLanguage } from '../../../context/LanguageContext';
import { useAppStore } from '../../../store/AppStore';

/**
 * Edit a dish: price and availability, both persisted (`priceOverrides` /
 * `soldOutItemIds`) so the customer app sees the same values. A dish added by
 * the kitchen is marked so the kitchen knows it owns it.
 */
export default function VendorEditDishScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language, currency } = useLanguage();
  const { vendorMenu, setItemPrice, toggleSoldOut, removeMenuItem, restoreMenuItem, removedItemIds } = useAppStore();

  const item = useMemo(() => vendorMenu.find((entry) => entry.id === id), [vendorMenu, id]);
  const [price, setPrice] = useState(item ? String(item.price) : '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  const back = (
    <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
      <ArrowLeft size={22} color={Theme.colors.text} />
    </Pressable>
  );

  if (!item) {
    return (
      <AppScrollScreen>
        <ScreenHeader title={t('screens.vendor.editTitle')} left={back} />
        <EmptyState
          icon={<UtensilsCrossed size={26} color={Theme.colors.primary} />}
          title={t('screens.vendor.noDishes')}
          body={t('screens.vendor.noDishesHint')}
          action={<AppButton title={t('screens.vendor.backToMenu')} onPress={() => router.replace('/vendor/menu' as never)} />}
        />
      </AppScrollScreen>
    );
  }

  const save = () => {
    const value = Number(price);
    if (!Number.isFinite(value) || value < 10 || value > 2000) {
      setError(t('screens.vendor.priceInvalid'));
      return;
    }
    setItemPrice(item.id, Math.round(value));
    setError(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <AppScrollScreen footer={<AppButton title={t('screens.vendor.editTitle')} onPress={save} />}>
      <ScreenHeader title={t('screens.vendor.editTitle')} subtitle={label(item.name, item.nameGu)} left={back} />

      <View style={styles.card}>
        <View style={styles.head}>
          {item.image ? (
            <Image source={item.image} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbFallback]} />
          )}
          <View style={{ flex: 1 }}>
            <AppText variant="h3">{label(item.name, item.nameGu)}</AppText>
            <AppText variant="caption" color={Theme.colors.textMuted}>
              {item.category} · {currency(item.price)}
            </AppText>
          </View>
        </View>

        <AppText variant="h3">{t('screens.vendor.priceLabel')}</AppText>
        <TextInput
          value={price}
          onChangeText={setPrice}
          keyboardType="number-pad"
          placeholderTextColor={Theme.colors.textMuted}
          style={styles.input}
          accessibilityLabel={t('screens.vendor.priceLabel')}
        />
        <AppText variant="caption" color={Theme.colors.textMuted}>
          {currency(Number(price) || 0)}
        </AppText>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <AppText variant="h3">{item.available ? t('screens.vendor.available') : t('screens.vendor.soldOut')}</AppText>
            <AppText variant="caption" color={Theme.colors.textMuted}>
              {item.available ? t('screens.vendor.markSoldOut') : t('screens.vendor.markAvailable')}
            </AppText>
          </View>
          <Pressable
            onPress={() => toggleSoldOut(item.id)}
            accessibilityRole="switch"
            accessibilityState={{ checked: item.available }}
            style={[styles.switchTrack, item.available && styles.switchTrackOn]}
          >
            <View style={[styles.switchThumb, item.available && styles.switchThumbOn]} />
          </Pressable>
        </View>
      </View>

      {removedItemIds.includes(item.id) ? (
        <AppButton variant="outline" title={t('screens.vendor.putBack')} onPress={() => restoreMenuItem(item.id)} />
      ) : confirmingRemove ? (
        <View style={styles.confirmCard}>
          <AppText variant="h3">{t('screens.vendor.removeConfirm', { name: label(item.name, item.nameGu) })}</AppText>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <AppButton variant="outline" title={t('common.cancel')} onPress={() => setConfirmingRemove(false)} />
            </View>
            <View style={{ flex: 1 }}>
              <AppButton
                title={t('screens.vendor.removeItem')}
                onPress={() => {
                  removeMenuItem(item.id);
                  setConfirmingRemove(false);
                  router.back();
                }}
              />
            </View>
          </View>
        </View>
      ) : (
        <Pressable onPress={() => setConfirmingRemove(true)} style={styles.remove} accessibilityRole="button">
          <Trash2 size={17} color={Theme.colors.error} />
          <AppText variant="h3" color={Theme.colors.error}>
            {t('screens.vendor.removeItem')}
          </AppText>
        </Pressable>
      )}

      {error ? (
        <AppText variant="bodySmall" color={Theme.colors.error}>
          {error}
        </AppText>
      ) : null}
      {saved ? (
        <AppText variant="bodySmall" color={Theme.colors.success}>
          {t('screens.vendor.dishSaved', { name: label(item.name, item.nameGu) })}
        </AppText>
      ) : null}
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Theme.spacing.sm,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  thumb: { width: 56, height: 56, borderRadius: Theme.borderRadius.md },
  thumbFallback: { backgroundColor: Theme.colors.surfaceSecondary },
  input: {
    height: 48,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
    color: Theme.colors.text,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  remove: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.error,
    backgroundColor: Theme.colors.errorSoft,
  },
  confirmCard: {
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.error,
    backgroundColor: Theme.colors.errorSoft,
  },
  switchTrack: {
    width: 46,
    height: 26,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.disabled,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  switchTrackOn: { backgroundColor: Theme.colors.success },
  switchThumb: { width: 20, height: 20, borderRadius: Theme.borderRadius.pill, backgroundColor: Theme.colors.surface },
  switchThumbOn: { alignSelf: 'flex-end' },
});
