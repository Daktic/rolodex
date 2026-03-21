import { Text, StyleSheet } from "react-native";
import SettingsScreen from "./SettingsScreen";
import SettingsSection from "@/components/screens/settingsDetail/SettingsSection";

const NotificationScreen = () => {
    return (
        <SettingsScreen title="">
            <SettingsSection title="Coming Soon">
                <Text style={styles.text}>TODO</Text>
            </SettingsSection>
        </SettingsScreen>
    );
};

export default NotificationScreen;

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        padding: 16,
        color: '#000',
    },
});