import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../../components/AppText';
import { Theme } from '../../../theme';
import { ArrowLeft, Star, Clock } from 'lucide-react-native';

const VENDORS = [
  { id: '1', name: 'Shree Krishna Tiffin', rating: '4.8 (1200+)', time: '30 Mins', image: require('../../../../assets/images/gujarati_thali.jpg') },
  { id: '2', name: 'Maa ni Rasoi', rating: '4.7 (800+)', time: '45 Mins', image: require('../../../../assets/images/gujarati_thali.jpg') },
  { id: '3', name: 'Home Style Tiffin', rating: '4.9 (2000+)', time: '30 Mins', image: require('../../../../assets/images/gujarati_thali.jpg') },
];

export default function TopVendorsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Top Tiffin Vendors</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {VENDORS.map((vendor, index) => (
          <Animated.View key={vendor.id} entering={FadeInDown.delay(100 + index * 100).springify()}>
            <TouchableOpacity 
              style={styles.vendorCard} 
              activeOpacity={0.7}
              onPress={() => router.push(`/tiffins/${vendor.id}/thali` as any)}
            >
              <Image source={{ uri: vendor.image }} style={styles.vendorImage} />
              <View style={styles.vendorInfo}>
                <AppText variant="h3" style={styles.vendorName}>{vendor.name}</AppText>
                
                <View style={styles.metaRow}>
                  <View style={styles.ratingBadge}>
                    <Star size={12} color="#fff" fill="#fff" />
                    <AppText variant="caption" color="#fff" style={styles.ratingText}>{vendor.rating.split(' ')[0]}</AppText>
                  </View>
                  <AppText variant="caption" color={Theme.colors.textMuted}>{vendor.rating.split(' ')[1]}</AppText>
                </View>

                <View style={styles.metaRow}>
                  <Clock size={14} color={Theme.colors.textMuted} />
                  <AppText variant="caption" color={Theme.colors.textMuted}>{vendor.time}</AppText>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    gap: Theme.spacing.lg,
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  vendorImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: Theme.spacing.lg,
  },
  vendorInfo: {
    flex: 1,
    gap: 4,
  },
  vendorName: {
    fontSize: 18,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  ratingText: {
    fontWeight: '800',
  },
});
