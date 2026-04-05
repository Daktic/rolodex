import {ActivityIndicator, StyleSheet, Text, View, Modal} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

interface LoadingProps {
    visible: boolean;
    text?: string;
}

const getStyles = (theme: Theme) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: theme.colors.overlay,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialog: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        minWidth: 160,
        shadowColor: theme.colors.shadow,
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
        color: theme.colors.text.primary,
    },
});

export default function Loading({visible, text = 'Loading...'}: LoadingProps) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <ActivityIndicator size="large" color={theme.colors.accent}/>
                    {text && <Text style={styles.text}>{text}</Text>}
                </View>
            </View>
        </Modal>
    );
}
