import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { generatePayload } from '@/services/connection/exchange';
import { PayloadV1 } from '@/types/exchange';
import ConnectionStatus from '@/components/screens/share/ConnectionStatus';
import NFCListener, { ConnectionState } from '@/components/screens/share/NFCListener';
import { ConnectionSession } from '@/services/connection/handshake';
import { useRoute } from '@react-navigation/native';
import { QrCode } from "lucide-react-native";
import QRDialog from '@/dialogs/QR';
import {getProfileId, signMessage} from "@/services/wallet";

export default function ShareScreen() {
    const route = useRoute();
    const { maskId } = route.params as { maskId: string };
    const [payload, setPayload] = useState<PayloadV1 | null>(null);
    const [qrDialogVisible, setQrDialogVisible] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionState>('idle');
    const [issuer, setIssuer] = useState<string | null>(null);

    const handleSessionReceived = (session: ConnectionSession) => {
        console.log('Received session from remote device:', session);
        // TODO: Complete handshake and exchange contact data
    };

    useEffect(() => {
        getProfileId().then((id) => {
            setIssuer(id);
        }).catch((error) => console.error(error));
    }, []);

    useEffect(() => {
        if (maskId) {
            generatePayload(maskId)
                .then(setPayload)
                .catch(error => console.error("Failed to generate payload:", error));
        }
    }, [maskId]);

    return (
        <View style={styles.container}>
            <NFCListener
                onStatusChange={setConnectionStatus}
                onSessionReceived={handleSessionReceived}
            />

            <View style={styles.connectMethodsContainer}>
                <TouchableOpacity
                    style={styles.methodItem}
                    onPress={() => setQrDialogVisible(true)}
                >
                    <QrCode />
                </TouchableOpacity>
            </View>

            <QRDialog
                visible={qrDialogVisible}
                onClose={() => setQrDialogVisible(false)}
                maskId={maskId}
                issuer={issuer?? "Invalid"}
                signMessage={signMessage}
            />
            <Text style={styles.title}>Share Contact</Text>

            <ConnectionStatus status={connectionStatus} />

            <Text style={styles.description}>
                Tap phones to share contact info.{'\n'}
                Ensure both parties have this screen open.
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
