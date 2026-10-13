import { Tabs } from 'expo-router';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { Home, UtensilsCrossed, Store, ShoppingBag, User } from 'lucide-react-native';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Routes reachable by navigation but not shown as tabs. */
const hidden = { href: null } as const;

/** Small count badge on the Cart tab — the store now drives this. */
function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText} numberOfLines={1}>
        {count > 9 ? '9+' : count}
      </Text>
    </View>
  );
}

export default function CustomerLayout() {
  const { t } = useLanguage();
  const { cartCount } = useAppStore();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: {
          backgroundColor: Theme.colors.surface,
          borderTopColor: Theme.colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Theme.layout.tabBarHeight + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
          ...Theme.shadows.tabBar,
        },
      }}
    >
      {/* --- primary journey tabs (the two core services are now first-class) --- */}
      <Tabs.Screen
        name="home"
        options={{
          title: t('flow.tabs.home'),
          tabBarIcon: ({ color, focused }) => <Home size={22} color={color} strokeWidth={focused ? 2.6 : 2} />,
        }}
      />
      <Tabs.Screen
        name="tiffins/index"
        options={{
          title: t('flow.tabs.tiffin'),
          tabBarIcon: ({ color, focused }) => (
            <UtensilsCrossed size={22} color={color} strokeWidth={focused ? 2.6 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="restaurants"
        options={{
          title: t('flow.tabs.restaurants'),
          tabBarIcon: ({ color, focused }) => <Store size={22} color={color} strokeWidth={focused ? 2.6 : 2} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('flow.tabs.cart'),
          tabBarIcon: ({ color, focused }) => (
            <View>
              <ShoppingBag size={22} color={color} strokeWidth={focused ? 2.6 : 2} />
              <CartBadge count={cartCount} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('flow.tabs.profile'),
          tabBarIcon: ({ color, focused }) => <User size={22} color={color} strokeWidth={focused ? 2.6 : 2} />,
        }}
      />

      {/* --- reachable routes, hidden from the tab bar --- */}
      <Tabs.Screen name="orders" options={hidden} />
      <Tabs.Screen name="reels" options={hidden} />
      <Tabs.Screen name="tiffins/vendors" options={hidden} />
      <Tabs.Screen name="tiffins/[id]/index" options={hidden} />
      <Tabs.Screen name="tiffins/[id]/plans" options={hidden} />
      <Tabs.Screen name="tiffins/[id]/thali" options={hidden} />
      <Tabs.Screen name="restaurant/[id]" options={hidden} />
      <Tabs.Screen name="restaurant/item" options={hidden} />
      <Tabs.Screen name="addons" options={hidden} />
      <Tabs.Screen name="address" options={hidden} />
      <Tabs.Screen name="plans" options={hidden} />
      <Tabs.Screen name="reviews" options={hidden} />
      <Tabs.Screen name="wallet" options={hidden} />
      <Tabs.Screen name="loyalty" options={hidden} />
      <Tabs.Screen name="settings" options={hidden} />
      <Tabs.Screen name="subscription" options={hidden} />
      <Tabs.Screen name="support" options={hidden} />
      <Tabs.Screen name="chat" options={hidden} />
      <Tabs.Screen name="notifications" options={hidden} />
      <Tabs.Screen name="checkout" options={hidden} />
      <Tabs.Screen name="payments" options={hidden} />
      <Tabs.Screen name="tracking/[id]" options={hidden} />
      <Tabs.Screen name="order-confirmation" options={hidden} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 11,
    fontWeight: Platform.OS === 'ios' ? '600' : '700',
    letterSpacing: 0.1,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -9,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.surface,
  },
  badgeText: {
    color: Theme.colors.surface,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
  },
});
