import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Image, ScrollView, TextInput, Share, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  Bookmark,
  Heart,
  MessageCircle,
  Play,
  Send,
  Share2,
  ShoppingBag,
  Store,
  X,
} from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppScreen, EmptyState, ScreenHeader } from '../../components/AppScreen';
import { Theme, palette, withAlpha } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import { tapFeedback } from '../../lib/haptics';
import { SEED_MENU, SEED_REEL_COMMENTS, SEED_REELS } from '../../data/catalogue';

/**
 * Reels. Shoppable feed: like / save / comment / share all mutate persisted state,
 * "Order this" adds the featured dish to the cart and opens its kitchen, and the
 * kitchen name links to the vendor page so the reel never dead-ends.
 */
export default function ReelsScreen() {
  const router = useRouter();
  const { t, language, count } = useLanguage();
  const {
    addItem,
    likedReels,
    savedReels,
    toggleReelLike,
    toggleReelSave,
    reelComments,
    addReelComment,
    reduceMotion,
  } = useAppStore();

  const [toast, setToast] = useState<string | null>(null);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);
  const enter = (delay: number) => (reduceMotion ? undefined : FadeInDown.delay(delay).duration(Theme.motion.base));

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 1600);
  };

  const orderThis = (reelId: string) => {
    const reel = SEED_REELS.find((r) => r.id === reelId);
    const item = reel?.itemId ? SEED_MENU.find((m) => m.id === reel.itemId) : undefined;
    if (!item) return;
    addItem(item);
    tapFeedback();
    showToast(t('screens.restaurants.added', { name: label(item.name, item.nameGu) }));
    setTimeout(() => router.push(`/restaurant/${item.restaurantId}` as never), 700);
  };

  /** Native share sheet, or the Web Share API, with a clipboard-free fallback. */
  const share = async (reelId: string) => {
    const reel = SEED_REELS.find((r) => r.id === reelId);
    if (!reel) return;
    const text = `${label(reel.kitchenName, reel.kitchenNameGu)} — ${label(reel.caption, reel.captionGu)} · VegBites`;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'VegBites', text });
      } else if (Platform.OS === 'web') {
        await navigator.clipboard?.writeText(text);
        showToast(t('flow.reels.linkCopied'));
        return;
      } else {
        await Share.share({ message: text });
        return;
      }
      showToast(t('flow.reels.shared'));
    } catch {
      // The user dismissed the sheet, or the browser blocked it — stay silent.
    }
  };

  const activeReel = openComments ? SEED_REELS.find((r) => r.id === openComments) : undefined;
  const activeMine = openComments ? reelComments[openComments] ?? [] : [];
  const activeSeeded = openComments ? SEED_REEL_COMMENTS[openComments] ?? [] : [];

  const post = () => {
    if (!openComments || !draft.trim()) return;
    addReelComment(openComments, draft);
    setDraft('');
  };

  if (SEED_REELS.length === 0) {
    return (
      <AppScreen>
        <EmptyState title={t('flow.reels.none') ?? t('reels.title')} />
      </AppScreen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      {toast ? (
        <Animated.View entering={enter(0)} style={styles.toast} pointerEvents="none">
          <AppText variant="bodySmall" color={Theme.colors.surface}>
            {toast}
          </AppText>
        </Animated.View>
      ) : null}

      <AppScreen padded={false}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <ScreenHeader
            title={t('reels.title')}
            left={
              <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
                <ArrowLeft size={22} color={Theme.colors.text} />
              </Pressable>
            }
          />

          {SEED_REELS.map((reel, index) => {
            const liked = likedReels.includes(reel.id);
            const saved = savedReels.includes(reel.id);
            const mine = reelComments[reel.id] ?? [];
            return (
              <Animated.View key={reel.id} entering={enter(index * 60)}>
                <View style={styles.reelCard}>
                  <Pressable
                    onPress={() => (reel.itemId ? orderThis(reel.id) : undefined)}
                    style={styles.reelImageWrap}
                    accessibilityLabel={t('flow.reels.orderThis')}
                  >
                    {reel.image ? (
                      <Image source={reel.image} style={styles.reelImage} />
                    ) : (
                      <View style={[styles.reelImage, styles.reelFallback]} />
                    )}
                  </Pressable>

                  {/* views */}
                  <View style={styles.playBadge} pointerEvents="none">
                    <Play size={14} color={Theme.colors.surface} fill={Theme.colors.surface} />
                    <AppText variant="caption" color={Theme.colors.surface}>
                      {count(reel.views)}
                    </AppText>
                  </View>

                  {/* caption + actions */}
                  <View style={styles.captionBlock}>
                    {reel.restaurantId ? (
                      <Pressable
                        onPress={() => router.push(`/restaurant/${reel.restaurantId}` as never)}
                        style={styles.kitchenRow}
                        accessibilityRole="button"
                        accessibilityLabel={t('flow.reels.viewKitchen')}
                      >
                        <Store size={13} color={Theme.colors.surface} />
                        <AppText variant="h3" color={Theme.colors.surface} numberOfLines={1} style={{ flex: 1 }}>
                          {label(reel.kitchenName, reel.kitchenNameGu)}
                        </AppText>
                      </Pressable>
                    ) : (
                      <AppText variant="h3" color={Theme.colors.surface} numberOfLines={2}>
                        {label(reel.kitchenName, reel.kitchenNameGu)}
                      </AppText>
                    )}
                    <AppText variant="caption" color={Theme.colors.surface} style={styles.dim} numberOfLines={2}>
                      {label(reel.caption, reel.captionGu)}
                    </AppText>

                    <View style={styles.actionRow}>
                      <Pressable
                        onPress={() => toggleReelLike(reel.id)}
                        style={styles.iconAction}
                        accessibilityRole="button"
                        accessibilityLabel={liked ? t('flow.reels.liked') : t('flow.reels.like')}
                      >
                        <Heart
                          size={17}
                          color={liked ? Theme.colors.primary : Theme.colors.surface}
                          fill={liked ? Theme.colors.primary : 'transparent'}
                        />
                        <AppText variant="caption" color={Theme.colors.surface}>
                          {count(reel.likes + (liked ? 1 : 0))}
                        </AppText>
                      </Pressable>

                      <Pressable
                        onPress={() => setOpenComments(reel.id)}
                        style={styles.iconAction}
                        accessibilityRole="button"
                        accessibilityLabel={t('flow.reels.comments')}
                      >
                        <MessageCircle size={17} color={Theme.colors.surface} />
                        <AppText variant="caption" color={Theme.colors.surface}>
                          {count(reel.commentsCount + mine.length)}
                        </AppText>
                      </Pressable>

                      <Pressable
                        onPress={() => void share(reel.id)}
                        style={styles.iconAction}
                        accessibilityRole="button"
                        accessibilityLabel={t('flow.reels.share')}
                      >
                        <Share2 size={17} color={Theme.colors.surface} />
                        <AppText variant="caption" color={Theme.colors.surface}>
                          {t('flow.reels.share')}
                        </AppText>
                      </Pressable>

                      <Pressable
                        onPress={() => toggleReelSave(reel.id)}
                        style={styles.iconAction}
                        accessibilityRole="button"
                        accessibilityLabel={saved ? t('flow.reels.saved') : t('flow.reels.save')}
                      >
                        <Bookmark
                          size={17}
                          color={saved ? Theme.colors.primary : Theme.colors.surface}
                          fill={saved ? Theme.colors.primary : 'transparent'}
                        />
                        <AppText variant="caption" color={Theme.colors.surface}>
                          {saved ? t('flow.reels.saved') : t('flow.reels.save')}
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
            );
          })}

          <AppText variant="caption" color={Theme.colors.textMuted} style={styles.feedNote}>
            {t('flow.reels.todayThali')}
          </AppText>
        </ScrollView>
      </AppScreen>

      {/* ------------------------------------------------ comments sheet */}
      {activeReel ? (
        <View style={styles.sheetWrap}>
          <Pressable style={styles.scrim} onPress={() => setOpenComments(null)} accessibilityLabel={t('common.cancel')} />
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <AppText variant="h3" style={{ flex: 1 }}>
                {t('flow.reels.commentsTitle')}
              </AppText>
              <Pressable onPress={() => setOpenComments(null)} hitSlop={10} accessibilityLabel={t('common.cancel')}>
                <X size={20} color={Theme.colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView style={styles.commentList} showsVerticalScrollIndicator={false}>
              {[...activeSeeded]
                .sort((a, b) => a.minsAgo - b.minsAgo)
                .map((comment) => (
                  <View key={comment.author} style={styles.comment}>
                    <View style={styles.avatar}>
                      <AppText variant="caption" color={Theme.colors.primary}>
                        {comment.author.slice(0, 1)}
                      </AppText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="label">{label(comment.author, comment.authorGu)}</AppText>
                      <AppText variant="bodySmall" color={Theme.colors.textSecondary}>
                        {label(comment.text, comment.textGu)}
                      </AppText>
                      <AppText variant="caption" color={Theme.colors.textMuted}>
                        {t('flow.reels.minsAgo', { n: comment.minsAgo })}
                      </AppText>
                    </View>
                  </View>
                ))}

              {activeMine.map((comment) => (
                <View key={comment.id} style={styles.comment}>
                  <View style={styles.avatar}>
                    <AppText variant="caption" color={Theme.colors.primary}>
                      {comment.author.slice(0, 1)}
                    </AppText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="label">{comment.author}</AppText>
                    <AppText variant="bodySmall" color={Theme.colors.textSecondary}>
                      {comment.text}
                    </AppText>
                    <AppText variant="caption" color={Theme.colors.textMuted}>
                      {t('flow.reels.justNow')}
                    </AppText>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.composer}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={post}
                placeholder={t('flow.reels.addComment')}
                placeholderTextColor={Theme.colors.textMuted}
                style={styles.input}
                accessibilityLabel={t('flow.reels.addComment')}
              />
              <Pressable
                onPress={post}
                disabled={!draft.trim()}
                style={[styles.sendButton, !draft.trim() && styles.sendDisabled]}
                accessibilityRole="button"
                accessibilityLabel={t('flow.reels.sendComment')}
              >
                <Send size={16} color={Theme.colors.surface} />
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Theme.layout.screenPaddingX,
    paddingBottom: Theme.spacing.huge,
    gap: Theme.spacing.lg,
  },
  reelCard: { height: 420, borderRadius: Theme.borderRadius.xl, overflow: 'hidden', justifyContent: 'flex-end' },
  reelImageWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  reelImage: { width: '100%', height: '100%' },
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
  kitchenRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dim: { opacity: 0.9 },
  actionRow: { flexDirection: 'row', gap: Theme.spacing.lg, marginTop: Theme.spacing.sm, flexWrap: 'wrap' },
  iconAction: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
  },
  feedNote: { textAlign: 'center', marginTop: Theme.spacing.sm },
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
  sheetWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: Theme.colors.overlay },
  sheet: {
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
    maxHeight: '70%',
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  commentList: { maxHeight: 300 },
  comment: { flexDirection: 'row', gap: Theme.spacing.md, paddingVertical: Theme.spacing.sm },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composer: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
    color: Theme.colors.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { backgroundColor: Theme.colors.disabled },
});
