import { StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { PayloadV1 } from "@/types/exchange";

interface PayloadContainerProps {
    payload: PayloadV1 | null;
}

export default function PayloadContainer({ payload }: PayloadContainerProps) {
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

const styles = StyleSheet.create({
    dataPreviewContainer: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        flex: 1,
    },
    dataPreviewTitle: {
        color: '#999',
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
        borderBottomColor: '#333',
    },
    dataLabel: {
        color: '#888',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    dataValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '400',
        flex: 1,
        textAlign: 'right',
    },
    loadingText: {
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
});
