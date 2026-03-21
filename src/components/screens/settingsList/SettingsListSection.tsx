import { View, Text, StyleSheet } from 'react-native';
import SettingsRow from './SettingsRow';
import {SettingsItem} from "@/types/settings";


interface SettingsListSectionProps {
    title: string;
    items: SettingsItem[];
}

export default function SettingsListSection({ title, items }: SettingsListSectionProps) {
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
