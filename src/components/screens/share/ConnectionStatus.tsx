import { StyleSheet, Text, View } from "react-native";

export default function ConnectionStatus() {
    return (
        <View style={styles.connectionStatus}>
            <View style={styles.pulsingDot} />
            <Text style={styles.connectionText}>Waiting for connection...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
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
});
