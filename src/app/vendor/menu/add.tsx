import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { AppText } from '../../../components/AppText';
import { AppButton } from '../../../components/AppButton';
import { AppScrollScreen, ScreenHeader } from '../../../components/AppScreen';
import { Theme } from '../../../theme';
import { useLanguage } from '../../../context/LanguageContext';
import { useAppStore } from '../../../store/AppStore';

/** Categories the kitchen can file a new dish under (matching the catalogue). */
const CATEGORIES = ['Thali', 'Specials', 'Sabji', 'Dal & Rice', 'Rotli', 'Dessert', 'Beverages', 'Add-ons'] as const;

/**
 * Add a dish. Writes a real `MenuItem` into the store via `addMenuItem`, so the
 * new dish immediately appears in the kitchen's menu, in the customer app's
 * kitchen page and in the dish-detail route.
 */
export default function VendorAddDishScreen() {
  const router = useRouter();
  const { t, currency } = useLanguage();
  const { addMenuItem } = useAppStore();

  const [name, setName] = useState('');
  const [nameGu, setNameGu] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const value = Number(price);
    if (!name.trim()) {
      setError(t('screens.vendor.nameRequired'));
      return;
    }
    if (!Number.isFinite(value) || value < 10 || value > 2000) {
      setError(t('screens.vendor.priceInvalid'));
      return;
    }
    const item = addMenuItem({
      name: name.trim(),
      nameGu: nameGu.trim() || name.trim(),
      price: Math.round(value),
      category,
      description: description.trim(),
    });
    setError(null);
    router.back();
    // The menu screen reads the store, so it shows the new dish on return.
    setTimeout(() => router.push('/vendor/menu' as never), 0);
    void item;
  };

  return (
    <AppScrollScreen
      footer={<AppButton title={t('common.save')} onPress={save} />}
    >
      <ScreenHeader
        title={t('screens.vendor.addTitle')}
        left={
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
            <ArrowLeft size={22} color={Theme.colors.text} />
          </Pressable>
        }
      />

      <View style={styles.card}>
        <AppText variant="h3">{t('screens.vendor.nameLabel')}</AppText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('screens.vendor.nameLabel')}
          placeholderTextColor={Theme.colors.textMuted}
          style={styles.input}
          accessibilityLabel={t('screens.vendor.nameLabel')}
        />
        <AppText variant="h3">{t('screens.vendor.nameGuLabel')}</AppText>
        <TextInput
          value={nameGu}
          onChangeText={setNameGu}
          placeholder={t('screens.vendor.nameGuLabel')}
          placeholderTextColor={Theme.colors.textMuted}
          style={styles.input}
          accessibilityLabel={t('screens.vendor.nameGuLabel')}
        />
        <AppText variant="h3">{t('screens.vendor.descLabel')}</AppText>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder={t('screens.vendor.descLabel')}
          placeholderTextColor={Theme.colors.textMuted}
          style={styles.input}
          accessibilityLabel={t('screens.vendor.descLabel')}
        />
        <AppText variant="h3">{t('screens.vendor.priceLabel')}</AppText>
        <TextInput
          value={price}
          onChangeText={setPrice}
          keyboardType="number-pad"
          placeholder="120"
          placeholderTextColor={Theme.colors.textMuted}
          style={styles.input}
          accessibilityLabel={t('screens.vendor.priceLabel')}
        />
      </View>

      <View style={styles.card}>
        <AppText variant="h3">{t('screens.vendor.categoryLabel')}</AppText>
        <View style={styles.chips}>
          {CATEGORIES.map((entry) => {
            const active = category === entry;
            return (
              <Pressable
                key={entry}
                onPress={() => setCategory(entry)}
                style={[styles.chip, active && styles.chipOn]}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <AppText variant="caption" color={active ? Theme.colors.surface : Theme.colors.textSecondary}>
                  {entry}
                </AppText>
                {active ? <Check size={12} color={Theme.colors.surface} strokeWidth={3} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      {error ? (
        <AppText variant="bodySmall" color={Theme.colors.error}>
          {error}
        </AppText>
      ) : (
        <AppText variant="caption" color={Theme.colors.textMuted}>
          {price ? currency(Number(price) || 0) : ''}
        </AppText>
      )}
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
  input: {
    height: 48,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
    color: Theme.colors.text,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Theme.spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  chipOn: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
});
