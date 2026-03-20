import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import ShareScreen from '../screens/ShareScreen';
import ConnectionsListScreen from '../screens/ConnectionsListScreen';

export type RootStackParamList = {
  Profile: undefined;
  Share: { maskId: string };
  ConnectionsList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ConnectionsList">
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
        <Stack.Screen
          name="ConnectionsList"
          component={ConnectionsListScreen}
          options={{
            headerShown: true,
            title: 'Connections'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
