import { Text, StyleSheet } from "react-native";
import SettingsScreen from "./SettingsScreen";
import SettingsSection from "@/components/screens/settingsDetail/SettingsSection";

const AboutScreen = () => {
    return (
        <SettingsScreen title="">
            <SettingsSection title="App Info">
                <Text style={styles.text}>Version {require('@/../package.json').version}</Text>
            </SettingsSection>
            <SettingsSection title="Legal">
                <Text style={styles.text}>Yes</Text>
            </SettingsSection>
        </SettingsScreen>
    );
};

export default AboutScreen;

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        padding: 16,
        color: '#000',
    },
});