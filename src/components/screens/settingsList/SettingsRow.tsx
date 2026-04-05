import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

interface SettingsRowProps {
    title: string;
    onPress: () => void;
    showDivider?: boolean;
}

export default function SettingsRow({ title, onPress, showDivider = true }: SettingsRowProps) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <View>
            <TouchableOpacity style={styles.row} onPress={onPress}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            {showDivider && <View style={styles.divider} />}
        </View>
    );
}

const getStyles = (theme: Theme) => StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: theme.colors.surface,
    },
    title: {
        fontSize: 16,
        color: theme.colors.text.primary,
    },
    chevron: {
        fontSize: 24,
        color: theme.colors.text.tertiary,
        fontWeight: '300',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.colors.border,
        marginLeft: 20,
    },
});
