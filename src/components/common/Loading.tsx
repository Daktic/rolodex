import {ActivityIndicator, StyleSheet, Text, View, Modal} from 'react-native';

interface LoadingProps {
    visible: boolean;
    text?: string;
}

export default function Loading({visible, text = 'Loading...'}: LoadingProps) {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <ActivityIndicator size="large" color="#007AFF"/>
                    {text && <Text style={styles.text}>{text}</Text>}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialog: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        minWidth: 160,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    text: {
        marginTop: 16,
        fontSize: 16,
        color: '#333',
    },
});
