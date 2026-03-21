import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '@/navigation/SettingsStack';
import SettingsListSection from '@/components/screens/settingsList/SettingsListSection';
import {SettingsItem} from "@/types/settings";

export default function SettingsListScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();

    const appSettings: SettingsItem[] = [
        {
            id: 'notifications',
            title: 'Notifications',
            onPress: () => {
                // TODO: Navigate to notifications settings
                console.log('Navigate to Notifications settings');
            },
        },
        {
            id: 'appearance',
            title: 'Appearance',
            onPress: () => {
                // TODO: Navigate to appearance settings
                console.log('Navigate to Appearance settings');
            },
        }
    ];

    const accountSettings: SettingsItem[] = [
        {
            id: 'privateKey',
            title: 'Private Key',
            onPress: () => {
                // TODO: Navigate to profile settings
                console.log('Navigate to Profile settings');
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
                <SettingsListSection title="Wallet" items={accountSettings} />
                <SettingsListSection title="System" items={aboutSettings} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#f5f5f5',
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
