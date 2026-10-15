import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CircleSlash, Pencil, Plus, UtensilsCrossed } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, EmptyState, ScreenHeader } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';

/**
 * Menu management. The list is the kitchen's real catalogue (plus anything it
 * added itself, with its own price edits applied), and the availability switch
 * writes `soldOutItemIds`, which the customer's kitchen page reads too — mark a
 * dish sold out here and it shows as sold out to customers.
 */
export default function VendorMenuScreen() {
  const router = useRouter();
  const { t, language, currency } = useLanguage();
  const { vendorMenu, toggleSoldOut, reduceMotion, allVendorItems, restoreMenuItem, removedItemIds } = useAppStore();
  const [toast, setToast] = useState<string | null>(null);

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof vendorMenu>();
    vendorMenu.forEach((item) => {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    });
    return [...map.entries()];
  }, [vendorMenu]);

  const soldOutCount = vendorMenu.filter((item) => !item.available).length;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 1600);
  };

  return (
    <AppScrollScreen>
      {toast ? (
        <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(Theme.motion.fast)} style={styles.toast}>
          <AppText variant="bodySmall" color={Theme.colors.surface}>
            {toast}
          </AppText>
        </Animated.View>
      ) : null}

      <ScreenHeader
        title={t('screens.vendor.menuTitle')}
        subtitle={t('screens.vendor.menuSubtitle', { count: vendorMenu.length, soldOut: soldOutCount })}
        right={
          <Pressable
            onPress={() => router.push('/vendor/menu/add' as never)}
            style={styles.addIcon}
            accessibilityLabel={t('screens.vendor.addDish')}
            accessibilityRole="button"
          >
            <Plus size={20} color={Theme.colors.surface} />
          </Pressable>
        }
      />

      {vendorMenu.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed size={26} color={Theme.colors.primary} />}
          title={t('screens.vendor.noDishes')}
          body={t('screens.vendor.noDishesHint')}
          action={<AppButton title={t('screens.vendor.addDish')} onPress={() => router.push('/vendor/menu/add' as never)} />}
        />
      ) : (
        grouped.map(([category, items], groupIndex) => (
          <View key={category} style={styles.group}>
            <AppText variant="h3" color={Theme.colors.textSecondary}>
              {category}
            </AppText>
            {items.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={reduceMotion ? undefined : FadeInDown.delay(groupIndex * 40 + index * 25).duration(Theme.motion.base)}
              >
                <View style={styles.row}>
                  {item.image ? (
                    <Image source={item.image} style={styles.thumb} />
                  ) : (
                    <View style={[styles.thumb, styles.thumbFallback]} />
                  )}
                  <View style={{ flex: 1 }}>
                    <AppText variant="label" numberOfLines={1}>
                      {label(item.name, item.nameGu)}
                    </AppText>
                    <AppText variant="caption" color={Theme.colors.textMuted}>
                      {currency(item.price)}
                      {label(item.description, item.descriptionGu)
                        ? ` · ${label(item.description, item.descriptionGu)}`
                        : ''}
                    </AppText>
                  </View>

                  <Pressable
                    onPress={() => router.push(`/vendor/menu/edit?id=${item.id}` as never)}
                    style={styles.iconButton}
                    accessibilityLabel={t('screens.vendor.editTitle')}
                    accessibilityRole="button"
                  >
                    <Pencil size={15} color={Theme.colors.textSecondary} />
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      toggleSoldOut(item.id);
                      showToast(
                        item.available
                          ? t('screens.vendor.soldOutToast', { name: label(item.name, item.nameGu) })
                          : t('screens.vendor.availableToast', { name: label(item.name, item.nameGu) }),
                      );
                    }}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: item.available }}
                    accessibilityLabel={item.available ? t('screens.vendor.markSoldOut') : t('screens.vendor.markAvailable')}
                    style={[styles.switchTrack, item.available && styles.switchTrackOn]}
                  >
                    <View style={[styles.switchThumb, item.available && styles.switchThumbOn]} />
                  </Pressable>
                </View>
                <AppText variant="caption" color={item.available ? Theme.colors.success : Theme.colors.warning}>
                  {item.available ? t('screens.vendor.available') : t('screens.vendor.soldOut')}
                </AppText>
              </Animated.View>
            ))}
          </View>
        ))
      )}

      {vendorMenu.length > 0 ? (
        <AppButton
          variant="outline"
          title={t('screens.vendor.addDish')}
          onPress={() => router.push('/vendor/menu/add' as never)}
        />
      ) : null}

      {removedItemIds.length > 0 ? (
        <View style={styles.group}>
          <AppText variant="h3" color={Theme.colors.textSecondary}>
            {t('screens.vendor.removedList')} · {removedItemIds.length}
          </AppText>
          {allVendorItems
            .filter((item) => removedItemIds.includes(item.id))
            .map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <AppText variant="label" numberOfLines={1}>
                    {label(item.name, item.nameGu)}
                  </AppText>
                  <AppText variant="caption" color={Theme.colors.textMuted}>
                    {currency(item.price)}
                  </AppText>
                </View>
                <Pressable
                  onPress={() => restoreMenuItem(item.id)}
                  accessibilityRole="button"
                  style={styles.iconButton}
                >
                  <Plus size={15} color={Theme.colors.primary} />
                </Pressable>
              </View>
            ))}
        </View>
      ) : null}

      <View style={styles.note}>
        <CircleSlash size={14} color={Theme.colors.textMuted} />
        <AppText variant="caption" color={Theme.colors.textMuted} style={{ flex: 1 }}>
          {t('screens.vendor.noDishesHint')}
        </AppText>
      </View>
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  toast: {
    alignSelf: 'center',
    backgroundColor: Theme.colors.text,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
  },
  addIcon: {
    width: 38,
    height: 38,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  group: { gap: Theme.spacing.md },
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
  thumb: { width: 48, height: 48, borderRadius: Theme.borderRadius.md },
  thumbFallback: { backgroundColor: Theme.colors.surfaceSecondary },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
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
  note: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
});
