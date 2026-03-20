import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { generatePayload } from '@/services/exchange';
import { PayloadV1 } from '@/types/exchange';
import ConnectionStatus from '@/components/screens/profile/share/ConnectionStatus';
import { useRoute } from '@react-navigation/native';
import {QrCode, SquaresExclude} from "lucide-react-native";

export default function ShareScreen() {
    const route = useRoute();
    const { maskId } = route.params as { maskId: string };
    const [payload, setPayload] = useState<PayloadV1 | null>(null);

    useEffect(() => {
        if (maskId) {
            generatePayload(maskId)
                .then(setPayload)
                .catch(error => console.error("Failed to generate payload:", error));
        }
    }, [maskId]);

    return (
        <View style={styles.container}>
            <View style={styles.connectMethodsContainer}>
                <View style={styles.methodItem}>
                    <QrCode />
                    <Text style={styles.methodLabel}>QR Code</Text>
                </View>
                <View style={styles.methodItem}>
                    <SquaresExclude />
                    <Text style={styles.methodLabel}>Connect Via</Text>
                </View>
            </View>
            <Text style={styles.title}>Share Contact</Text>

            <ConnectionStatus />

            <Text style={styles.description}>
                Share your contact information using the protocol.
                The other device needs to be ready to receive.
            </Text>

            <View style={styles.dataPreviewContainer}>
                <Text style={styles.dataPreviewTitle}>Sharing Information</Text>
                <ScrollView style={styles.dataPreviewScroll}>
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
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    connectMethodsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    methodItem: {
        alignItems: 'center',
        gap: 8,
    },
    methodLabel: {
        fontSize: 14,
        color: '#666',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    description: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    dataPreviewContainer: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        flex: 1,
        marginBottom: 40,
    },
    dataPreviewTitle: {
        color: '#999',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
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
