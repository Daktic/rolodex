import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ShareDrawerProps {
    visible: boolean;
    onClose: () => void;
}

export default function ShareDrawer({ visible, onClose }: ShareDrawerProps) {
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
                            <View style={styles.connectionStatus}>
                                <View style={styles.pulsingDot} />
                                <Text style={styles.connectionText}>Waiting for connection...</Text>
                            </View>
                            <Text style={styles.drawerDescription}>
                                Share your contact information using the protocol.
                                The other device needs to be ready to receive.
                            </Text>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onClose}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
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
        minHeight: 300,
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
    },
    connectionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        paddingVertical: 16,
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
    },
    pulsingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#007AFF',
        marginRight: 12,
    },
    connectionText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    drawerDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
});
