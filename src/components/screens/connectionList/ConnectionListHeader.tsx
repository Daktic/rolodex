
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {UserPlus} from "lucide-react-native";
import {QRScanner} from "@/dialogs/QR";
import {useState} from "react";
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';


export const ConnectionListHeader = () => {
    const [showCamera, setShowCamera] = useState(false);
    const { theme } = useTheme();
    const styles = getStyles(theme);


    const handleConnectPress = () => {
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

const getStyles = (theme: Theme) => StyleSheet.create({
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
        color: theme.colors.text.primary,
    },
    connectButton: {
        padding: 8,
        marginLeft: 'auto',
    },
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
    cameraContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
    },
});
