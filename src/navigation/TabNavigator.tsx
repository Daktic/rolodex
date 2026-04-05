import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IdCard, Users, Settings, Tags } from "lucide-react-native";
import ProfileStack from './ProfileStack';
import ConnectionsStack from './ConnectionsStack';
import SettingsStack from './SettingsStack';
import SemanticsStack from "@/navigation/SemanticsStack";
import { useTheme } from '@/hooks/useTheme';

export type TabParamList = {
  ProfileTab: undefined;
  ConnectionsTab: undefined;
  SemanticsTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      initialRouteName="ProfileTab"
      screenOptions={{
        tabBarActiveTintColor: theme.colors.tabBar.active,
        tabBarInactiveTintColor: theme.colors.tabBar.inactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.tabBar.border,
          height: 80,
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
            <IdCard color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ConnectionsTab"
        component={ConnectionsStack}
        options={{
          tabBarLabel: 'Connections',
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={size} />
          ),
        }}
      />
        <Tab.Screen
            name="SemanticsTab"
            component={SemanticsStack}
            options={{
                tabBarLabel: 'Semantics',
                tabBarIcon: ({ color, size }) => (
                    <Tags color={color} size={size} />
                ),
            }}
        />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
