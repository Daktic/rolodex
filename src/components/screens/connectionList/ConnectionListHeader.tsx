
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {UserPlus} from "lucide-react-native";
import {QRScanner} from "@/dialogs/QR";
import {useState} from "react";


export const ConnectionListHeader = () => {
    const [showCamera, setShowCamera] = useState(false);


    const handleConnectPress = () => {
        console.log("Connect button pressed", {showCamera});
        setShowCamera(!showCamera)
    };

    const onClose = () => setShowCamera(false);


    return (
        <View style={styles.header}>
            <Text style={styles.title}>Connections</Text>
            <TouchableOpacity
                style={styles.connectButton}
                onPress={handleConnectPress}
            >
                <UserPlus />
            </TouchableOpacity>
            <Modal
                visible={showCamera}
                transparent
                animationType="fade"
                onRequestClose={onClose}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <View style={styles.cameraContainer} onStartShouldSetResponder={() => true}>
                        <QRScanner
                            onClose={() => setShowCamera(false)}
                            setShowCamera={setShowCamera}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
};

export default ConnectionListHeader;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    connectButton: {
        padding: 8,
        marginLeft: 'auto',
    },
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
    cameraContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 16,
    },
});