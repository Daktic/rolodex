import {keccak256, stringToBytes} from "viem";
import {getMask, getMaskFields, getProfile, getProfileFields} from "../storage";
import { PayloadV1, ExchangeV1 } from "@/types/exchange";

const generatePayload = async (maskId: string): Promise<PayloadV1> => {
    // Get mask by ID
    const mask = await getMask(maskId);
    if (!mask) {
        throw new Error(`Mask with ID ${maskId} not found`);
    }

    // Get profile using profile_id from mask
    const profile = await getProfile(mask.profile_id);
    if (!profile) {
        throw new Error(`Profile with ID ${mask.profile_id} not found`);
    }

    // Get all profile fields for this profile
    const allProfileFields = await getProfileFields(mask.profile_id);

    // Get mask fields (fields to exclude)
    const maskFields = await getMaskFields(maskId);
    const maskFieldIds = new Set(maskFields.map(f => f.id));

    // Filter out mask fields, keeping only non-mask fields
    const fieldsToInclude = allProfileFields.filter(
        field => !maskFieldIds.has(field.id)
    );

    // Build payload
    return {
        display_name: profile.display_name,
        avatar_uri: profile.avatar_uri,
        fields: fieldsToInclude.map(field => ({
            label: field.label,
            value: field.value
        }))
    };
}

const generateExchangeId = (signature: string, issuer: string, timestamp: number, payload: string) => {
    function canonicalize(obj: unknown): string {
        return JSON.stringify(obj, Object.keys(obj as Record<string, unknown>).sort());
    }

    const input = canonicalize({
        signature,
        issuer,
        timestamp,
        payload,
    });
    return keccak256(stringToBytes(input), 'bytes');
}

const generateConnectionProtocol = async (
    maskId: string,
    issuer: string,
    signMessage: (message: string) => Promise<string>
): Promise<ExchangeV1> => {
    // Generate the payload from mask
    const payload = await generatePayload(maskId);
    const payloadString = JSON.stringify(payload);

    // Create timestamp
    const timestamp = Date.now();

    // Create message to sign (combining payload and timestamp)
    const messageToSign = JSON.stringify({
        payload: payloadString,
        timestamp,
        issuer
    });

    // Sign the message
    const signature = await signMessage(messageToSign);

    // Generate exchange ID
    const exchangeId = generateExchangeId(signature, issuer, timestamp, payloadString).toString();

    // Return complete protocol package
    return {
        schemaVersion: 1,
        exchangeId,
        signature,
        issuer,
        timestamp,
        payload: payloadString
    };
}

const decodeConnectionProtocol = (protocol: ExchangeV1) => {
    //TODO: go from protocol to storage in contacts
    return {
        schemaVersion: protocol.schemaVersion,
        exchangeId: protocol.exchangeId,
        signature: protocol.signature,
        issuer: protocol.issuer,
        timestamp: protocol.timestamp,
        payload: JSON.parse(protocol.payload)
    };
}

export { generatePayload, generateConnectionProtocol, decodeConnectionProtocol };
