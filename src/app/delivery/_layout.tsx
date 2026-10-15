import { Tabs } from 'expo-router';
import { Theme } from '../../theme';
import { Bike, CircleDollarSign, UserRound } from 'lucide-react-native';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Delivery partner app shell. Routed under `/delivery/*` so it cannot collide
 * with the customer app's `/profile` or the vendor app's `/dashboard`.
 */
export default function DeliveryLayout() {
  const { t } = useLanguage();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: Theme.colors.surface,
          borderTopColor: Theme.colors.border,
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: t('screens.courier.tabDashboard'), tabBarIcon: ({ color }) => <Bike size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="earnings"
        options={{ title: t('screens.courier.tabEarnings'), tabBarIcon: ({ color }) => <CircleDollarSign size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('screens.courier.tabProfile'), tabBarIcon: ({ color }) => <UserRound size={24} color={color} /> }}
      />
      <Tabs.Screen name="delivery/[id]" options={{ href: null }} />
    </Tabs>
  );
}
