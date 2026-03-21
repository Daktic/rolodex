import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsListScreen from '../screens/settings/SettingsListScreen';
import AboutScreen from '../screens/settings/AboutScreen';
import WalletScreen from "@/screens/settings/WalletScreen";
import NotificationScreen from "@/screens/settings/NotificationsScreen";
import AppearanceScreen from "@/screens/settings/AppearanceScreen";

export type SettingsStackParamList = {
    SettingsList: undefined;
    About: undefined;
    Wallet: undefined;
    Notifications: undefined;
    Appearance: undefined;
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
            <Stack.Screen
                name="Wallet"
                component={WalletScreen}
                options={{
                    headerShown: true,
                    title: 'Wallet'
                }}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationScreen}
                options={{
                    headerShown: true,
                    title: 'Notifications'
                }}
            />
            <Stack.Screen
                name="Appearance"
                component={AppearanceScreen}
                options={{
                    headerShown: true,
                    title: 'Appearance'
                }}
            />
        </Stack.Navigator>
    );
}
