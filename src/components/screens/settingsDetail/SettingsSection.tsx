import { View, Text, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

interface SettingsSectionProps {
    title?: string;
    children: ReactNode;
}

export default function SettingsSection({ title, children }: SettingsSectionProps) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.section}>
            {title && <Text style={styles.sectionHeader}>{title}</Text>}
            <View style={styles.sectionContent}>
                {children}
            </View>
        </View>
    );
}

const getStyles = (theme: Theme) => StyleSheet.create({
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    sectionContent: {
        backgroundColor: theme.colors.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.border,
    },
});
