import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import {upsertAnnotation, upsertConnection, upsertConnectionField} from '@/services/storage';
import { ExchangeV1 } from '@/types/exchange';
import {stripProtocol} from "@/utils/parse";

const genName = (seed?: string | number) => {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
    style: 'lowerCase',
    seed,
  });
}

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
  } catch {
    try {
      return await parseExternalQRCode(data) ?? null;
    } catch (error) {
      console.error('Failed to process QR code:', error);
    }
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
    await upsertAnnotation(
        annotationID,
        connectionID,
        "Social",
        connectionType,
        url
    )
    return connectionID;
  }

  const parseUnknown = async (url: string) => {
    let userName = url.split('/').pop()?.trim();
    // If we cant parse one, make one.
    if (!userName) {userName = genName(url)}
      try {
        return await insertConnectionData({connectionType: "Unknown", userName, url: url})
      } catch (error) {
        console.error('Failed to save Unknown connection:', error);
      }
  }

  const simpleParser = async ({url, deliminator, source}: {url: string, deliminator: string, source: string}) => {
    try {
      const userName = url.split(deliminator).pop()?.replace(/\/$/, '').trim();
      if (userName) {
        try {
          return await insertConnectionData({connectionType: source, userName, url: url})
        } catch (error) {
          console.error(`Failed to save ${source} connection:`, error);
        }
      }
    } catch (error) {
      console.error(`Failed to parse ${source} connection:`, error);
    }
  }

  const url = stripProtocol(data)

  if (url.includes('linkedin.com')) {
    return simpleParser({url, deliminator: "in/", source:"LinkedIn",});
  } else if (url.includes('twitter.com') || data.includes('x.com')) {
    return simpleParser({url, deliminator: "/", source:"X",});
  } else if (url.includes('t.me')) {
    return simpleParser({url, deliminator: "/", source: "Telegram",});
  } else if (url.includes('github.com')) {
    return simpleParser({url, deliminator: "/", source: "GitHub",});
  } else if (url.includes('instagram.com')) {
    return simpleParser({url, deliminator: "/", source: "Instagram",});
  } else if (url.includes('warpcast.com')) {
    return simpleParser({url, deliminator: "/", source: "Farcaster",});
  } else {
    return parseUnknown(url);
  }

};

export { processScannedQR, parseExternalQRCode };