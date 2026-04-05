import { StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { PayloadV1 } from "@/types/exchange";
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

interface PayloadContainerProps {
    payload: PayloadV1 | null;
}

const getStyles = (theme: Theme) => StyleSheet.create({
    dataPreviewContainer: {
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        flex: 1,
    },
    dataPreviewTitle: {
        color: theme.colors.text.tertiary,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    scrollWrapper: {
        flex: 1,
    },
    dataPreviewScroll: {
        flex: 1,
    },
    dataTable: {
        gap: 12,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderAlt,
    },
    dataLabel: {
        color: theme.colors.text.tertiary,
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    dataValue: {
        color: theme.colors.text.inverse,
        fontSize: 14,
        fontWeight: '400',
        flex: 1,
        textAlign: 'right',
    },
    loadingText: {
        color: theme.colors.text.tertiary,
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
});

export default function PayloadContainer({ payload }: PayloadContainerProps) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.dataPreviewContainer}>
            <Text style={styles.dataPreviewTitle}>Sharing Information</Text>
            <View style={styles.scrollWrapper}>
                <ScrollView
                    style={styles.dataPreviewScroll}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                >
                    {payload && (
                        <View style={styles.dataTable}>
                            <View style={styles.dataRow}>
                                <Text style={styles.dataLabel}>Display Name</Text>
                                <Text style={styles.dataValue}>{payload.display_name}</Text>
                            </View>
                            {payload.fields.map((field, index) => (
                                <View key={index} style={styles.dataRow}>
                                    <Text style={styles.dataLabel}>{field.label}</Text>
                                    <Text style={styles.dataValue}>{field.value}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                    {!payload && (
                        <Text style={styles.loadingText}>Loading data...</Text>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}
