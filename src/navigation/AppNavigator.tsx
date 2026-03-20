import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import ShareScreen from '../screens/ShareScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  Share: { maskId: string };
  ConnectionDetail: { connectionId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
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
        {/* Connection detail screen will be added here later */}
        {/* <Stack.Screen
          name="ConnectionDetail"
          component={ConnectionDetailScreen}
          options={{
            headerShown: true,
            title: 'Connection',
          }}
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
