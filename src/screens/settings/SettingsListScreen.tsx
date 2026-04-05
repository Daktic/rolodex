import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '@/navigation/SettingsStack';
import SettingsListSection from '@/components/screens/settingsList/SettingsListSection';
import {SettingsItem} from "@/types/settings";
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

export default function SettingsListScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const appSettings: SettingsItem[] = [
        {
            id: 'notifications',
            title: 'Notifications',
            onPress: () => {
                navigation.navigate('Notifications');
            },
        },
        {
            id: 'appearance',
            title: 'Appearance',
            onPress: () => {
                navigation.navigate('Appearance');
            },
        }
    ];

    const walletSettings: SettingsItem[] = [
        {
            id: 'wallet',
            title: 'Wallet',
            onPress: () => {
                navigation.navigate('Wallet');
            },
        }
    ];

    const aboutSettings: SettingsItem[] = [
        {
            id: 'about',
            title: 'About',
            onPress: () => {
                navigation.navigate('About');
            },
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <SettingsListSection title="App Settings" items={appSettings} />
                <SettingsListSection title="Wallet" items={walletSettings} />
                <SettingsListSection title="System" items={aboutSettings} />
            </ScrollView>
        </View>
    );
}

const getStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: theme.colors.background,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
});
