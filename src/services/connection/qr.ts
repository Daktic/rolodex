import { generateConnectionProtocol } from '@/services/connection/exchange';
import {upsertAnnotation, upsertConnection, upsertConnectionField} from '@/services/storage';
import { ExchangeV1 } from '@/types/exchange';
import {stripProtocol} from "@/utils/parse";

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

const parseExternalQRCode = (data: string) => {
  const insertConnectionData = async (
      {
        connectionType,
        userName,
        url
      }:
      {
        connectionType: string,
        userName: string,
        url: string
      }
  ) => {
    const connectionID = `${connectionType}-${userName}`;
    await upsertConnection(
        connectionID,
        null,
        userName,
        JSON.stringify({
          "display_name": userName,
          "fields": [
            {
              "label": connectionType,
              "value": url
            },
          ]
        })
    )
    const annotationID = `annotation-${connectionType}-${userName}`;
    console.log("annotationID", annotationID);
    await upsertAnnotation(
        annotationID,
        connectionID,
        "Social",
        connectionType,
        url
    )
    return connectionID;
  }

  const parseLinkedIn = async (url: string) => {
    const userName = url.split('in/').pop()?.replace(/\/$/, '').trim();

    if (userName) {
      try {
        return await insertConnectionData({connectionType: "LinkedIn", userName, url: url})
      } catch (error) {
        console.error('Failed to save LinkedIn connection:', error);
      }
    }

    return null;
  }

  const parseTwitter = async (url: string) => {
    const userName = url.split('/').pop()?.trim();
    if (userName) {
      try {
        return await insertConnectionData({connectionType: "X", userName, url: url})
      } catch (error) {
        console.error('Failed to save Twitter connection:', error);
      }
    }
  }

  const parseTelegram = async (url: string) => {
    const userName = url.split('/').pop()?.trim();
    if (userName) {
      try {
        return await insertConnectionData({connectionType: "Telegram", userName, url: url})
      } catch (error) {
        console.error('Failed to save Telegram connection:', error);
      }
    }
  }

  const url = stripProtocol(data)

  if (url.includes('linkedin.com')) {
    return parseLinkedIn(url);
  } else if (url.includes('twitter.com') || data.includes('x.com')) {
    return parseTwitter(url);
  } else if (url.includes('t.me')) {
    return parseTelegram(url);
  }

};

export { generateQR, processScannedQR, parseExternalQRCode };