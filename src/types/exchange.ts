export interface PayloadV1 {
    display_name: string;
    avatar_uri: string | null;
    fields: Array<{
        label: string;
        value: string;
    }>;
}

export interface ExchangeV1 {
    schemaVersion: 1;
    exchangeId: string;
    signature: string;
    issuer: string;
    timestamp: number;
    payload: string; // JSON stringified PayloadV1
}

export type Exchange = ExchangeV1;
export type Payload = PayloadV1;