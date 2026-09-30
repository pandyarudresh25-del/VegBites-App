import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import { Bike, Store, UserRound } from 'lucide-react-native';

const ROLES = [
  { id: 'customer', label: 'Customer', icon: UserRound },
  { id: 'vendor', label: 'Vendor', icon: Store },
  { id: 'delivery', label: 'Delivery Boy', icon: Bike },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const handleRoleSelect = (roleId: string) => {
    router.push({
      pathname: '/(auth)/login',
      params: { role: roleId }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
          <AppText variant="h1" style={styles.title} align="center">
            Choose Your Role
          </AppText>
          <AppText variant="body" color={Theme.colors.textSecondary} align="center" style={styles.subtitle}>
            Select how you want to continue
          </AppText>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {ROLES.map((role, index) => {
            const Icon = role.icon;
            return (
              <Animated.View key={role.id} entering={FadeInDown.delay(100 + index * 100).springify()}>
              <TouchableOpacity 
                style={styles.roleCard}
                activeOpacity={0.8}
                onPress={() => handleRoleSelect(role.id)}
              >
                <View style={styles.iconContainer}>
                  <Icon size={24} color={Theme.colors.primary} />
                </View>
                <AppText variant="h3">{role.label}</AppText>
              </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.xxl * 2,
  },
  header: {
    marginBottom: Theme.spacing.xxl,
    alignItems: 'center',
  },
  title: {
    marginBottom: Theme.spacing.sm,
    fontSize: 24,
  },
  subtitle: {
    marginBottom: Theme.spacing.md,
  },
  list: {
    gap: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  roleCard: {
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.lg,
  },
});
