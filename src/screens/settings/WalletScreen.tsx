import {Text, StyleSheet, Button, Alert, Modal, View, Pressable} from "react-native";
import SettingsScreen from "./SettingsScreen";
import SettingsSection from "@/components/screens/settingsDetail/SettingsSection";
import {useEffect, useState} from "react";
import {getProfileId} from "@/services/wallet";
import * as Clipboard from 'expo-clipboard';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

const getStyles = (theme: Theme) => StyleSheet.create({
    text: {
        fontSize: 16,
        padding: 16,
        color: theme.colors.text.primary,
    },
    button: {
        padding: 16,
        backgroundColor: theme.colors.danger,
        borderRadius: 8,
    },
    overlay: {
        flex: 1,
        backgroundColor: theme.colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 24,
        width: '85%',
        gap: 16,
    },
    warning: {
        color: theme.colors.danger,
        fontWeight: 'bold',
        fontSize: 14,
    },
    key: {
        fontFamily: 'monospace',
        fontSize: 13,
        backgroundColor: theme.colors.surfaceAlt,
        padding: 12,
        borderRadius: 8,
        color: theme.colors.text.secondary,
    },
    copyButton: {
        backgroundColor: theme.colors.danger,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButton: {
        alignItems: 'center',
        padding: 8,
    },
});

const PrivateKeyContent = ({visible, setModalVisible}: {visible: boolean, setModalVisible: (visible: boolean) => void}) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const [privateKey, setPrivateKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!visible) return;
        SecureStore.getItemAsync('WALLET_PRIVATE_KEY').then(setPrivateKey).catch(console.error);
    }, [visible]);

    const handleCopy = async () => {
        if (!privateKey) return;
        await Clipboard.setStringAsync(privateKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // reset after 2s
    };

    const handleClose = () => {
        setModalVisible(false);
        setTimeout(() => setPrivateKey(null), 300); // after fade animation
        setCopied(false);
    };

    return <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
            <View style={styles.card}>
                <Text style={styles.warning}>⚠️ Never share this with anyone</Text>

                {/* Selectable so user can manually select+copy too */}
                <Text selectable style={styles.key}>
                    {privateKey}
                </Text>

                <Pressable onPress={handleCopy} style={styles.copyButton}>
                    <Text>{copied ? '✓ Copied!' : 'Copy to Clipboard'}</Text>
                </Pressable>

                <Pressable onPress={handleClose} style={styles.closeButton}>
                    <Text>Done</Text>
                </Pressable>
            </View>
        </View>
    </Modal>
}

const WalletScreen = () => {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const [publicKey, setPublicKey] = useState<string | null>(null);
    const [showPrivateKeyDialog, setShowPrivateKeyDialog] = useState<boolean>(false);


    useEffect(() => {
        getProfileId().then(setPublicKey).catch(console.error)
    },[])

    const handlePrivateKeyExposure = () => {
        Alert.alert(
            'Show Private Key',
            `Nobody else should see your private key. Are you sure you want to continue?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, I\'m Safe',
                    style: 'destructive',
                    onPress: () => setShowPrivateKeyDialog(true),
                },
            ]
        );
    };

    return (
        <SettingsScreen title="">
            <SettingsSection title="Public Key">
                <Text style={styles.text}>{publicKey}</Text>
            </SettingsSection>
            <SettingsSection title="Private Key">
                <Button title={"Retrieve Private Key"}
                        color={styles.button.backgroundColor}
                        onPress={handlePrivateKeyExposure}
                />
            </SettingsSection>
            <PrivateKeyContent visible={showPrivateKeyDialog} setModalVisible={setShowPrivateKeyDialog}/>
        </SettingsScreen>
    );
};

export default WalletScreen;
