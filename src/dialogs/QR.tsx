import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { generateConnectionProtocol } from '@/services/connection/exchange';
import { processScannedQR } from '@/services/connection/qr';
import {useEffect, useRef, useState} from 'react';
import { ExchangeV1 } from '@/types/exchange';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ConnectionsStackParamList } from '@/navigation/ConnectionsStack';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';


interface QRScannerProps {
    onClose: () => void;
    setShowCamera: (show: boolean) => void;
}

const getStyles = (theme: Theme) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: theme.colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialog: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 24,
        width: 300,
        position: 'relative',
    },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 250,
        height: 250,
    },
    camera: {
        width: 250,
        height: 250,
    },
});

const QRScanner = ({onClose, setShowCamera}: QRScannerProps) => {
    const isQRProcessing = useRef(false);
    const [permission, requestPermission] = useCameraPermissions();

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, []);

    const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>();
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const handleQRScanned = async ({ data }: { data: string }) => {
        if (isQRProcessing.current) return;  // gate
        isQRProcessing.current = true;

        const connectionId = await processScannedQR(data);

        console.log("QR Scanned:", connectionId);

        if (connectionId) {
            setShowCamera(false);
            onClose();
            // Navigate to the connection detail screen
            navigation.navigate('ConnectionDetail', { connectionId: connectionId });
        }
    };

    return (
        <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleQRScanned}
            barcodeScannerSettings={{
                barcodeTypes: ['qr'],
            }}
            zoom={0.15}
        />
    )
}

export {QRScanner};

interface QRDialogProps {
    visible: boolean;
    onClose: () => void;
    maskId: number;
    issuer: string;
    signMessage: (message: string) => Promise<string>;
    initialMode?: 'qr' | 'camera';
}

export default function QRDialog({ visible, onClose, maskId, issuer, signMessage, initialMode = 'qr' }: QRDialogProps) {
    const [qrData, setQrData] = useState<string>('');
    const [mode, setMode] = useState<'qr' | 'camera'>(initialMode);

    const { theme } = useTheme();
    const styles = getStyles(theme);

    useEffect(() => {
        if (visible && maskId) {
            generateConnectionProtocol(maskId, issuer, signMessage)
                .then((protocol: ExchangeV1) => {
                    setQrData(JSON.stringify(protocol));
                })
                .catch(error => console.error("Failed to generate QR protocol:", error));
        }
    }, [visible, maskId, issuer]);

    useEffect(() => {
        if (visible) {
            setMode(initialMode);
        }
    }, [visible, initialMode]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.dialog} onStartShouldSetResponder={() => true}>
                    <View style={styles.qrContainer}>
                        {mode === 'camera' ? (
                            <QRScanner setShowCamera={(show) => setMode(show ? 'camera' : 'qr')} onClose={onClose}/>
                        ) : (
                            qrData && (
                                <QRCode
                                    value={qrData}
                                    size={250}
                                />
                            )
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
