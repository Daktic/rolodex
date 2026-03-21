import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SettingsRowProps {
    title: string;
    onPress: () => void;
    showDivider?: boolean;
}

export default function SettingsRow({ title, onPress, showDivider = true }: SettingsRowProps) {
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

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 16,
        color: '#000000',
    },
    chevron: {
        fontSize: 24,
        color: '#C7C7CC',
        fontWeight: '300',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#C6C6C8',
        marginLeft: 20,
    },
});
