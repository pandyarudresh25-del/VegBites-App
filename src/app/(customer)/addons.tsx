import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import { ArrowLeft, Check } from 'lucide-react-native';

const ADDONS = [
  { id: '1', name: 'Buttermilk', price: '₹20', image: require('../../../assets/images/gujarati_thali.jpg') },
  { id: '2', name: 'Salad', price: '₹25', image: require('../../../assets/images/gujarati_thali.jpg') },
  { id: '3', name: 'Papad', price: '₹15', image: require('../../../assets/images/gujarati_thali.jpg') },
  { id: '4', name: 'Sweet', price: '₹30', image: require('../../../assets/images/gujarati_thali.jpg') },
];

export default function AddonsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleAddon = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const total = selected.reduce((sum, id) => {
    const item = ADDONS.find(a => a.id === id);
    return sum + (item ? parseInt(item.price.replace('₹', '')) : 0);
  }, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Add-ons</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.list}>
          {ADDONS.map((item, index) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(100 + index * 50).springify()}>
              <TouchableOpacity 
                style={styles.addonRow}
                activeOpacity={0.7}
                onPress={() => toggleAddon(item.id)}
              >
                <View style={[styles.checkbox, selected.includes(item.id) && styles.checkboxSelected]}>
                  {selected.includes(item.id) && <Check size={14} color="#fff" />}
                </View>
                
                <Image source={{ uri: item.image }} style={styles.image} />
                
                <AppText variant="h3" style={styles.name}>{item.name}</AppText>
                
                <View style={styles.pricePill}>
                  <AppText variant="bodySmall" color={Theme.colors.textMuted}>{item.price}</AppText>
                </View>
              </TouchableOpacity>
              <View style={styles.divider} />
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.footer}>
        <TouchableOpacity 
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(customer)/cart')}
        >
          <AppText variant="button">Add {total > 0 ? `₹${total}` : ''}</AppText>
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
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  list: {
    gap: Theme.spacing.sm,
  },
  addonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    marginRight: Theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Theme.spacing.md,
  },
  name: {
    flex: 1,
  },
  pricePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginLeft: 40, // align with image
  },
  footer: {
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    height: 56,
    borderRadius: Theme.borderRadius.pill,
    paddingHorizontal: Theme.spacing.xl,
  }
});
