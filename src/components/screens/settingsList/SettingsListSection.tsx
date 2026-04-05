import { View, Text, StyleSheet } from 'react-native';
import SettingsRow from './SettingsRow';
import {SettingsItem} from "@/types/settings";
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';


interface SettingsListSectionProps {
    title: string;
    items: SettingsItem[];
}

export default function SettingsListSection({ title, items }: SettingsListSectionProps) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.section}>
            <Text style={styles.sectionHeader}>{title}</Text>
            <View style={styles.sectionContent}>
                {items.map((item, index) => (
                    <SettingsRow
                        key={item.id}
                        title={item.title}
                        onPress={item.onPress}
                        showDivider={index < items.length - 1}
                    />
                ))}
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
