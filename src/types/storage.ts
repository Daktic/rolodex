// Database model types

export interface Profile {
  id: string;
  display_name: string;
  avatar_uri: string | null;
  created_at: number;
}

export interface ProfileField {
  id: string;
  profile_id: string;
  label: string;
  value: string;
  share_by_default: number; // SQLite stores boolean as 0/1
}

export interface Mask {
  id: string;
  profile_id: string;
  name: string;
  created_at: number;
}

export interface Connection {
  id: string;
  connected_at: number;
  issuer: string;
  display_name: string;
  avatar_uri: string | null;
  raw_payload: string;
}

export interface ConnectionField {
  id: string;
  connection_id: string;
  label: string;
  value: string;
}

export interface Annotation {
  id: string;
  connection_id: string;
  type: string;
  label: string;
  value: string;
  created_at: number;
}
