import { Tabs } from 'expo-router';
import { Theme } from '../../theme';
import { Map, Truck, User } from 'lucide-react-native';

export default function DeliveryLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: '#3B82F6', // Blue for delivery theme
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
          title: 'Deliveries',
          tabBarIcon: ({ color }) => <Truck size={24} color={color} />
        }} 
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: 'Navigation',
          tabBarIcon: ({ color }) => <Map size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      <Tabs.Screen name="delivery/[id]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
