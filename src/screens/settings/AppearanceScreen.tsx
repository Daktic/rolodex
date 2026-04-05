import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import SettingsScreen from './SettingsScreen';
import SettingsSection from '@/components/screens/settingsDetail/SettingsSection';
import { useTheme } from '@/hooks/useTheme';
import type { ThemeOption } from '@/theme/themes';

const THEME_OPTIONS: { label: string; value: ThemeOption }[] = [
    { label: 'System', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'High Contrast', value: 'highContrast' },
];

const AppearanceScreen = () => {
    const { theme, selectedTheme, setSelectedTheme } = useTheme();

    return (
        <SettingsScreen title="Appearance">
            <SettingsSection title="Theme">
                {THEME_OPTIONS.map(({ label, value }, index) => (
                    <TouchableOpacity
                        key={value}
                        style={[
                            styles.row,
                            { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
                            index < THEME_OPTIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth },
                        ]}
                        onPress={() => setSelectedTheme(value)}
                    >
                        <Text style={[styles.label, { color: theme.colors.text.primary }]}>{label}</Text>
                        {selectedTheme === value && (
                            <Text style={[styles.checkmark, { color: theme.colors.accent }]}>✓</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </SettingsSection>
        </SettingsScreen>
    );
};

export default AppearanceScreen;

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    label: {
        fontSize: 16,
    },
    checkmark: {
        fontSize: 18,
        fontWeight: '600',
    },
});
