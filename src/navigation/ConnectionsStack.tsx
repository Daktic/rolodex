import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConnectionsListScreen from '../screens/ConnectionsListScreen';
import ConnectionDetailScreen from '../screens/ConnectionDetailScreen';
import { useTheme } from '@/hooks/useTheme';

export type ConnectionsStackParamList = {
  ConnectionsList: undefined;
  ConnectionDetail: { connectionId: number };
  ConnectViaScreen: undefined;
};

const Stack = createNativeStackNavigator<ConnectionsStackParamList>();

export default function ConnectionsStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: theme.colors.surface },
      headerTintColor: theme.colors.accent,
      headerTitleStyle: { color: theme.colors.text.primary },
    }}>
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
