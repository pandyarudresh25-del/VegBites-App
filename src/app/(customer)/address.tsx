import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import { ArrowLeft, MapPin, Home, Briefcase, Plus } from 'lucide-react-native';
import { useLanguage } from '../../context/LanguageContext';

const SAVED_ADDRESSES = [
  { id: '1', type: 'Home', address: 'B-402, Shivam Apartment, Vastrapur, Ahmedabad', isDefault: true },
  { id: '2', type: 'Office', address: '101, Titanium City Center, Satellite, Ahmedabad', isDefault: false },
];

export default function AddressScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>{t('address.title')}</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Map Placeholder for Current Location */}
        <Animated.View entering={FadeInDown.duration(400).springify()}>
           <TouchableOpacity activeOpacity={0.8} onPress={() => router.replace('/(customer)/home')} style={styles.mapContainer}>
             <Image source={require('../../../assets/images/gujarati_thali.jpg')} style={styles.mapImage} />
             <View style={styles.mapOverlay}>
               <View style={styles.currentLocationPill}>
                  <MapPin size={16} color={Theme.colors.primary} style={{marginRight: 6}} />
                  <AppText variant="h3" color={Theme.colors.primary}>{t('address.useCurrentLocation')}</AppText>
               </View>
             </View>
           </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>{t('address.savedAddresses')}</AppText>
          
          <View style={styles.addressList}>
             {SAVED_ADDRESSES.map((address, index) => (
                <TouchableOpacity key={address.id} activeOpacity={0.7} onPress={() => router.replace('/(customer)/home')} style={[styles.addressCard, address.isDefault && styles.defaultCard]}>
                   <View style={styles.addressIconContainer}>
                      {address.type === 'Home' ? <Home size={20} color={Theme.colors.primary} /> : <Briefcase size={20} color={Theme.colors.primary} />}
                   </View>
                   <View style={styles.addressInfo}>
                      <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                        <AppText variant="h3">{address.type === 'Home' ? t('address.home') : t('address.office')}</AppText>
                        {address.isDefault && (
                          <View style={styles.defaultBadge}>
                             <AppText variant="caption" color="#fff" style={{fontSize: 10, fontWeight: 'bold'}}>{t('address.default')}</AppText>
                          </View>
                        )}
                      </View>
                      <AppText variant="bodySmall" color={Theme.colors.textSecondary}>{address.address}</AppText>
                   </View>
                </TouchableOpacity>
             ))}
          </View>
        </Animated.View>

      </ScrollView>

      <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.footer}>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
           <Plus size={20} color="#fff" style={{marginRight: 8}} />
           <AppText variant="button">{t('address.addNewAddress')}</AppText>
        </TouchableOpacity>
      </Animated.View>
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
  },
  mapContainer: {
    height: 200,
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: Theme.spacing.xl,
    position: 'relative',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: Theme.spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  currentLocationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.md,
  },
  addressList: {
    gap: Theme.spacing.md,
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  defaultCard: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.surfaceHighlight, // Light peach
  },
  addressIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  addressInfo: {
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: Theme.spacing.sm,
  },
  footer: {
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.text, // Using dark color for high contrast CTA
    height: 56,
    borderRadius: Theme.borderRadius.pill,
  }
});
