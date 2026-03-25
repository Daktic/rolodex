# Architecture

This document describes the high-level architecture of the Rolodex mobile application.

---

## Design Principles

**Local-first**
All user data lives on device. No remote servers, no cloud sync. The user owns their data.

**Privacy by default**
Connections are known only to the two parties involved. No telemetry, no analytics, no tracking.

**Protocol-driven**
The exchange protocol is versioned and designed for future extensibility. The app is one implementation of the protocol.

**Verifiable**
Every exchange is cryptographically signed and can be proven authentic.

---

## System Layers

### Presentation Layer
User-facing screens and UI components.

**Screens** (top-level navigation destinations)
- Onboarding / Profile Setup
- My Card (user's shareable profile)
- Connections List
- Connection Detail (received card + annotations)
- Settings

**Components**
- Common: Reusable UI primitives (buttons, inputs, cards)
- Screen-specific: Components used within a single screen context

**Navigation**
Stack-based navigation with React Navigation. Screens map to user flows (onboarding � my card � connections).

---

### Application Layer
Business logic, state management, and coordination between UI and protocol/storage layers.

**State Management**
- Profile state (user's identity, shareable fields)
- Connections state (received cards, annotations)
- UI state (modals, selection, navigation)

**Hooks**
Custom React hooks encapsulate domain logic:
- `useProfile()`  Manage user's profile and fields
- `useWallet()`  Access cryptographic identity
- `useConnections()`  Query and annotate connections
- `useExchange()`  Coordinate NFC/QR exchange flow

**Services**
Pure TypeScript modules (no React dependencies):
- `crypto.ts`  Keypair generation, signing, verification
- `exchange.ts`  Payload encoding/decoding, exchange coordination
- `db.ts`  SQLite queries and schema management
- `validation.ts`  Payload validation, schema checks

---

### Protocol Layer
The exchange protocol, signing, and transport mechanisms.

#### Exchange Protocol

**Payload Format**
```typescript
{
  schema_version: number       // Protocol version
  issuer: string               // Sender's public key
  recipient: string            // Receiver's public key
  timestamp: number            // Unix timestamp
  nonce: string                // Session identifier
  fields: Record<string, any>  // Dynamic key-value pairs (includes avatar as base64 if present)
  signature: string            // Cryptographic signature
}
```

**Schema Versioning**
- `schema_version` is declared in every payload
- Version 1 supports basic key-value fields
- Future versions can introduce new top-level keys (e.g., `extensions`, `attestations`)
- Clients must validate version before parsing to ensure compatibility

**Extensibility**
By design, the protocol supports forward compatibility:
- Unknown fields in `fields` are preserved but not rendered
- Future schema versions can add top-level keys without breaking v1 clients
- Clients should gracefully degrade when encountering unknown schema versions

#### Exchange Flow

The exchange is a synchronous, bidirectional handshake. Both parties must be present and actively participating.

**Flow (NFC/QR agnostic)**
1. **Initiation**: One party initiates the exchange (generates payload, encodes for transport)
2. **Negotiation**: Devices detect each other and agree on transport mechanism
3. **Exchange**: Both parties transmit signed payloads
4. **Verification**: Both parties verify received signatures
5. **Confirmation**: Both parties store the connection locally

**Transport mechanisms:**
- **NFC**: Simultaneous bidirectional exchange (if supported) or oscillating read/write
- **QR**: One party displays QR, other scans; then reverse

The exchange layer abstracts transport details. The application layer sees:
```typescript
async function initiateExchange(myPayload: SignedPayload): Promise<SignedPayload>
```

#### Cryptographic Identity

Each user has an EVM-compatible keypair (secp256k1).
- Private key stored securely on device (encrypted storage)
- Public key (address) serves as user's identity anchor
- All payloads signed with private key using EIP-712 or raw message signing

**Libraries**: viem (lightweight, modern, TypeScript-native)

---

### Storage Layer
Local SQLite database. All data is stored on device.

**Schema**
```sql
-- User's profile
CREATE TABLE profile (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_uri TEXT,             -- Local file path to avatar image
  created_at INTEGER NOT NULL
);

CREATE TABLE profile_fields (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  share_by_default INTEGER NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profile(id)
);

-- Masks (selective field sharing presets)
CREATE TABLE masks (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profile(id)
);

CREATE TABLE mask_fields (
  mask_id TEXT NOT NULL,
  profile_field_id TEXT NOT NULL,
  PRIMARY KEY (mask_id, profile_field_id),
  FOREIGN KEY (mask_id) REFERENCES masks(id),
  FOREIGN KEY (profile_field_id) REFERENCES profile_fields(id)
);

-- Connections (received cards)
CREATE TABLE connections (
  id TEXT PRIMARY KEY,
  connected_at INTEGER NOT NULL,
  issuer TEXT NOT NULL,           -- Their public key
  display_name TEXT NOT NULL,
  avatar_uri TEXT,                -- Local file path to their avatar image
  raw_payload TEXT NOT NULL        -- Store full signed payload for verification
);

CREATE TABLE connection_fields (
  id TEXT PRIMARY KEY,
  connection_id TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  FOREIGN KEY (connection_id) REFERENCES connections(id)
);

-- Annotations (CRM layer)
CREATE TABLE annotations (
  id TEXT PRIMARY KEY,
  connection_id TEXT NOT NULL,
  type TEXT NOT NULL,              -- 'person' | 'company' | 'event' | 'relationship' | 'note'
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (connection_id) REFERENCES connections(id)
);
```

**Storage abstraction**
All database operations are encapsulated in `db.ts`. The application layer never writes raw SQL.

**Design Principles**
- Domain-specific functions over generic CRUD for type safety and clarity
- Singleton database instance managed internally
- Automatic create-or-update logic (upsert pattern)
- Migration support for schema evolution
- Avatar images stored as file paths (not blobs) for performance

**ID Strategy**
- Profile/Connection IDs: Cryptographic public keys (enables signature verification)
- All other entities: UUIDs (deterministic, offline-first compatible)
- No autoincrement (breaks in distributed/offline scenarios)

---

## Data Flow

**Profile creation (onboarding)**
1. User inputs display name and initial fields
2. App generates keypair, stores private key securely
3. Profile and fields written to SQLite
4. Avatar stored in filesystem, URI saved to profile
5. User navigates to My Card screen

**Connection exchange**
1. User selects fields to share (and optionally avatar)
2. If avatar selected, encode to base64 and include in fields
3. App generates signed payload (application layer calls `crypto.ts`)
4. `exchange.ts` encodes payload for NFC/QR transport
5. Exchange flow coordinates with other device
6. Received payload is verified (`crypto.ts`)
7. If payload contains avatar, decode base64 and save to filesystem
8. Connection stored in SQLite with avatar file path (`db.ts`)
9. UI updates to show new connection

**Annotation**
1. User views connection detail
2. User adds annotation (e.g., "Works at Acme Corp")
3. Annotation saved to SQLite, linked to connection
4. UI reflects updated graph

**Data Persistence**
- Components load from storage on mount, write on change
- Database initialized once at app startup
- All data persists across app restarts

---

## Extension Points

**Custom field types**
The protocol's `fields` object is untyped. Applications can define custom field semantics (e.g., `pgp_key`, `nostr_pubkey`) and render them appropriately. Unknown fields are preserved but not displayed.

**Future protocol versions**
- `schema_version: 2` could add `extensions: {...}` for third-party metadata
- `schema_version: 3` could add `attestations: [...]` for signed claims from external parties
- Clients check version, parse what they understand, ignore what they don't

**Public nodes (future)**
Events/organizations publish a public identity (just a public key). Users reference this when annotating connections. This requires:
- A registry or discovery mechanism (could be on-chain, could be a public JSON file)
- An `annotations` type like `event` that references external identities

**ZK proofs (future)**
The protocol must support proving individual field values without revealing the full connection payload. This requires:
- Merkle tree structure over payload fields (enables proving "email is X" without revealing other fields)
- SNARK circuit for selective disclosure
- Verifier contract or off-chain verifier

**Design requirement**: The signing and storage mechanism in v1 must be compatible with future ZK implementations. Consider storing a merkle root alongside the signed payload, or structuring the signature to allow field-level proofs.

This is research territory and not part of v1, but v1 should not preclude it.

---

## Technology Stack

**Framework**: Expo (React Native, TypeScript)
**Navigation**: React Navigation (stack + tab)
**State**: React Context or Zustand (start simple)
**Database**: expo-sqlite or op-sqlite
**Crypto**: viem (EVM keypairs, signing)
**NFC**: react-native-nfc-manager
**QR**: react-native-qrcode-svg + react-native-camera
**Standards**: W3C Verifiable Credentials (payload envelope)

---

## Open Questions

**Exchange transport**
- NFC bidirectional support varies by device (Android better than iOS)
- May need to implement oscillating read/write or fallback to QR
- Need to test on real hardware early

**Key storage**
- Expo SecureStore for encrypted private key storage
- Biometric unlock optional

**Backup/recovery**
- Phase 1: no backup (local-only, user warned)
- Future: social recovery wallet (M-of-N guardians can help recover keypair)

**Multi-device**
- Not in scope for v1
- Future: encrypted sync between user's devices

**Public profile attestation**
- Future: Allow users to optionally publish their profile to EAS (Ethereum Attestation Service) or as an NFT
- Enables identity verification via on-chain footprint (e.g., "This wallet has a public profile with X followers/attestations")
- Profile can be minimal (just public key) or include optional aesthetic elements (avatar, display name, collectible card design)
- Does not reveal connection graph, only the user's chosen public identity
- Useful for reputation systems, verification at events, or tradeable digital business cards

---

## Non-Goals (v1)

- Remote server or backend
- Cloud sync
- Import/export (beyond viewing raw payload)
- multi-device support
- Analytics or telemetry
- Monetization features
