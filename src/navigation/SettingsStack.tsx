import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsListScreen from '../screens/settings/SettingsListScreen';
import AboutScreen from '../screens/settings/AboutScreen';

export type SettingsStackParamList = {
    SettingsList: undefined;
    About: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="SettingsList"
                component={SettingsListScreen}
                options={{ headerShown: false, title: 'Settings' }}
            />
            <Stack.Screen
                name="About"
                component={AboutScreen}
                options={{
                    headerShown: true,
                    title: 'About'
                }}
            />
        </Stack.Navigator>
    );
}
