import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ProfileStack from './ProfileStack';
import ConnectionsStack from './ConnectionsStack';
import SettingsStack from './SettingsStack';

export type TabParamList = {
  ProfileTab: undefined;
  ConnectionsTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="ProfileTab"
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ConnectionsTab"
        component={ConnectionsStack}
        options={{
          tabBarLabel: 'Connections',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
