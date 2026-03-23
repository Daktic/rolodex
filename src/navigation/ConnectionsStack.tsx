import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConnectionsListScreen from '../screens/ConnectionsListScreen';
import ConnectionDetailScreen from '../screens/ConnectionDetailScreen';
import ConnectViaScreen from "@/screens/ConnectViaScreen";

export type ConnectionsStackParamList = {
  ConnectionsList: undefined;
  ConnectionDetail: { connectionId: string };
  ConnectViaScreen: undefined;
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
     <Stack.Screen
         name="ConnectViaScreen"
         component={ConnectViaScreen}
         options={{
           headerShown: true,
           title: 'Connect Via',
         }}
         />
    </Stack.Navigator>
  );
}
