import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsListScreen from '../screens/settings/SettingsListScreen';
import AboutScreen from '../screens/settings/AboutScreen';
import WalletScreen from "@/screens/settings/WalletScreen";

export type SettingsStackParamList = {
    SettingsList: undefined;
    About: undefined;
    Wallet: undefined;
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
        </Stack.Navigator>
    );
}
