import { Modal, StyleSheet, Text, TouchableOpacity, View, Dimensions } from "react-native";
import { useEffect, useState } from "react";
import { generatePayload } from "@/services/exchange";
import { PayloadV1 } from "@/types/exchange";
import ConnectionStatus from "./ConnectionStatus";
import PayloadContainer from "./PayloadContainer";

interface ShareDrawerProps {
    visible: boolean;
    onClose: () => void;
    maskId: string;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function ShareDrawer({ visible, onClose, maskId }: ShareDrawerProps) {
    const [payload, setPayload] = useState<PayloadV1 | null>(null);

    useEffect(() => {
        if (visible && maskId) {
            generatePayload(maskId)
                .then(setPayload)
                .catch(error => console.error("Failed to generate payload:", error));
        }
    }, [visible, maskId]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.drawerOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={styles.drawerContainer}>
                        <View style={styles.drawerHandle} />
                        <Text style={styles.drawerTitle}>Share Contact</Text>
                        <View style={styles.drawerContent}>
                            <ConnectionStatus />
                            <Text style={styles.drawerDescription}>
                                Share your contact information using the protocol.
                                The other device needs to be ready to receive.
                            </Text>
                            <PayloadContainer payload={payload} />
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    drawerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    drawerContainer: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingBottom: 40,
        height: SCREEN_HEIGHT * 2 / 3,
    },
    drawerHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#ddd',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    drawerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    drawerContent: {
        paddingHorizontal: 24,
        flex: 1,
    },
    drawerDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
});
