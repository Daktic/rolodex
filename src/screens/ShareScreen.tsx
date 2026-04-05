import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { generatePayload } from '@/services/connection/exchange';
import { PayloadV1 } from '@/types/exchange';
import { useRoute } from '@react-navigation/native';
import { QrCode, Camera } from "lucide-react-native";
import QRDialog from '@/dialogs/QR';
import {getProfileId, signMessage} from "@/services/wallet";
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

const getStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        color: theme.colors.text.primary,
    },
    splitButton: {
        flexDirection: 'row',
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
    },
    splitButtonHalf: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
    },
    splitButtonLeft: {
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    splitButtonRight: {
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
    },
    splitButtonDivider: {
        width: 1,
        backgroundColor: theme.colors.text.primary,
        marginVertical: 10,
    },
    splitButtonText: {
        color: theme.colors.text.secondary,
        fontSize: 15,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    dataPreviewContainer: {
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        padding: 16,
        flex: 1,
        marginBottom: 40,
    },
    dataPreviewTitle: {
        color: theme.colors.text.tertiary,
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
        borderBottomColor: theme.colors.borderAlt,
        alignItems: 'center',
    },
    dataLabel: {
        color: theme.colors.text.primary,
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    dataValue: {
        color: theme.colors.text.tertiary,
        fontSize: 14,
        fontWeight: '400',
        flex: 1,
        textAlign: 'left',
    },
    loadingText: {
        color: theme.colors.text.tertiary,
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
});

export default function ShareScreen() {
    const route = useRoute();
    const { maskId } = route.params as { maskId: number };
    const [payload, setPayload] = useState<PayloadV1 | null>(null);
    const [qrDialogVisible, setQrDialogVisible] = useState(false);
    const [qrInitialMode, setQrInitialMode] = useState<'qr' | 'camera'>('qr');
    const [issuer, setIssuer] = useState<string | null>(null);
    const { theme } = useTheme();
    const styles = getStyles(theme);

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
            <Text style={styles.title}>Share Contact</Text>

            <View style={styles.splitButton}>
                <TouchableOpacity
                    style={[styles.splitButtonHalf, styles.splitButtonLeft]}
                    onPress={() => { setQrInitialMode('qr'); setQrDialogVisible(true); }}
                >
                    <QrCode size={18} color={theme.colors.iconColor} />
                    <Text style={styles.splitButtonText}>Show QR</Text>
                </TouchableOpacity>
                <View style={styles.splitButtonDivider} />
                <TouchableOpacity
                    style={[styles.splitButtonHalf, styles.splitButtonRight]}
                    onPress={() => { setQrInitialMode('camera'); setQrDialogVisible(true); }}
                >
                    <Camera size={18} color={theme.colors.iconColor} />
                    <Text style={styles.splitButtonText}>Scan</Text>
                </TouchableOpacity>
            </View>

            <QRDialog
                visible={qrDialogVisible}
                onClose={() => setQrDialogVisible(false)}
                maskId={maskId}
                issuer={issuer?? "Invalid"}
                signMessage={signMessage}
                initialMode={qrInitialMode}
            />

            <Text style={styles.description}>
                Share your QR, share your contact{'\n'}
                Scan to receive some else's.
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
