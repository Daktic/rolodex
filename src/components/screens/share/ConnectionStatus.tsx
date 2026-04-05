import { StyleSheet, Text, View, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { ConnectionState } from "./NFCListener";
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

interface ConnectionStatusProps {
    status: ConnectionState;
}

const getStyles = (theme: Theme) => StyleSheet.create({
    connectionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        paddingVertical: 16,
        backgroundColor: theme.colors.surfaceAlt,
        borderRadius: 12,
    },
    pulsingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.accent,
        marginRight: 12,
    },
    connectionText: {
        fontSize: 16,
        color: theme.colors.text.primary,
        fontWeight: '500',
    },
});

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const { theme } = useTheme();
    const styles = getStyles(theme);

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
                    color: theme.colors.status.info.text,
                    text: 'Waiting for connection...',
                    backgroundColor: theme.colors.status.info.background,
                };
            case 'connecting':
                return {
                    color: theme.colors.status.pending.text,
                    text: 'Connecting...',
                    backgroundColor: theme.colors.status.pending.background,
                };
            case 'connected':
                return {
                    color: theme.colors.status.active.text,
                    text: 'Connected!',
                    backgroundColor: theme.colors.status.active.background,
                };
            case 'error':
                return {
                    color: theme.colors.status.error.text,
                    text: 'Connection error',
                    backgroundColor: theme.colors.status.error.background,
                };
            default:
                return {
                    color: theme.colors.status.neutral.text,
                    text: 'Idle',
                    backgroundColor: theme.colors.status.neutral.background,
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
