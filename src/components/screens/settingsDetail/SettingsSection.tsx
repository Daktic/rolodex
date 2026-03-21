import { View, Text, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';

interface SettingsSectionProps {
    title?: string;
    children: ReactNode;
}

export default function SettingsSection({ title, children }: SettingsSectionProps) {
    return (
        <View style={styles.section}>
            {title && <Text style={styles.sectionHeader}>{title}</Text>}
            <View style={styles.sectionContent}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6D6D72',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    sectionContent: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#C6C6C8',
    },
});
