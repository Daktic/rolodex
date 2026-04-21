# Dexio ZK Protocol Specification

**Version:** `dexio.v1`
**Status:** Draft
**Scope:** Canonical cryptographic commitments for Dexio contact exchanges.

## 1. Background

Dexio commits to contact field values at exchange time so that either party may later prove properties of committed values, revealed or hidden, without necessarily disclosing the values themselves. This document defines the cryptographic primitives, encodings, and data structures that all Dexio commitments and proofs MUST conform to. Changes to this specification require a version bump; prior versions remain independently verifiable.

## 2. Cryptographic parameters

| Parameter | Value |
|---|---|
| Curve | BN254 (alt_bn128) |
| Scalar field order | `p = 21888242871839275222246405745257275088548364400416034343698204186575808495617` |
| Hash function | Poseidon2 over BN254 scalar field, Noir default parameters |
| Signature scheme | secp256k1 with ECDSA recoverable signatures (EVM-compatible) |
| Field element size | 254 bits, represented as 32 bytes big-endian |

## 3. Domain separation

All hashes MUST include a domain constant as their first input. Domain constants are derived from versioned UTF-8 strings:

```
DOMAIN_LEAF   = poseidon_hash(utf8("dexio.v1.leaf"))
DOMAIN_NODE   = poseidon_hash(utf8("dexio.v1.node"))
DOMAIN_VALUE  = poseidon_hash(utf8("dexio.v1.value"))
ZERO_LEAF     = poseidon_hash(utf8("dexio.v1.zero_leaf"))
```

The version substring (`dexio.v1`) is load-bearing. A future `dexio.v2` specification produces distinct domain constants and therefore cryptographically separate commitment spaces.

Implementations MUST pin these constants as hex Field element values in code and verify they reproduce the expected outputs at initialization.

## 4. Canonicalization

### 4.1 Field names

Field names are ASCII-only strings with the following constraints:

- Lowercase `[a-z0-9_]` only
- No whitespace, no punctuation other than underscore
- Maximum 31 bytes (fits in one Field element after UTF-8 encoding)
- No namespace prefix required at the protocol layer

Application-layer canonicalization (aliasing, type mapping) is OUT OF SCOPE.

### 4.2 Field values

Field values are arbitrary Unicode strings, canonicalized as:

- Unicode NFC normalization
- UTF-8 encoding
- No trimming, case-folding, or field-specific canonicalization at the protocol layer

Application-layer value canonicalization (e.g., E.164 phone formatting, email lowercasing) is OUT OF SCOPE and occurs before protocol encoding.

## 5. Value encoding

### 5.1 Constants

| Constant | Value |
|---|---|
| `MAX_VALUE_BYTES` | 256 |
| `CHUNK_BYTES` | 31 |
| `VALUE_CHUNKS` | 9 (`ceil(MAX_VALUE_BYTES / CHUNK_BYTES)`) |

### 5.2 Procedure

Given a canonicalized UTF-8 byte string `bytes` of length `L`:

1. REJECT if `L > MAX_VALUE_BYTES`.
2. Right-pad `bytes` with `0x00` to exactly `MAX_VALUE_BYTES` length, producing `padded`.
3. Split `padded` into `VALUE_CHUNKS` contiguous groups of `CHUNK_BYTES` bytes.
4. Interpret each group as a big-endian unsigned integer to produce `chunks: [Field; VALUE_CHUNKS]`.
5. Compute:

```
value_commitment = poseidon([DOMAIN_VALUE, L, chunks[0], ..., chunks[8]])
```

The actual byte length `L` is committed alongside the padded chunks to prevent padding ambiguity.

## 6. Leaf construction

### 6.1 Leaf hash

```
field_name_fe = pack_big_endian(utf8(field_name), CHUNK_BYTES)[0]

leaf = poseidon([DOMAIN_LEAF, field_name_fe, value_commitment, salt])
```

Field name fits in one Field element per §4.1.

### 6.2 Unused slots

Slots not occupied by a real field contain the constant `ZERO_LEAF` defined in §3. Unused slots have no associated value or salt.

## 7. Salt

### 7.1 Properties

- One independent salt per real leaf
- Salt is one Field element (254 bits)
- Salts MUST NOT be derived from other salts, field values, or any deterministic source

### 7.2 Generation

1. Obtain 32 random bytes from a cryptographically secure RNG provided by the host platform.
2. Interpret as a big-endian unsigned integer.
3. Reduce modulo the BN254 scalar field order `p` (§2).

Implementations SHOULD use platform CSPRNGs (`/dev/urandom`, `SecRandomCopyBytes`, `java.security.SecureRandom`, or equivalent).

### 7.3 Storage

Salts are persisted locally by the sender alongside the value (§11). Salts MUST NOT appear in the exchange payload for hidden fields. Salts for revealed fields are included in the corresponding reveal record (§10.2).

## 8. Merkle tree

### 8.1 Structure

| Parameter | Value |
|---|---|
| Tree type | Binary Merkle tree |
| Depth | 8 |
| Leaf capacity | 256 |
| Arity | 2 |

One tree is constructed per exchange. Trees are ephemeral and are not accumulated across exchanges.

### 8.2 Leaf ordering

Real leaves are placed in slots in ascending order of canonicalized `field_name` (§4.1), starting at slot 0. Slots beyond the last real leaf contain `ZERO_LEAF`.

A leaf's `slot_index` is a uint8 (`0..=255`) equal to its position in this ordering.

### 8.3 Internal nodes

For a node at level `L` with children at positions `2i` (left) and `2i+1` (right) at level `L-1`:

```
node = poseidon([DOMAIN_NODE, left_child, right_child])
```

Left (even index) is always the first operand; right (odd index) is always the second.

### 8.4 Empty subtree constants

Implementations MUST pin these constants and MUST use them to short-circuit empty subtrees during tree construction:

```
ZERO_LEVEL_0 = ZERO_LEAF
ZERO_LEVEL_1 = poseidon([DOMAIN_NODE, ZERO_LEVEL_0, ZERO_LEVEL_0])
ZERO_LEVEL_2 = poseidon([DOMAIN_NODE, ZERO_LEVEL_1, ZERO_LEVEL_1])
ZERO_LEVEL_3 = poseidon([DOMAIN_NODE, ZERO_LEVEL_2, ZERO_LEVEL_2])
ZERO_LEVEL_4 = poseidon([DOMAIN_NODE, ZERO_LEVEL_3, ZERO_LEVEL_3])
ZERO_LEVEL_5 = poseidon([DOMAIN_NODE, ZERO_LEVEL_4, ZERO_LEVEL_4])
ZERO_LEVEL_6 = poseidon([DOMAIN_NODE, ZERO_LEVEL_5, ZERO_LEVEL_5])
ZERO_LEVEL_7 = poseidon([DOMAIN_NODE, ZERO_LEVEL_6, ZERO_LEVEL_6])
```

Test vectors for these constants are tracked separately (§13).

### 8.5 Merkle path

A Merkle inclusion path for a leaf at `slot_index` consists of:

```
siblings:   [Field; 8]     // sibling hash at each level, bottom up
directions: [bool; 8]      // direction bit at each level; bit L = (slot_index >> L) & 1
```

Direction bit semantics: `0` means the leaf is the left child at that level, `1` means the leaf is the right child.

Merkle paths are NOT persisted. They are derived on demand from the stored leaf set (§11.1).

## 9. Verification

### 9.1 Revealed fields (Merkle inclusion)

Given a reveal record (§10.2) and a root, a verifier:

1. Reconstructs `value_commitment` from `value` per §5.2.
2. Reconstructs `leaf` from `field_name`, `value_commitment`, and `salt` per §6.1.
3. For each level `L` in `0..8`:
   - If `directions[L] == 0`: `current = poseidon([DOMAIN_NODE, current, siblings[L]])`
   - If `directions[L] == 1`: `current = poseidon([DOMAIN_NODE, siblings[L], current])`
   - (initial `current` is `leaf`)
4. Accepts if and only if final `current == root`.

This verification is a plain Merkle inclusion proof, not a ZK proof. It requires the verifier to learn the value. Use §9.2 for proofs that must not reveal the value.

### 9.2 Hidden fields (ZK proof envelope)

This section defines the envelope for ZK proofs that assert properties of committed values without revealing them. Circuit-specific predicates (equality, domain membership, set membership, etc.) are OUT OF SCOPE and specified per circuit.

Every ZK proof produced under this specification MUST bind to a specific verifier and a specific freshness context via public inputs. This prevents proof transfer: a proof generated for Carol cannot be replayed by Carol to a third party as if the third party were the original verifier.

#### 9.2.1 Proof request

A verifier who wishes to receive a proof from a prover issues a proof request:

```
ProofRequest {
  version:           string         // "dexio.v1"
  alice_root:        Field          // the sender's Merkle root (§8)
  alice_address:     bytes20        // the sender's EVM address
  field_name:        string         // canonicalized per §4.1
  verifier_address:  bytes20        // the verifier's EVM address
  nonce:             bytes32        // CSPRNG-generated per §7.2 (32 bytes)
  timestamp:         uint64         // unix seconds at request issuance
  predicate_id:      string         // circuit identifier, e.g. "domain_eq.v1"
  predicate_inputs:  bytes          // circuit-specific public parameters
}
```

#### 9.2.2 Proof structure

```
Proof {
  request:      ProofRequest        // echoed verbatim; also the proof's public inputs
  proof_bytes:  bytes               // Noir-generated proof
}
```

The proof's public inputs MUST include every field of `ProofRequest` in canonical order. Implementations hash the ProofRequest into a single Field-element digest (`poseidon` over the CBOR-canonical encoding) and pass that digest as a public input to the circuit, which internally reproduces the hash from the individual fields. Either approach is conformant, provided the circuit enforces equality between the claimed public inputs and the verifier-supplied `ProofRequest`.

#### 9.2.3 Circuit obligations

Every proof-generating circuit under this specification MUST enforce:

1. The leaf reconstruction: `leaf = poseidon([DOMAIN_LEAF, field_name_fe, value_commitment, salt])` where `field_name_fe` is derived from `request.field_name` per §6.1.
2. Merkle inclusion: the witnessed `(siblings, directions)` demonstrates `leaf` is in the tree rooted at `request.alice_root`.
3. Sender authentication: `request.alice_address` matches the address recoverable from a signature witness over `request.alice_root`, using the scheme in §10.3.
4. The predicate identified by `request.predicate_id`, parameterized by `request.predicate_inputs`, holds over the witnessed value.
5. All fields of `request` are bound as public inputs (either directly or via digest, per §9.2.2).

#### 9.2.4 Verifier obligations

A verifier receiving a `Proof` MUST:

1. Reject if `proof.request.verifier_address` does not match the verifier's own address.
2. Reject if `proof.request.timestamp` is older than `PROOF_MAX_AGE_SECONDS` (300) or newer than the current time plus `PROOF_CLOCK_SKEW_SECONDS` (60).
3. Reject if `proof.request.nonce` has been seen before within the staleness window (nonce cache).
4. Reject if `proof.request.version` does not match the verifier's supported version.
5. Verify `proof.proof_bytes` against the public inputs derived from `proof.request`.
6. Accept if and only if all checks pass.

The verifier's nonce cache SHOULD retain entries for at least `PROOF_MAX_AGE_SECONDS`.

#### 9.2.5 Properties

- **Verifier binding**: a proof is cryptographically valid only when its `verifier_address` matches the verifying party. Forwarding a proof to a different verifier fails at step 1 of §9.2.4.
- **Freshness**: `nonce` and `timestamp` prevent replay of prior proofs.
- **Witness transferability is unchanged**: this envelope prevents *proof* transfer, not *witness* transfer. A prover who shares the raw `(value, salt, merkle_path)` with another party enables that party to generate their own proofs. Non-transferable witnesses are OUT OF SCOPE.

## 10. Exchange payload

### 10.1 Schema

```
ExchangePayload {
  version:        string            // "dexio.v1"
  root:           Field             // Merkle root (§8)
  revealed:       [RevealRecord]    // 0 or more
  sender_address: bytes20           // EVM address of the sender
  signature:      bytes65           // secp256k1 recoverable signature
}
```

### 10.2 Reveal record

```
RevealRecord {
  field_name:  string              // canonicalized per §4.1
  value:       string              // canonicalized per §4.2
  salt:        Field
  slot_index:  uint8
  merkle_path: {
    siblings:   [Field; 8]
    directions: [bool; 8]
  }
}
```

### 10.3 Signature

The signature is computed as:

```
message_digest = keccak256(canonical_cbor(SignedSubset))
signature      = secp256k1_ecdsa_sign_recoverable(signer_private_key, message_digest)
```

Where `SignedSubset` is:

```
SignedSubset {
  version:         string
  root:            Field
  revealed_names:  [string]         // field_names from revealed[], in payload order
  sender_address:  bytes20
}
```

The signature covers the root (which commits to all leaf values) and the revealed field names (preventing in-flight reveal tampering). Revealed values are not in the signature preimage because they are already committed by the root.

The signing scheme is plain secp256k1 ECDSA over a Keccak-256 digest (not EIP-191 or EIP-712), chosen for implementation simplicity. EIP-712 compatibility is OUT OF SCOPE for v1.

Verifiers MUST recover the signer address from the signature using `ecrecover`-equivalent logic and confirm it matches `sender_address`.

### 10.4 Wire format

Payloads are encoded using CBOR with deterministic encoding rules (RFC 8949, §4.2). Field elements are encoded as 32-byte big-endian binary strings.

### 10.5 Transport

Transport is out of scope. Payloads are self-contained. Payload size grows at approximately 340 bytes per revealed field plus approximately 200 bytes of fixed overhead; implementations are responsible for selecting a transport capable of carrying the required payload and for handling cases where a chosen transport (e.g., single-shot QR) cannot accommodate it.

## 11. Persistence

### 11.1 Sender

The sender persists, per exchange:

```
SenderExchangeRecord {
  id:                string
  timestamp:         uint64
  recipient_address: bytes20
  root:              Field
  leaves: [
    {
      slot_index:   uint8
      field_name:   string
      value:        string
      salt:         Field
      was_revealed: bool
    }
  ]                              // only real leaves; unused slots are not stored
  signature:         bytes65
}
```

Merkle paths and internal nodes are not persisted; they are derived on demand.

Persisted sender data is sensitive: loss of this data removes the sender's ability to generate future proofs about their own commitments. Backup strategy is application-layer and OUT OF SCOPE.

### 11.2 Recipient

The recipient persists, per exchange:

```
RecipientExchangeRecord {
  id:             string
  timestamp:      uint64
  sender_address: bytes20
  root:           Field
  revealed:       [RevealRecord]    // as received
  signature:      bytes65
}
```

Recipients do not persist hidden field data; none is received.

## 12. Versioning

The version string `dexio.v1` is embedded in every domain constant (§3). A future `dexio.v2` produces distinct constants and therefore distinct, incompatible commitments.

- v1 commitments remain verifiable indefinitely.
- Future versions MAY introduce new leaf types (e.g., blob leaves), new domain tags, or payload extensions.
- Future versions MUST NOT change the meaning of existing constants.
- The `version` field in `ExchangePayload` (§10.1) identifies the specification version governing that payload.

## 13. Test vectors

Test vectors for domain constants, empty subtree constants, a sample value encoding, a sample leaf, a sample Merkle root, a sample signed payload, and a sample ZK proof envelope (ProofRequest digest and verifier-binding check) are tracked in a follow-up issue. Implementations MUST pass all published test vectors before being considered spec-conformant.

## 14. Out of scope

The following are explicitly outside this specification:

- Transport mechanisms (NFC, QR, BLE, server relay)
- Application UX flows (reveal selection, scanning, confirmation)
- Key management (generation, rotation, recovery)
- Backup and restore strategy for persisted exchange data
- Application-layer value canonicalization (phone formatting, email normalization, etc.)
- Circuit implementations (Noir programs consuming these commitments)
- Circuit-specific predicates (domain equality, set membership, range proofs, etc.) for use with §9.2
- Blob fields, compound fields, or values exceeding `MAX_VALUE_BYTES`
- Attestations, relationship proofs, or any commitment type beyond the leaf type defined in §6
- Non-transferable witnesses (preventing witness resale by a recipient)
- EIP-191 or EIP-712 signing compatibility