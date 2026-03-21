import { StyleSheet, Text, View, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { ConnectionState } from "./NFCListener";

interface ConnectionStatusProps {
    status: ConnectionState;
}

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (status === 'searching') {
            // Pulsing animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.5,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [status]);

    const getStatusConfig = () => {
        switch (status) {
            case 'searching':
                return {
                    color: '#007AFF',
                    text: 'Waiting for connection...',
                    backgroundColor: '#f0f8ff',
                };
            case 'connecting':
                return {
                    color: '#FF9500',
                    text: 'Connecting...',
                    backgroundColor: '#fff8f0',
                };
            case 'connected':
                return {
                    color: '#34C759',
                    text: 'Connected!',
                    backgroundColor: '#f0fff4',
                };
            case 'error':
                return {
                    color: '#FF3B30',
                    text: 'Connection error',
                    backgroundColor: '#fff0f0',
                };
            default:
                return {
                    color: '#8E8E93',
                    text: 'Idle',
                    backgroundColor: '#f8f8f8',
                };
        }
    };

    const config = getStatusConfig();

    return (
        <View style={[styles.connectionStatus, { backgroundColor: config.backgroundColor }]}>
            <Animated.View
                style={[
                    styles.pulsingDot,
                    {
                        backgroundColor: config.color,
                        transform: [{ scale: status === 'searching' ? pulseAnim : 1 }],
                    },
                ]}
            />
            <Text style={styles.connectionText}>{config.text}</Text>
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
