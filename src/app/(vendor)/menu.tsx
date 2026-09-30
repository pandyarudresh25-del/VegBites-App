import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';

const MENU_ITEMS = [
  { id: '1', name: 'Gujarati Thali', price: '₹120', image: require('../../../assets/images/gujarati_thali.jpg'), active: true },
  { id: '2', name: 'Punjabi Thali', price: '₹150', image: require('../../../assets/images/gujarati_thali.jpg'), active: true },
  { id: '3', name: 'Extra Rotli', price: '₹10', image: require('../../../assets/images/gujarati_thali.jpg'), active: true },
];

export default function MenuManagementScreen() {
  const router = useRouter();
  const [items, setItems] = useState(MENU_ITEMS);

  const toggleItem = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, active: !item.active } : item));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AppText variant="h3" style={styles.headerTitle}>Menu Management</AppText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.list}>
          {items.map((item, index) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(100 + index * 100).springify()}>
              <View style={styles.menuItemRow}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <AppText variant="h3">{item.name}</AppText>
                  <AppText variant="caption" color={Theme.colors.textMuted} style={styles.itemPrice}>{item.price}</AppText>
                </View>
                <Switch
                  trackColor={{ false: Theme.colors.border, true: Theme.colors.success }}
                  thumbColor="#fff"
                  ios_backgroundColor={Theme.colors.border}
                  onValueChange={() => toggleItem(item.id)}
                  value={item.active}
                />
              </View>
              {index < items.length - 1 && <View style={styles.divider} />}
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
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
  },
  content: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  list: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: Theme.spacing.md,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.sm,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Theme.spacing.md,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  itemPrice: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginLeft: 64, // Aligns with text
  }
});
