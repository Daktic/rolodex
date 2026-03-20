import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConnectionsListScreen from '../screens/ConnectionsListScreen';
import ConnectionDetailScreen from '../screens/ConnectionDetailScreen';

export type ConnectionsStackParamList = {
  ConnectionsList: undefined;
  ConnectionDetail: { connectionId: string };
};

const Stack = createNativeStackNavigator<ConnectionsStackParamList>();

export default function ConnectionsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ConnectionsList"
        component={ConnectionsListScreen}
        options={{ headerShown: false, title: 'All Connections' }}
      />
      <Stack.Screen
        name="ConnectionDetail"
        component={ConnectionDetailScreen}
        options={{
          headerShown: true,
          title: 'Connection',
        }}
      />
    </Stack.Navigator>
  );
}
