import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Bookmark, Heart, MessageCircle, Play, ShoppingBag } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppScreen, EmptyState } from '../../components/AppScreen';
import { Theme, palette, withAlpha } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import { SEED_MENU, SEED_REELS } from '../../data/catalogue';

/**
 * Reels. Feed with working like / save / "Order this" — which adds the featured
 * dish to the cart and opens its kitchen, so the reel is actually shoppable.
 */
export default function ReelsScreen() {
  const router = useRouter();
  const { t, language, count } = useLanguage();
  const { addItem } = useAppStore();

  const [reels, setReels] = useState(SEED_REELS);
  const [toast, setToast] = useState<string | null>(null);

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  const toggle = (id: string, field: 'liked' | 'saved') => {
    setReels((prev) =>
      prev.map((reel) =>
        reel.id === id
          ? {
              ...reel,
              [field]: !reel[field],
              likes: field === 'liked' ? reel.likes + (reel.liked ? -1 : 1) : reel.likes,
            }
          : reel,
      ),
    );
  };

  const orderThis = (reelId: string) => {
    const reel = reels.find((r) => r.id === reelId);
    const item = reel?.itemId ? SEED_MENU.find((m) => m.id === reel.itemId) : undefined;
    if (!item) return;
    addItem(item);
    setToast(t('screens.restaurants.added', { name: label(item.name, item.nameGu) }));
    setTimeout(() => {
      setToast(null);
      router.push(`/restaurant/${item.restaurantId}`);
    }, 800);
  };

  if (reels.length === 0) {
    return (
      <AppScreen>
        <EmptyState title={t('flow.reels.none') ?? t('reels.title')} />
      </AppScreen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      {toast ? (
        <Animated.View entering={FadeInDown.duration(Theme.motion.fast)} style={styles.toast}>
          <AppText variant="bodySmall" color={Theme.colors.surface}>
            {toast}
          </AppText>
        </Animated.View>
      ) : null}

      <AppScreen padded={false}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
              <ArrowLeft size={22} color={Theme.colors.text} />
            </Pressable>
            <AppText variant="h2" style={{ flex: 1, marginLeft: Theme.spacing.md }}>
              {t('reels.title')}
            </AppText>
          </View>

          {reels.map((reel, index) => (
            <Animated.View key={reel.id} entering={FadeInDown.delay(index * 60).duration(Theme.motion.base)}>
              <View style={styles.reelCard}>
                {reel.image ? (
                  <Image source={reel.image} style={styles.reelImage} />
                ) : (
                  <View style={[styles.reelImage, styles.reelFallback]} />
                )}

                {/* play affordance */}
                <View style={styles.playBadge}>
                  <Play size={14} color={Theme.colors.surface} fill={Theme.colors.surface} />
                  <AppText variant="caption" color={Theme.colors.surface}>
                    {count(reel.views)}
                  </AppText>
                </View>

                {/* caption over scrim */}
                <View style={styles.captionBlock}>
                  <AppText variant="h3" color={Theme.colors.surface} numberOfLines={2}>
                    {label(reel.kitchenName, reel.kitchenNameGu)}
                  </AppText>
                  <AppText variant="caption" color={Theme.colors.surface} style={{ opacity: 0.9 }} numberOfLines={2}>
                    {label(reel.caption, reel.captionGu)}
                  </AppText>

                  <View style={styles.actionRow}>
                    <Pressable
                      onPress={() => toggle(reel.id, 'liked')}
                      style={styles.iconAction}
                      accessibilityRole="button"
                      accessibilityLabel={reel.liked ? t('flow.reels.liked') : t('flow.reels.like')}
                    >
                      <Heart
                        size={17}
                        color={reel.liked ? Theme.colors.primary : Theme.colors.surface}
                        fill={reel.liked ? Theme.colors.primary : 'transparent'}
                      />
                      <AppText variant="caption" color={Theme.colors.surface}>
                        {count(reel.likes)}
                      </AppText>
                    </Pressable>

                    <View style={styles.iconAction}>
                      <MessageCircle size={17} color={Theme.colors.surface} />
                      <AppText variant="caption" color={Theme.colors.surface}>
                        {reel.commentsCount}
                      </AppText>
                    </View>

                    <Pressable
                      onPress={() => toggle(reel.id, 'saved')}
                      style={styles.iconAction}
                      accessibilityRole="button"
                      accessibilityLabel={reel.saved ? t('flow.reels.saved') : t('flow.reels.save')}
                    >
                      <Bookmark
                        size={17}
                        color={reel.saved ? Theme.colors.primary : Theme.colors.surface}
                        fill={reel.saved ? Theme.colors.primary : 'transparent'}
                      />
                      <AppText variant="caption" color={Theme.colors.surface}>
                        {reel.saved ? t('flow.reels.saved') : t('flow.reels.save')}
                      </AppText>
                    </Pressable>
                  </View>
                </View>

                {/* shoppable CTA */}
                {reel.itemId ? (
                  <Pressable
                    onPress={() => orderThis(reel.id)}
                    style={styles.orderButton}
                    accessibilityRole="button"
                  >
                    <ShoppingBag size={15} color={Theme.colors.surface} />
                    <AppText variant="label" color={Theme.colors.surface}>
                      {t('flow.reels.orderThis')}
                    </AppText>
                  </Pressable>
                ) : null}
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Theme.layout.screenPaddingX, paddingBottom: Theme.spacing.huge, gap: Theme.spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: Theme.spacing.sm },
  reelCard: { height: 400, borderRadius: Theme.borderRadius.xl, overflow: 'hidden', justifyContent: 'flex-end' },
  reelImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  reelFallback: { backgroundColor: Theme.colors.surfaceSecondary },
  playBadge: {
    position: 'absolute',
    top: Theme.spacing.md,
    left: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.colors.overlay,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.pill,
  },
  captionBlock: { padding: Theme.spacing.lg, gap: 4, backgroundColor: withAlpha(palette.ink, 0.55) },
  actionRow: { flexDirection: 'row', gap: Theme.spacing.xl, marginTop: Theme.spacing.sm },
  iconAction: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
  },
  toast: {
    position: 'absolute',
    top: Theme.spacing.huge,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: Theme.colors.text,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
  },
});
