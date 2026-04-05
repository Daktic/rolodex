import { Text, StyleSheet } from "react-native";
import SettingsScreen from "./SettingsScreen";
import SettingsSection from "@/components/screens/settingsDetail/SettingsSection";
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

const NotificationScreen = () => {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <SettingsScreen title="">
            <SettingsSection title="Coming Soon">
                <Text style={styles.text}>TODO</Text>
            </SettingsSection>
        </SettingsScreen>
    );
};

export default NotificationScreen;

const getStyles = (theme: Theme) => StyleSheet.create({
    text: {
        fontSize: 16,
        padding: 16,
        color: theme.colors.text.primary,
    },
});
