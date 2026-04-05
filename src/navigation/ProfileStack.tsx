import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import ShareScreen from '../screens/ShareScreen';
import { useTheme } from '@/hooks/useTheme';

export type ProfileStackParamList = {
  Profile: undefined;
  Share: { maskId: number };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: theme.colors.surface },
      headerTintColor: theme.colors.accent,
      headerTitleStyle: { color: theme.colors.text.primary },
    }}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Share"
        component={ShareScreen}
        options={{
          headerShown: true,
          title: 'Share Contact',
          presentation: 'card'
        }}
      />
    </Stack.Navigator>
  );
}
