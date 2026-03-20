import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { generateSecureToken } from '@/utils/crypto';

export interface ConnectionSession {
  sessionId: string;
  deviceId: string;
  timestamp: number;
  role: 'initiator' | 'responder';
}

/**
 * Initialize NFC manager
 */
export async function initializeNFC(): Promise<boolean> {
  try {
    await NfcManager.start();
    const isSupported = await NfcManager.isSupported();
    return isSupported;
  } catch (error) {
    console.error('NFC initialization failed:', error);
    return false;
  }
}

/**
 * Create a new connection session
 */
export function createConnectionSession(role: 'initiator' | 'responder'): ConnectionSession {
  return {
    sessionId: generateSecureToken(32),
    deviceId: generateSecureToken(16),
    timestamp: Date.now(),
    role,
  };
}

/**
 * Write connection session to NFC tag (initiator device)
 */
export async function writeNFCSession(session: ConnectionSession): Promise<boolean> {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);

    const sessionData = JSON.stringify(session);
    const bytes = Ndef.encodeMessage([
      Ndef.textRecord(sessionData),
    ]);

    if (bytes) {
      await NfcManager.ndefHandler.writeNdefMessage(bytes);
      return true;
    }
    return false;
  } catch (error) {
    console.error('NFC write failed:', error);
    return false;
  } finally {
    await NfcManager.cancelTechnologyRequest();
  }
}

/**
 * Read connection session from NFC tag (responder device)
 */
export async function readNFCSession(): Promise<ConnectionSession | null> {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);

    const tag = await NfcManager.getTag();
    if (tag?.ndefMessage && tag.ndefMessage.length > 0) {
      const record = tag.ndefMessage[0];
      const text = Ndef.text.decodePayload(record.payload as any);
      const session: ConnectionSession = JSON.parse(text);
      return session;
    }
    return null;
  } catch (error) {
    console.error('NFC read failed:', error);
    return null;
  } finally {
    await NfcManager.cancelTechnologyRequest();
  }
}

/**
 * Use NFC peer-to-peer to exchange session info (bidirectional)
 */
export async function exchangeNFCSession(localSession: ConnectionSession): Promise<ConnectionSession | null> {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);

    // Write our session
    const sessionData = JSON.stringify(localSession);
    const bytes = Ndef.encodeMessage([
      Ndef.textRecord(sessionData),
    ]);

    if (bytes) {
      await NfcManager.ndefHandler.writeNdefMessage(bytes);
    }

    // Read their session
    const tag = await NfcManager.getTag();
    if (tag?.ndefMessage && tag.ndefMessage.length > 0) {
      const record = tag.ndefMessage[0];
      const text = Ndef.text.decodePayload(record.payload as any);
      const remoteSession: ConnectionSession = JSON.parse(text);
      return remoteSession;
    }

    return null;
  } catch (error) {
    console.error('NFC exchange failed:', error);
    return null;
  } finally {
    await NfcManager.cancelTechnologyRequest();
  }
}

/**
 * Clean up NFC resources
 */
export async function cleanupNFC(): Promise<void> {
  try {
    await NfcManager.cancelTechnologyRequest();
  } catch (error) {
    console.error('NFC cleanup failed:', error);
  }
}