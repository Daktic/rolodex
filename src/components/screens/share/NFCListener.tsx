import { useEffect, useState } from 'react';
import NfcManager, { NfcEvents, TagEvent } from 'react-native-nfc-manager';
import { initializeNFC, createConnectionSession, exchangeNFCSession, cleanupNFC, ConnectionSession } from '@/services/connection/handshake';

export type ConnectionState = 'idle' | 'searching' | 'connecting' | 'connected' | 'error';

interface NFCListenerProps {
    onStatusChange: (status: ConnectionState) => void;
    onSessionReceived?: (session: ConnectionSession) => void;
}

const NFCListener = ({ onStatusChange, onSessionReceived }: NFCListenerProps) => {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let isSubscribed = true;
        const session = createConnectionSession('initiator');

        const handleTagDiscovered = async (tag: TagEvent) => {
            if (!isSubscribed) return;

            try {
                onStatusChange('connecting');

                // Attempt to exchange session data
                const remoteSession = await exchangeNFCSession(session);

                if (remoteSession) {
                    onStatusChange('connected');
                    onSessionReceived?.(remoteSession);
                } else {
                    onStatusChange('searching');
                }
            } catch (error) {
                console.error('NFC exchange error:', error);
                onStatusChange('error');

                // Return to searching after error
                setTimeout(() => {
                    if (isSubscribed) onStatusChange('searching');
                }, 2000);
            }
        };

        const startNFC = async () => {
            const supported = await initializeNFC();

            if (!supported) {
                console.error('NFC not supported');
                onStatusChange('error');
                return;
            }

            if (!isSubscribed) return;

            onStatusChange('searching');
            setIsActive(true);

            // Set event listener for tag discovery
            NfcManager.setEventListener(NfcEvents.DiscoverTag, handleTagDiscovered);

            // Register for tag events
            await NfcManager.registerTagEvent();
        };

        startNFC();

        // Cleanup on unmount
        return () => {
            isSubscribed = false;
            setIsActive(false);
            NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
            NfcManager.unregisterTagEvent();
            cleanupNFC();
            onStatusChange('idle');
        };
    }, []);

    return null;
};

export default NFCListener;