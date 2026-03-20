import { generateConnectionProtocol } from '@/services/connection/exchange';
import { upsertConnection, upsertConnectionField } from '@/services/storage';
import { ExchangeV1 } from '@/types/exchange';

const generateQR = (maskId: string) => {};

/**
 * Processes a scanned QR code and saves the connection to the database
 * @param data - The raw QR code data string
 * @returns The connection ID if successful, null otherwise
 */
const processScannedQR = async (data: string): Promise<string | null> => {
  try {
    const scannedData: ExchangeV1 = JSON.parse(data);
    console.log('Scanned QR code:', JSON.stringify(scannedData, null, 2));

    // Parse the payload
    const payload = JSON.parse(scannedData.payload);
    const { display_name, avatar_uri, fields } = payload;

    // Save connection to database
    const connectionId = scannedData.exchangeId;
    await upsertConnection(
      connectionId,
      scannedData.issuer,
      display_name,
      scannedData.payload,
      avatar_uri,
      scannedData.timestamp
    );

    // Save connection fields
    if (fields && Array.isArray(fields)) {
      for (const field of fields) {
        await upsertConnectionField(
          `${connectionId}-${field.label}`,
          connectionId,
          field.label,
          field.value
        );
      }
    }

    console.log('Connection saved successfully!');
    return connectionId;
  } catch (error) {
    console.error('Failed to process QR code:', error);
    return null;
  }
};

export { generateQR, processScannedQR };