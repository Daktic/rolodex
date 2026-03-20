import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import ShareScreen from '../screens/ShareScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
}
