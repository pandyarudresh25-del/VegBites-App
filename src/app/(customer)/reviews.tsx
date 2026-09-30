import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import { ArrowLeft, Star, ThumbsUp } from 'lucide-react-native';
import { useLanguage } from '../../context/LanguageContext';

const REVIEWS = [
  { id: '1', name: 'Rahul Sharma', rating: 5, date: '2 days ago', text: 'Amazing Gujarati thali. Feels just like home-cooked food. Highly recommended!', helpful: 12 },
  { id: '2', name: 'Priya Desai', rating: 4, date: '1 week ago', text: 'Food was delicious and delivered hot. The sweetness in dal was perfect.', helpful: 5 },
  { id: '3', name: 'Amit Patel', rating: 5, date: '2 weeks ago', text: 'Best tiffin service in the area. Very punctual and hygienic.', helpful: 24 },
];

export default function ReviewsScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Reviews</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Summary Card */}
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.summaryCard}>
          <View style={styles.ratingLarge}>
             <AppText variant="h1" style={{fontSize: 48, marginBottom: -8}}>4.8</AppText>
             <View style={styles.starsRow}>
               {[1,2,3,4,5].map(i => <Star key={i} size={16} color={Theme.colors.success} fill={Theme.colors.success} />)}
             </View>
             <AppText variant="bodySmall" color={Theme.colors.textSecondary}>Based on 1.2k+ reviews</AppText>
          </View>
          <View style={styles.ratingBars}>
             {[
               { stars: 5, pct: '80%' },
               { stars: 4, pct: '15%' },
               { stars: 3, pct: '3%' },
               { stars: 2, pct: '1%' },
               { stars: 1, pct: '1%' },
             ].map((row, i) => (
               <View key={i} style={styles.barRow}>
                 <AppText variant="caption">{row.stars}</AppText>
                 <View style={styles.barTrack}>
                   <View style={[styles.barFill, { width: row.pct as any }]} />
                 </View>
               </View>
             ))}
          </View>
        </Animated.View>

        {/* Reviews List */}
        <View style={styles.list}>
          {REVIEWS.map((review, index) => (
            <Animated.View key={review.id} entering={FadeInDown.delay(100 + index * 100).springify()}>
              <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.avatarPlaceholder}>
                    <AppText variant="h3" color="#fff">{review.name.charAt(0)}</AppText>
                  </View>
                  <View style={{flex: 1, marginLeft: 12}}>
                    <AppText variant="h3">{review.name}</AppText>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 2}}>
                      <View style={styles.ratingPill}>
                        <AppText variant="caption" color="#fff" style={{fontWeight: 'bold', marginRight: 4}}>{review.rating}</AppText>
                        <Star size={10} color="#fff" fill="#fff" />
                      </View>
                      <AppText variant="caption" color={Theme.colors.textMuted} style={{marginLeft: 8}}>{review.date}</AppText>
                    </View>
                  </View>
                </View>
                
                <AppText variant="body" color={Theme.colors.textSecondary} style={styles.reviewText}>
                  {review.text}
                </AppText>
                
                <TouchableOpacity style={styles.helpfulBtn} activeOpacity={0.7}>
                  <ThumbsUp size={16} color={Theme.colors.textMuted} />
                  <AppText variant="caption" color={Theme.colors.textMuted} style={{marginLeft: 6}}>Helpful ({review.helpful})</AppText>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
  },
  content: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.xl,
  },
  ratingLarge: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: Theme.colors.border,
    paddingRight: Theme.spacing.lg,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 8,
  },
  ratingBars: {
    flex: 1.2,
    paddingLeft: Theme.spacing.lg,
    gap: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Theme.colors.success,
  },
  list: {
    gap: Theme.spacing.lg,
  },
  reviewCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reviewText: {
    lineHeight: 22,
    marginBottom: Theme.spacing.md,
  },
  helpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
