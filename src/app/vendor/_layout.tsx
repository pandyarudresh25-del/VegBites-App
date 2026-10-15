import { Tabs } from 'expo-router';
import { Theme } from '../../theme';
import { CircleDollarSign, LayoutDashboard, FileText, MenuSquare, UserRound } from 'lucide-react-native';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Vendor app shell. Routed under `/vendor/*` (a real URL segment, not a route
 * group) so it cannot collide with the customer app's `/orders` or `/profile`.
 */
export default function VendorLayout() {
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
        options={{ title: t('screens.vendor.tabDashboard'), tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: t('screens.vendor.tabOrders'), tabBarIcon: ({ color }) => <FileText size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="menu"
        options={{ title: t('screens.vendor.tabMenu'), tabBarIcon: ({ color }) => <MenuSquare size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="earnings"
        options={{ title: t('screens.vendor.tabEarnings'), tabBarIcon: ({ color }) => <CircleDollarSign size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('screens.vendor.tabProfile'), tabBarIcon: ({ color }) => <UserRound size={24} color={color} /> }}
      />
      <Tabs.Screen name="order/[id]" options={{ href: null }} />
      <Tabs.Screen name="menu/add" options={{ href: null }} />
      <Tabs.Screen name="menu/edit" options={{ href: null }} />
      <Tabs.Screen name="insights" options={{ href: null }} />
    </Tabs>
  );
}
