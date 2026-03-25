// Database model types

export interface Profile {
  id: string;
  display_name: string;
  avatar_uri: string | null;
  created_at: number;
}

export interface Predicate {
  id: number;
  label: string; // e.g. "works at", "knows", "attended", "linkedin"
  object_type_id: number | null; // references object_types.id
}

export interface ObjectType {
  id: number;
  label: string; // e.g. "Person", "Organization", "Event", "Place", "URL", "Username"
  icon: string | null;
}

export interface SemanticNode {
  id: number;
  label: string; // e.g. "Acme Corp", "ETH Denver", "john doe"
  value: string | null; // raw value if different from label
}

export interface Triple {
  id: number;
  subject_id: number; // references connections.id
  predicate_id: number;
  object_id: number;
  created_at: number;
}

export interface ProfileField {
  id: number;
  profile_id: string;
  predicate_id: number;
  node_id: number;
  share_by_default: number; // SQLite stores boolean as 0/1
}

export interface ProfileFields {
  id: number;
  profile_id: string;
  label: string;
  value: string;
}

export interface Mask {
  id: number;
  profile_id: string;
  name: string;
  created_at: number;
}

export interface MaskField {
  mask_id: number;
  profile_field_id: number;
}

export interface Connection {
  id: number;
  connected_at: number;
  issuer: string;
  display_name: string;
  avatar_uri: string | null;
  raw_payload: string;
}

export interface ConnectionField {
  id: number;
  label: string;
  value: string;
  node_id: number;
}

export interface Annotation {
  id: number;
  connection_id: number;
  object_type_id: number;
  predicate_id: number;
  node_id: number;
  created_at: number;
}

export interface AnnotationField {
  id: number;
  type: string;
  label: string;
  value: string;
  created_at: number;
}
