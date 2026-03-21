import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsListScreen from '../screens/SettingsListScreen';

export type SettingsStackParamList = {
    SettingsList: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="SettingsList"
                component={SettingsListScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}
