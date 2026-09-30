import { Tabs } from 'expo-router';
import { Theme } from '../../theme';
import { CircleDollarSign, LayoutDashboard, FileText, MenuSquare, UserRound } from 'lucide-react-native';

export default function VendorLayout() {
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
        name="dashboard" 
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="menu" 
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <MenuSquare size={24} color={color} />
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
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color }) => <CircleDollarSign size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserRound size={24} color={color} />,
        }}
      />
      <Tabs.Screen name="order/[id]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="menu/add" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="menu/edit" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
