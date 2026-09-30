import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../../components/AppText';
import { AppButton } from '../../../components/AppButton';
import { Theme } from '../../../theme';
import { ArrowLeft, Star, Heart } from 'lucide-react-native';

export default function FoodDetailScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton}>
          <Heart size={24} color={Theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <Image 
            source={require('../../../../assets/images/gujarati_thali.jpg')} 
            style={styles.foodImage}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <View style={{flex: 1}}>
              <View style={styles.vegTag}>
                <View style={styles.vegIconInner} />
              </View>
              <AppText variant="h1" style={styles.title}>Gujarati Thali</AppText>
            </View>
            <AppText variant="h1" color={Theme.colors.primary}>₹180</AppText>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Star size={14} color="#fff" fill="#fff" />
              <AppText variant="button" color="#fff">4.8</AppText>
            </View>
            <AppText variant="caption" color={Theme.colors.textSecondary}>1.2k+ Ratings</AppText>
          </View>

          <AppText variant="body" color={Theme.colors.textSecondary} style={styles.description}>
            Authentic Gujarati Thali featuring 4 Rotli, 2 Sabji (Paneer & Seasonal Veg), Dal, Jeera Rice, Sweet (Gulab Jamun), Farsan (Dhokla), and Roasted Papad. Prepared fresh daily with pure groundnut oil.
          </AppText>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.footer}>
        <View style={styles.qtyControls}>
          <TouchableOpacity style={styles.qtyBtn}>
            <AppText variant="h2" color={Theme.colors.text}>-</AppText>
          </TouchableOpacity>
          <AppText variant="h2">1</AppText>
          <TouchableOpacity style={styles.qtyBtn}>
            <AppText variant="h2" color={Theme.colors.text}>+</AppText>
          </TouchableOpacity>
        </View>
        <AppButton 
          title="Add Item - ₹180" 
          onPress={() => router.back()} 
          style={styles.addButton} 
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    paddingBottom: 100,
  },
  foodImage: {
    width: '100%',
    height: 350,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: Theme.spacing.xl,
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  vegTag: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 8,
  },
  vegIconInner: {
    width: 10,
    height: 10,
    backgroundColor: Theme.colors.success,
    borderRadius: 5,
  },
  title: {
    fontSize: 24,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Theme.spacing.lg,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  description: {
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    alignItems: 'center',
    gap: Theme.spacing.lg,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.pill,
    height: 56,
    width: 120,
    paddingHorizontal: Theme.spacing.sm,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flex: 1,
    height: 56,
  }
});
