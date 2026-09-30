import { Tabs } from 'expo-router';
import { Theme } from '../../theme';
import { Home, FileText, ShoppingBag, User, PlayCircle } from 'lucide-react-native';

const hiddenTab = {
  href: null,
};

export default function CustomerLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: Theme.colors.primary,
      tabBarInactiveTintColor: Theme.colors.textMuted,
      tabBarStyle: {
        backgroundColor: Theme.colors.surface,
        borderTopColor: Theme.colors.border,
        height: 60,
        paddingBottom: 8,
      }
    }}>
      <Tabs.Screen 
        name="home" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="reels" 
        options={{
          title: 'Reels',
          tabBarIcon: ({ color }) => <PlayCircle size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="orders" 
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="cart" 
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => <ShoppingBag size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />
        }} 
      />

      <Tabs.Screen name="restaurants" options={hiddenTab} />
      <Tabs.Screen name="restaurant/[id]" options={{ ...hiddenTab, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="restaurant/item" options={{ ...hiddenTab, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="addons" options={{ ...hiddenTab, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="address" options={hiddenTab} />
      <Tabs.Screen name="plans" options={hiddenTab} />
      <Tabs.Screen name="reviews" options={hiddenTab} />
      <Tabs.Screen name="wallet" options={hiddenTab} />
      <Tabs.Screen name="loyalty" options={hiddenTab} />
      <Tabs.Screen name="settings" options={hiddenTab} />
      <Tabs.Screen name="subscription" options={hiddenTab} />
      <Tabs.Screen name="support" options={hiddenTab} />
      <Tabs.Screen name="notifications" options={hiddenTab} />
      <Tabs.Screen name="checkout" options={{ ...hiddenTab, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="payments" options={{ ...hiddenTab, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="tracking/[id]" options={{ ...hiddenTab, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="order-confirmation" options={{ ...hiddenTab, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="tiffins/index" options={hiddenTab} />
      <Tabs.Screen name="tiffins/vendors" options={hiddenTab} />
      <Tabs.Screen name="tiffins/[id]/index" options={{ ...hiddenTab, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="tiffins/[id]/plans" options={{ ...hiddenTab, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="tiffins/[id]/thali" options={{ ...hiddenTab, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
