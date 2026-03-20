import { Camera, QrCode } from 'lucide-react-native';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { generateConnectionProtocol } from '@/services/connection/exchange';
import { useEffect, useState } from 'react';
import { ExchangeV1 } from '@/types/exchange';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface QRDialogProps {
    visible: boolean;
    onClose: () => void;
    maskId: string;
    issuer: string;
    signMessage: (message: string) => Promise<string>;
}

export default function QRDialog({ visible, onClose, maskId, issuer, signMessage }: QRDialogProps) {
    const [qrData, setQrData] = useState<string>('');
    const [showCamera, setShowCamera] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    useEffect(() => {
        if (visible && maskId && !showCamera) {
            generateConnectionProtocol(maskId, issuer, signMessage)
                .then((protocol: ExchangeV1) => {
                    setQrData(JSON.stringify(protocol));
                })
                .catch(error => console.error("Failed to generate QR protocol:", error));
        }
    }, [visible, maskId, issuer, signMessage, showCamera]);

    useEffect(() => {
        if (!visible) {
            setShowCamera(false);
        }
    }, [visible]);

    const handleCameraPress = async () => {
        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                return;
            }
        }
        setShowCamera(true);
    };

    const handleQRScanned = ({ data }: { data: string }) => {
        console.log('QR code scanned:', data);
        console.log('Scanned QR code:', JSON.stringify(JSON.parse(data), null, 2));
    };

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
                    <TouchableOpacity
                        style={styles.cameraIconContainer}
                        onPress={showCamera ? () => setShowCamera(false) : handleCameraPress}
                    >
                        {showCamera ? (
                            <QrCode size={24} color="#666" />
                        ) : (
                            <Camera size={24} color="#666" />
                        )}
                    </TouchableOpacity>
                    <View style={styles.qrContainer}>
                        {showCamera ? (
                            <CameraView
                                style={styles.camera}
                                facing="back"
                                onBarcodeScanned={handleQRScanned}
                                barcodeScannerSettings={{
                                    barcodeTypes: ['qr'],
                                }}
                            />
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

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialog: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: 300,
        position: 'relative',
    },
    cameraIconContainer: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1,
    },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
        width: 250,
        height: 250,
    },
    camera: {
        width: 250,
        height: 250,
    },
});