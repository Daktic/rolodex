import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import ShareScreen from '../screens/ShareScreen';

export type ProfileStackParamList = {
  Profile: undefined;
  Share: { maskId: string };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
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
