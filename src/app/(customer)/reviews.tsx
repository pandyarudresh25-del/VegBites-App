import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Package, Star, Utensils } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, ScreenHeader, EmptyState } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';

const RATING_LABELS: { value: number; key: string }[] = [
  { value: 5, key: 'excellent' },
  { value: 4, key: 'good' },
  { value: 3, key: 'okay' },
  { value: 2, key: 'poor' },
  { value: 1, key: 'bad' },
];

/**
 * Reviews.
 *
 * Reachable from Orders / tracking with `?orderId=…`. Submitting writes to the
 * store and flips the order's `reviewed` flag so the Orders screen stops
 * prompting. Past reviews render below.
 */
export default function ReviewsScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { t, language, date } = useLanguage();
  const { orders, reviews, submitReview } = useAppStore();

  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);

  const order = useMemo(() => (orderId ? orders.find((o) => o.id === orderId) : undefined), [orders, orderId]);
  const canReview = order && !order.reviewed && order.status === 'delivered';

  const handleSubmit = () => {
    if (!order) return;
    submitReview({
      orderId: order.id,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurantName,
      restaurantNameGu: order.restaurantNameGu,
      rating,
      text: text.trim(),
      image: order.kitchenImage,
    });
    setSubmitted(true);
    setText('');
  };

  return (
    <AppScrollScreen contentStyle={{ gap: Theme.spacing.lg }}>
      <ScreenHeader
        title={t('flow.reviews.title')}
        subtitle={t('flow.reviews.pending')}
        left={
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
            <ArrowLeft size={22} color={Theme.colors.text} />
          </Pressable>
        }
      />

      {/* ---- review composer ---- */}
      {canReview && !submitted ? (
        <Animated.View entering={FadeInDown.duration(Theme.motion.base)} style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.iconBubble}>
              <Utensils size={17} color={Theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="h3">{t('flow.reviews.rateKitchen')}</AppText>
              <AppText variant="caption">
                {label(order.restaurantName, order.restaurantNameGu)} · #{order.id}
              </AppText>
            </View>
          </View>

          {/* stars */}
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((value) => {
              const active = value <= rating;
              return (
                <Pressable
                  key={value}
                  onPress={() => setRating(value)}
                  hitSlop={6}
                  accessibilityRole="radio"
                  accessibilityLabel={`${value} ${t('common.ratings')}`}
                  accessibilityState={{ selected: rating === value }}
                >
                  <Star
                    size={32}
                    color={active ? Theme.colors.primary : Theme.colors.border}
                    fill={active ? Theme.colors.primary : 'transparent'}
                  />
                </Pressable>
              );
            })}
          </View>
          <AppText variant="h3" align="center" color={Theme.colors.primary}>
            {t(`flow.reviews.${RATING_LABELS.find((r) => r.value === rating)?.key ?? 'good'}`)}
          </AppText>

          <AppText variant="label" style={{ marginTop: Theme.spacing.sm }}>
            {t('flow.reviews.yourReview')}
          </AppText>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('flow.reviews.placeholder')}
            placeholderTextColor={Theme.colors.textMuted}
            multiline
            style={styles.textArea}
          />

          <View style={{ marginTop: Theme.spacing.md }}>
            <AppButton title={t('flow.reviews.submit')} onPress={handleSubmit} />
          </View>
        </Animated.View>
      ) : null}

      {submitted ? (
        <Animated.View entering={FadeInDown.duration(Theme.motion.fast)} style={styles.successCard}>
          <AppText variant="h3" color={Theme.colors.success}>
            {t('flow.reviews.submitted')}
          </AppText>
          <AppText variant="bodySmall">{t('flow.reviews.noneHint')}</AppText>
        </Animated.View>
      ) : null}

      {/* ---- my reviews ---- */}
      <AppText variant="h2">
        {t('flow.reviews.title')} · {reviews.length}
      </AppText>

      {reviews.length === 0 ? (
        <EmptyState
          icon={<Star size={26} color={Theme.colors.primary} />}
          title={t('flow.reviews.none')}
          body={t('flow.reviews.noneHint')}
          action={
            <AppButton
              title={t('nav.orders')}
              variant="outline"
              onPress={() => router.push('/orders')}
            />
          }
        />
      ) : (
        <View style={{ gap: Theme.spacing.md }}>
          {reviews.map((review, index) => (
            <Animated.View key={review.id} entering={FadeInDown.delay(index * 40).duration(Theme.motion.fast)}>
              <View style={styles.reviewCard}>
                <View style={styles.cardHead}>
                  <View style={styles.iconBubble}>
                    <Package size={16} color={Theme.colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="h3">
                      {label(review.restaurantName, review.restaurantNameGu)}
                    </AppText>
                    <AppText variant="caption">
                      {date(review.createdAt)} · {t('flow.reviews.kitchen')} #{review.orderId}
                    </AppText>
                  </View>
                  <View style={styles.ratingPill}>
                    <Star size={11} color={Theme.colors.surface} fill={Theme.colors.surface} />
                    <AppText variant="caption" color={Theme.colors.surface}>
                      {review.rating}
                    </AppText>
                  </View>
                </View>
                {review.text ? (
                  <AppText variant="bodySmall" style={{ marginTop: Theme.spacing.md }}>
                    {review.text}
                  </AppText>
                ) : null}
              </View>
            </Animated.View>
          ))}
        </View>
      )}

      {/* prompt when arriving with no reviewable order */}
      {!canReview && !submitted && orders.length > 0 ? (
        <Pressable onPress={() => router.push('/orders')} style={styles.hintRow}>
          <AppText variant="bodySmall" color={Theme.colors.primary}>
            {t('flow.orders.rateOrder')} · {t('nav.orders')}
          </AppText>
        </Pressable>
      ) : null}
    </AppScrollScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    gap: Theme.spacing.sm,
    ...Theme.shadows.soft,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
    marginVertical: Theme.spacing.md,
  },
  textArea: {
    minHeight: 92,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surfaceSecondary,
    padding: Theme.spacing.md,
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.text,
    textAlignVertical: 'top',
    marginTop: 4,
  },
  successCard: {
    backgroundColor: Theme.colors.successSoft,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    gap: 4,
  },
  reviewCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    ...Theme.shadows.soft,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Theme.colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  hintRow: { alignItems: 'center', paddingVertical: Theme.spacing.md },
});
