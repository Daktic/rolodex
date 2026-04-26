use acir_field::FieldElement;
use bn254_blackbox_solver::poseidon2_permutation;
use serde::Serialize;
use sha3::{Digest, Keccak256};
use unicode_normalization::UnicodeNormalization;

const MAX_VALUE_BYTES: usize = 256;
const CHUNK_BYTES: usize = 31;
const VALUE_CHUNKS: usize = (MAX_VALUE_BYTES + CHUNK_BYTES - 1) / CHUNK_BYTES;
const TREE_DEPTH: usize = 8;
const TREE_WIDTH: usize = 1 << TREE_DEPTH; // 256 leaves

// TEST-ONLY: Fixed private key for reproducible spec test vectors.
// NEVER use this key for any real purpose. Real implementations must generate a fresh
const TEST_PRIVATE_KEY: &str =
    "0x0101010101010101010101010101010101010101010101010101010101010101";

// Fixed salt used ONLY for generating reproducible spec test vectors.
// In production, each leaf MUST use a unique, cryptographically random salt that is
// generated at issuance time and stored securely alongside the credential.
// Reusing or leaking the salt destroys the hiding property of the leaf commitment.
const TEST_SALT: &str = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

// TEST-ONLY: Fixed nonce for reproducible spec test vectors.
// In production, each ProofRequest MUST use a freshly CSPRNG-generated 32-byte nonce.
const TEST_NONCE: [u8; 32] = [0xabu8; 32];

// TEST-ONLY: Fixed verifier address for spec test vectors. Obviously fake (all-0x22).
const TEST_VERIFIER_ADDRESS: [u8; 20] = [0x22u8; 20];

// Fixed timestamp used ONLY for reproducibility. Real implementations use current unix seconds.
const TEST_TIMESTAMP: u64 = 1_700_000_000;

#[derive(Serialize)]
struct TestVectors {
    version: String,
    generated_at: String,
    generator_commit: String,
    vectors: Vectors,
}

#[derive(Serialize)]
struct Vectors {
    domain_constants: DomainConstants,
    empty_subtree_constants: EmptySubtreeConstants,
    field_name_encoding: Vec<FieldNameEncodingVector>,
    value_encoding: Vec<ValueEncodingVector>,
    leaf_hash: Vec<LeafHashVector>,
    merkle_tree: Vec<MerkleTreeVector>,
    signed_payload: Vec<SignedPayloadVector>,
    proof_request_digest: Vec<ProofRequestDigestVector>,
}

#[derive(Serialize)]
struct FieldNameEncodingVector {
    name: String,
    inputs: FieldNameEncodingInputs,
    outputs: FieldNameEncodingOutputs,
}

#[derive(Serialize)]
struct FieldNameEncodingInputs {
    field_name: String,
}

#[derive(Serialize)]
struct FieldNameEncodingOutputs {
    field_name_fe: HexField,
}

#[derive(Serialize)]
struct ValueEncodingVector {
    name: String,
    inputs: ValueEncodingInputs,
    outputs: ValueEncodingOutputs,
}

#[derive(Serialize)]
struct ValueEncodingInputs {
    value: String,
}

#[derive(Serialize)]
struct ValueEncodingOutputs {
    canonical_bytes: HexBytes,
    byte_length: usize,
    chunks: Vec<HexField>,
    value_commitment: HexField,
}

#[derive(Serialize)]
struct LeafHashVector {
    name: String,
    inputs: LeafHashInputs,
    outputs: LeafHashOutputs,
}

#[derive(Serialize)]
struct LeafHashInputs {
    field_name: String,
    value: String,
    salt: String,
}

#[derive(Serialize)]
struct LeafHashOutputs {
    field_name_fe: HexField,
    value_commitment: HexField,
    leaf: HexField,
}

#[derive(Serialize)]
struct MerkleTreeVector {
    name: String,
    inputs: MerkleTreeInputs,
    outputs: MerkleTreeOutputs,
}

#[derive(Serialize)]
struct MerkleTreeInputs {
    // Input order is intentionally unsorted to exercise the sort step.
    leaves: Vec<MerkleLeafInput>,
}

#[derive(Serialize)]
struct MerkleLeafInput {
    field_name: String,
    value: String,
    salt: String,
}

#[derive(Serialize)]
struct MerkleTreeOutputs {
    sorted_slots: Vec<SlotAssignment>,
    root: HexField,
    merkle_path: MerklePath,
}

#[derive(Serialize)]
struct SlotAssignment {
    slot_index: usize,
    field_name: String,
    leaf: HexField,
}

#[derive(Serialize)]
struct MerklePath {
    proved_field: String,
    slot_index: usize,
    // siblings[k] = sibling of the proved node at tree level k (0 = leaves, 7 = just below root).
    // Direction at level k: (slot_index >> k) & 1 == 0 means proved node is left child.
    siblings: Vec<HexField>,
}

#[derive(Serialize)]
struct SignedPayloadVector {
    name: String,
    inputs: SignedPayloadInputs,
    outputs: SignedPayloadOutputs,
}

#[derive(Serialize)]
struct SignedPayloadInputs {
    private_key: String,
    signed_subset: SignedSubsetInput,
}

#[derive(Serialize)]
struct SignedSubsetInput {
    version: String,
    root: HexField,
    revealed_names: Vec<String>,
    sender_address: String,
}

#[derive(Serialize)]
struct SignedPayloadOutputs {
    canonical_cbor: HexBytes,
    keccak256_digest: HexBytes,
    // 65 bytes: r(32) || s(32) || v(1), v ∈ {0, 1} (raw recovery id, not +27)
    signature: HexBytes,
    recovered_address: String,
}

#[derive(Serialize)]
struct ProofRequestDigestVector {
    name: String,
    inputs: ProofRequestData,
    outputs: ProofRequestDigestOutputs,
}

#[derive(Serialize)]
struct ProofRequestData {
    version: String,
    alice_root: HexField,
    alice_address: String,
    field_name: String,
    verifier_address: String,
    nonce: HexBytes,
    timestamp: u64,
    predicate_id: String,
    predicate_inputs: HexBytes,
}

#[derive(Serialize)]
struct ProofRequestDigestOutputs {
    canonical_cbor: HexBytes,
    // poseidon2_hash(pack_31_byte_chunks(canonical_cbor)) — a single Field element
    digest: HexField,
}

#[derive(Serialize)]
struct EmptySubtreeConstants {
    #[serde(rename = "ZERO_LEVEL_0")] zero_level_0: HexField,
    #[serde(rename = "ZERO_LEVEL_1")] zero_level_1: HexField,
    #[serde(rename = "ZERO_LEVEL_2")] zero_level_2: HexField,
    #[serde(rename = "ZERO_LEVEL_3")] zero_level_3: HexField,
    #[serde(rename = "ZERO_LEVEL_4")] zero_level_4: HexField,
    #[serde(rename = "ZERO_LEVEL_5")] zero_level_5: HexField,
    #[serde(rename = "ZERO_LEVEL_6")] zero_level_6: HexField,
    #[serde(rename = "ZERO_LEVEL_7")] zero_level_7: HexField,
}

#[derive(Serialize)]
struct DomainConstants {
    #[serde(rename = "DOMAIN_LEAF")]
    domain_leaf: HexField,
    #[serde(rename = "DOMAIN_NODE")]
    domain_node: HexField,
    #[serde(rename = "DOMAIN_VALUE")]
    domain_value: HexField,
    #[serde(rename = "ZERO_LEAF")]
    zero_leaf: HexField,
}

// So Field elements always serialize as 0x-prefixed hex
struct HexField([u8; 32]);

impl Serialize for HexField {
    fn serialize<S: serde::Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        s.serialize_str(&format!("0x{}", hex::encode(self.0)))
    }
}

struct HexBytes(Vec<u8>);

impl Serialize for HexBytes {
    fn serialize<S: serde::Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        s.serialize_str(&format!("0x{}", hex::encode(&self.0)))
    }
}

// Poseidon2 sponge hash (rate=3, capacity=1, state width=4).
// Each input is absorbed mod-rate; the state is permuted after each full chunk.
// The final incomplete chunk is zero-padded before the last permutation.
// Output is state[0] after all absorptions.
fn poseidon2_hash(inputs: &[FieldElement]) -> FieldElement {
    const RATE: usize = 3;
    let mut state = vec![FieldElement::zero(); 4];

    let mut chunks = inputs.chunks(RATE).peekable();
    while let Some(chunk) = chunks.next() {
        for (i, &v) in chunk.iter().enumerate() {
            state[i] += v;
        }
        state = poseidon2_permutation(&state, 4).expect("poseidon2 permutation failed");
    }

    state[0]
}

fn field_to_be_bytes(f: FieldElement) -> [u8; 32] {
    f.to_be_bytes().try_into().expect("field element must be 32 bytes")
}

// Right-align `chunk` (≤32 bytes) in a 32-byte buffer and interpret as a big-endian integer.
// Shared primitive used by domain_label_fe, field_name_to_fe, and pack_big_endian.
fn pack_chunk_to_fe(chunk: &[u8]) -> FieldElement {
    assert!(chunk.len() <= 32);
    let mut buf = [0u8; 32];
    buf[32 - chunk.len()..].copy_from_slice(chunk);
    FieldElement::from_be_bytes_reduce(&buf)
}

// Compute poseidon2_hash of a domain label string packed big-endian (§4.1, §6.1).
// Single source of truth — call this wherever a domain FieldElement is needed.
fn domain_label_fe(label: &str) -> FieldElement {
    let inputs: Vec<FieldElement> = label
        .as_bytes()
        .chunks(CHUNK_BYTES)
        .map(pack_chunk_to_fe)
        .collect();
    poseidon2_hash(&inputs)
}

fn domain_hash(label: &str) -> HexField {
    HexField(field_to_be_bytes(domain_label_fe(label)))
}

fn domain_leaf_constant() -> FieldElement {
    domain_label_fe("dexio.v1.leaf")
}

fn domain_node_constant() -> FieldElement {
    domain_label_fe("dexio.v1.node")
}

fn domain_value_constant() -> FieldElement {
    domain_label_fe("dexio.v1.value")
}

fn zero_leaf_constant() -> FieldElement {
    domain_label_fe("dexio.v1.zero_leaf")
}

fn compute_empty_subtree_constants() -> EmptySubtreeConstants {
    // §8.4: ZERO_LEVEL_0 = ZERO_LEAF; each higher level hashes the level below with itself.
    let domain_node = domain_node_constant();
    let levels: Vec<FieldElement> = std::iter::successors(
        Some(zero_leaf_constant()),
        |prev| Some(poseidon2_hash(&[domain_node, *prev, *prev])),
    )
    .take(8)
    .collect();

    EmptySubtreeConstants {
        zero_level_0: HexField(field_to_be_bytes(levels[0])),
        zero_level_1: HexField(field_to_be_bytes(levels[1])),
        zero_level_2: HexField(field_to_be_bytes(levels[2])),
        zero_level_3: HexField(field_to_be_bytes(levels[3])),
        zero_level_4: HexField(field_to_be_bytes(levels[4])),
        zero_level_5: HexField(field_to_be_bytes(levels[5])),
        zero_level_6: HexField(field_to_be_bytes(levels[6])),
        zero_level_7: HexField(field_to_be_bytes(levels[7])),
    }
}

fn compute_domain_constants() -> DomainConstants {
    let domain_leaf  = domain_hash("dexio.v1.leaf");
    let domain_node  = domain_hash("dexio.v1.node");
    let domain_value = domain_hash("dexio.v1.value");
    let zero_leaf    = domain_hash("dexio.v1.zero_leaf");

    DomainConstants { domain_leaf, domain_node, domain_value, zero_leaf }
}

// §6.1: pack_big_endian(utf8(field_name), CHUNK_BYTES)[0]
// Field names are ≤31 bytes (§4.1), so they always fit in a single field element.
pub fn field_name_to_fe(field_name: &str) -> FieldElement {
    assert!(field_name.len() <= CHUNK_BYTES, "field name exceeds {CHUNK_BYTES} bytes");
    pack_chunk_to_fe(field_name.as_bytes())
}

fn compute_field_name_encoding(name: &str, field_name: &str) -> FieldNameEncodingVector {
    FieldNameEncodingVector {
        name: name.to_string(),
        inputs: FieldNameEncodingInputs { field_name: field_name.to_string() },
        outputs: FieldNameEncodingOutputs {
            field_name_fe: HexField(field_to_be_bytes(field_name_to_fe(field_name))),
        },
    }
}

// Shared primitive used by compute_leaf_hash (for vectors) and compute_merkle_tree.
fn compute_leaf_fe(field_name: &str, value: &str, salt_hex: &str) -> FieldElement {
    let salt = pack_chunk_to_fe(
        &hex::decode(salt_hex.trim_start_matches("0x")).expect("invalid salt hex"),
    );
    let field_name_fe = field_name_to_fe(field_name);
    let canonical = canonicalize_value(value);
    assert!(canonical.len() <= MAX_VALUE_BYTES);
    let value_commitment = compute_value_commitment(
        canonical.len(),
        &pack_big_endian(&pad_to_max(&canonical)),
    );
    poseidon2_hash(&[domain_leaf_constant(), field_name_fe, value_commitment, salt])
}

// Build all TREE_DEPTH+1 levels of the tree from the full leaf array.
// levels[0] = 256 leaves, levels[TREE_DEPTH] = [root].
fn build_levels(leaves: &[FieldElement]) -> Vec<Vec<FieldElement>> {
    assert_eq!(leaves.len(), TREE_WIDTH);
    let domain_node = domain_node_constant();
    let mut levels = vec![leaves.iter().copied().collect::<Vec<_>>()];
    while levels.last().unwrap().len() > 1 {
        let next = levels.last().unwrap()
            .chunks(2)
            .map(|pair| poseidon2_hash(&[domain_node, pair[0], pair[1]]))
            .collect();
        levels.push(next);
    }
    levels
}

fn compute_merkle_tree(
    name: &str,
    leaf_inputs: &[(&str, &str, &str)], // (field_name, value, salt_hex) — unsorted
    prove_field: &str,
) -> MerkleTreeVector {
    // Sort slots by field_name ascending (§8.2).
    let mut sorted = leaf_inputs.to_vec();
    sorted.sort_by_key(|&(fname, _, _)| fname);

    let real_hashes: Vec<FieldElement> = sorted.iter()
        .map(|&(fname, val, salt)| compute_leaf_fe(fname, val, salt))
        .collect();

    // Fill 256-entry leaf array; empty slots hold ZERO_LEAF.
    let mut leaves = vec![zero_leaf_constant(); TREE_WIDTH];
    for (i, hash) in real_hashes.iter().enumerate() {
        leaves[i] = *hash;
    }

    let levels = build_levels(&leaves);
    let root = levels[TREE_DEPTH][0];

    let prove_slot = sorted.iter().position(|&(fname, _, _)| fname == prove_field)
        .expect("prove_field not in leaf_inputs");

    let siblings: Vec<HexField> = (0..TREE_DEPTH)
        .map(|lvl| HexField(field_to_be_bytes(levels[lvl][(prove_slot >> lvl) ^ 1])))
        .collect();

    MerkleTreeVector {
        name: name.to_string(),
        inputs: MerkleTreeInputs {
            leaves: leaf_inputs.iter().map(|&(fname, val, salt)| MerkleLeafInput {
                field_name: fname.to_string(),
                value: val.to_string(),
                salt: salt.to_string(),
            }).collect(),
        },
        outputs: MerkleTreeOutputs {
            sorted_slots: sorted.iter().enumerate().map(|(i, &(fname, _, _))| SlotAssignment {
                slot_index: i,
                field_name: fname.to_string(),
                leaf: HexField(field_to_be_bytes(real_hashes[i])),
            }).collect(),
            root: HexField(field_to_be_bytes(root)),
            merkle_path: MerklePath {
                proved_field: prove_field.to_string(),
                slot_index: prove_slot,
                siblings,
            },
        },
    }
}

fn compute_leaf_hash(name: &str, field_name: &str, value: &str, salt_hex: &str) -> LeafHashVector {
    let salt_bytes = hex::decode(salt_hex.trim_start_matches("0x")).expect("invalid salt hex");
    let salt = pack_chunk_to_fe(&salt_bytes);

    let field_name_fe = field_name_to_fe(field_name);
    let ffe = &field_name_fe;
    let value_commitment = {
        let canonical = canonicalize_value(value);
        assert!(canonical.len() <= MAX_VALUE_BYTES);
        let chunks = pack_big_endian(&pad_to_max(&canonical));
        compute_value_commitment(canonical.len(), &chunks)
    };
    let vfe = &value_commitment;
    let leaf = poseidon2_hash(&[domain_leaf_constant(), *ffe, *vfe, salt]);

    LeafHashVector {
        name: name.to_string(),
        inputs: LeafHashInputs {
            field_name: field_name.to_string(),
            value: value.to_string(),
            salt: salt_hex.to_string(),
        },
        outputs: LeafHashOutputs {
            field_name_fe: HexField(field_to_be_bytes(field_name_fe)),
            value_commitment: HexField(field_to_be_bytes(value_commitment)),
            leaf: HexField(field_to_be_bytes(leaf)),
        },
    }
}

fn canonicalize_value(s: &str) -> Vec<u8> {
    s.nfc().collect::<String>().into_bytes()
}

// Pack `bytes` (must be exactly MAX_VALUE_BYTES long) into VALUE_CHUNKS field elements.
// Each 31-byte chunk is right-aligned in a 32-byte buffer and read as a big-endian integer.
fn pack_big_endian(bytes: &[u8]) -> Vec<FieldElement> {
    assert_eq!(bytes.len(), MAX_VALUE_BYTES, "input must be exactly {MAX_VALUE_BYTES} bytes");
    let out: Vec<FieldElement> = bytes.chunks(CHUNK_BYTES).map(pack_chunk_to_fe).collect();
    assert_eq!(out.len(), VALUE_CHUNKS);
    out
}

fn pad_to_max(bytes: &[u8]) -> Vec<u8> {
    let mut out = bytes.to_vec();
    out.resize(MAX_VALUE_BYTES, 0);
    out
}

fn compute_value_commitment(byte_length: usize, chunks: &[FieldElement]) -> FieldElement {
    let mut inputs = Vec::with_capacity(2 + chunks.len());
    inputs.push(domain_value_constant());
    inputs.push(FieldElement::try_from(byte_length as u128).unwrap());
    inputs.extend_from_slice(chunks);
    poseidon2_hash(&inputs)
}

fn compute_value_encoding(name: &str, raw: &str) -> ValueEncodingVector {
    let canonical = canonicalize_value(raw);
    assert!(canonical.len() <= MAX_VALUE_BYTES, "test input exceeds MAX_VALUE_BYTES");

    let byte_length = canonical.len();
    let padded = pad_to_max(&canonical);
    let chunks = pack_big_endian(&padded);
    let value_commitment = compute_value_commitment(byte_length, &chunks);

    ValueEncodingVector {
        name: name.to_string(),
        inputs: ValueEncodingInputs { value: raw.to_string() },
        outputs: ValueEncodingOutputs {
            canonical_bytes: HexBytes(canonical),
            byte_length,
            chunks: chunks.iter().map(|f| HexField(field_to_be_bytes(*f))).collect(),
            value_commitment: HexField(field_to_be_bytes(value_commitment)),
        },
    }
}

// Encode ProofRequest as canonical CBOR (RFC 8949 §4.2).
// Key sort order (bytewise-encoded-key):
//   nonce(5) < version(7) < timestamp(9) < alice_root(10) = field_name(10 → 'a'<'f')
//   < predicate_id(12) < alice_address(13) < predicate_inputs(16,'p') < verifier_address(16,'v')
fn canonical_cbor_proof_request(
    version: &str,
    alice_root: &[u8; 32],
    alice_address: &[u8; 20],
    field_name: &str,
    verifier_address: &[u8; 20],
    nonce: &[u8; 32],
    timestamp: u64,
    predicate_id: &str,
    predicate_inputs: &[u8],
) -> Vec<u8> {
    use ciborium::value::{Integer, Value};
    let map = Value::Map(vec![
        (Value::Text("nonce".into()),             Value::Bytes(nonce.to_vec())),
        (Value::Text("version".into()),           Value::Text(version.into())),
        (Value::Text("timestamp".into()),         Value::Integer(Integer::from(timestamp as u32))),
        (Value::Text("alice_root".into()),        Value::Bytes(alice_root.to_vec())),
        (Value::Text("field_name".into()),        Value::Text(field_name.into())),
        (Value::Text("predicate_id".into()),      Value::Text(predicate_id.into())),
        (Value::Text("alice_address".into()),     Value::Bytes(alice_address.to_vec())),
        (Value::Text("predicate_inputs".into()),  Value::Bytes(predicate_inputs.to_vec())),
        (Value::Text("verifier_address".into()),  Value::Bytes(verifier_address.to_vec())),
    ]);
    let mut out = Vec::new();
    ciborium::ser::into_writer(&map, &mut out).expect("CBOR encoding failed");
    out
}

fn compute_proof_request_digest(name: &str) -> ProofRequestDigestVector {
    // Reuse the same root and alice_address as the signed payload for end-to-end coherence.
    let root_bytes = {
        let sorted = [
            ("company", "Acme Corp",         TEST_SALT),
            ("email",   "alice@example.com", TEST_SALT),
            ("name",    "Alice",             TEST_SALT),
        ];
        let real_hashes: Vec<FieldElement> = sorted.iter()
            .map(|&(f, v, s)| compute_leaf_fe(f, v, s))
            .collect();
        let mut leaves = vec![zero_leaf_constant(); TREE_WIDTH];
        for (i, hash) in real_hashes.iter().enumerate() { leaves[i] = *hash; }
        let levels = build_levels(&leaves);
        field_to_be_bytes(levels[TREE_DEPTH][0])
    };

    let pk_bytes: [u8; 32] = hex::decode(TEST_PRIVATE_KEY.trim_start_matches("0x"))
        .unwrap().try_into().unwrap();
    let signing_key = k256::ecdsa::SigningKey::from_slice(&pk_bytes).unwrap();
    let alice_address = eth_address_from_signing_key(&signing_key);

    let predicate_inputs = b"example.com"; // domain equality target for "domain_eq.v1"

    let cbor_bytes = canonical_cbor_proof_request(
        "dexio.v1",
        &root_bytes,
        &alice_address,
        "email",
        &TEST_VERIFIER_ADDRESS,
        &TEST_NONCE,
        TEST_TIMESTAMP,
        "domain_eq.v1",
        predicate_inputs,
    );

    // Digest = poseidon2_hash over 31-byte-packed CBOR chunks (§9.2.2)
    let fes: Vec<FieldElement> = cbor_bytes.chunks(CHUNK_BYTES).map(pack_chunk_to_fe).collect();
    let digest = poseidon2_hash(&fes);

    ProofRequestDigestVector {
        name: name.to_string(),
        inputs: ProofRequestData {
            version: "dexio.v1".to_string(),
            alice_root: HexField(root_bytes),
            alice_address: format!("0x{}", hex::encode(alice_address)),
            field_name: "email".to_string(),
            verifier_address: format!("0x{}", hex::encode(TEST_VERIFIER_ADDRESS)),
            nonce: HexBytes(TEST_NONCE.to_vec()),
            timestamp: TEST_TIMESTAMP,
            predicate_id: "domain_eq.v1".to_string(),
            predicate_inputs: HexBytes(predicate_inputs.to_vec()),
        },
        outputs: ProofRequestDigestOutputs {
            canonical_cbor: HexBytes(cbor_bytes),
            digest: HexField(field_to_be_bytes(digest)),
        },
    }
}

// Encode SignedSubset as canonical CBOR (RFC 8949 §4.2).
// Map keys are in bytewise-encoded-key order: root(4) < version(7) < revealed_names(14) < sender_address(14).
fn canonical_cbor_signed_subset(
    version: &str,
    root: &[u8; 32],
    revealed_names: &[String],
    sender_address: &[u8; 20],
) -> Vec<u8> {
    use ciborium::value::Value;
    let map = Value::Map(vec![
        (Value::Text("root".into()),           Value::Bytes(root.to_vec())),
        (Value::Text("version".into()),        Value::Text(version.into())),
        (Value::Text("revealed_names".into()), Value::Array(
            revealed_names.iter().map(|n| Value::Text(n.clone())).collect(),
        )),
        (Value::Text("sender_address".into()), Value::Bytes(sender_address.to_vec())),
    ]);
    let mut out = Vec::new();
    ciborium::ser::into_writer(&map, &mut out).expect("CBOR encoding failed");
    out
}

fn eth_address_from_signing_key(signing_key: &k256::ecdsa::SigningKey) -> [u8; 20] {
    let pubkey = signing_key.verifying_key().to_encoded_point(false); // uncompressed
    let hash = Keccak256::digest(&pubkey.as_bytes()[1..]); // skip 0x04 prefix
    hash[12..].try_into().expect("keccak256 is 32 bytes")
}

fn compute_signed_payload(name: &str) -> SignedPayloadVector {
    // Use the three_fields Merkle root as an end-to-end realistic root value.
    let root_bytes = {
        let sorted = [
            ("company", "Acme Corp",         TEST_SALT),
            ("email",   "alice@example.com", TEST_SALT),
            ("name",    "Alice",             TEST_SALT),
        ];
        let real_hashes: Vec<FieldElement> = sorted.iter()
            .map(|&(f, v, s)| compute_leaf_fe(f, v, s))
            .collect();
        let mut leaves = vec![zero_leaf_constant(); TREE_WIDTH];
        for (i, hash) in real_hashes.iter().enumerate() { leaves[i] = *hash; }
        let levels = build_levels(&leaves);
        field_to_be_bytes(levels[TREE_DEPTH][0])
    };

    let pk_bytes: [u8; 32] = hex::decode(TEST_PRIVATE_KEY.trim_start_matches("0x"))
        .unwrap().try_into().unwrap();
    let signing_key = k256::ecdsa::SigningKey::from_slice(&pk_bytes).unwrap();
    let sender_address = eth_address_from_signing_key(&signing_key);

    let version = "dexio.v1";
    let revealed_names = vec!["email".to_string()];

    let cbor_bytes = canonical_cbor_signed_subset(version, &root_bytes, &revealed_names, &sender_address);
    let digest: [u8; 32] = Keccak256::digest(&cbor_bytes).into();

    let (sig, recid) = signing_key.sign_prehash_recoverable(&digest).unwrap();
    let mut full_sig = [0u8; 65];
    full_sig[..64].copy_from_slice(&sig.to_bytes());
    full_sig[64] = recid.to_byte();

    let recovered_address = {
        let recovered_vk = k256::ecdsa::VerifyingKey::recover_from_prehash(
            &digest, &sig, recid,
        ).unwrap();
        let pubkey = recovered_vk.to_encoded_point(false);
        let hash = Keccak256::digest(&pubkey.as_bytes()[1..]);
        let addr: [u8; 20] = hash[12..].try_into().unwrap();
        addr
    };
    assert_eq!(sender_address, recovered_address, "recovered address must match sender_address");

    SignedPayloadVector {
        name: name.to_string(),
        inputs: SignedPayloadInputs {
            private_key: TEST_PRIVATE_KEY.to_string(),
            signed_subset: SignedSubsetInput {
                version: version.to_string(),
                root: HexField(root_bytes),
                revealed_names: revealed_names.clone(),
                sender_address: format!("0x{}", hex::encode(sender_address)),
            },
        },
        outputs: SignedPayloadOutputs {
            canonical_cbor: HexBytes(cbor_bytes),
            keccak256_digest: HexBytes(digest.to_vec()),
            signature: HexBytes(full_sig.to_vec()),
            recovered_address: format!("0x{}", hex::encode(recovered_address)),
        },
    }
}

fn main() {
    // Get the current git commit hash at runtime
    let git_shaw = String::from_utf8(
        std::process::Command::new("git")
            .args(["rev-parse", "HEAD"])
            .output()
            .unwrap()
            .stdout
    ).unwrap().trim().to_string();


    let vectors = TestVectors {
        version: "dexio.v1".to_string(),
        generated_at: chrono::Utc::now().to_rfc3339(),
        generator_commit: git_shaw,
        vectors: Vectors {
            domain_constants: compute_domain_constants(),
            empty_subtree_constants: compute_empty_subtree_constants(),
            field_name_encoding: vec![
                compute_field_name_encoding("short", "email"),
                compute_field_name_encoding("boundary_31", "a_31_byte_field_name_exactly_xx"),
            ],
            leaf_hash: vec![
                compute_leaf_hash("simple",       "email",       "alice@example.com", TEST_SALT),
                compute_leaf_hash("unicode_value", "name",        "cafe\u{0301}",      TEST_SALT),
                compute_leaf_hash("empty_value",  "middle_name", "",                  TEST_SALT),
            ],
            merkle_tree: vec![
                compute_merkle_tree("single_leaf", &[
                    ("email", "alice@example.com", TEST_SALT),
                ], "email"),
                // Inputs deliberately out of alphabetical order to exercise sorting.
                compute_merkle_tree("three_fields", &[
                    ("name",    "Alice",            TEST_SALT),
                    ("company", "Acme Corp",        TEST_SALT),
                    ("email",   "alice@example.com", TEST_SALT),
                ], "email"),
            ],
            signed_payload: vec![
                compute_signed_payload("three_fields_reveal_email"),
            ],
            proof_request_digest: vec![
                compute_proof_request_digest("domain_eq_email"),
            ],
            value_encoding: vec![
                compute_value_encoding("short_ascii", "hello"),
                compute_value_encoding("single_byte", "a"),
                // NFD form ("e" + combining acute U+0301) — must normalize to NFC "café"
                compute_value_encoding("unicode_nfc", "cafe\u{0301}"),
                compute_value_encoding("max_length_ascii", &"a".repeat(MAX_VALUE_BYTES)),
                compute_value_encoding("empty", ""),
            ],
        },
    };

    let json = serde_json::to_string_pretty(&vectors).unwrap();

    let out_path = std::env::args().nth(1).unwrap_or_else(|| "../test_vectors.json".to_string());
    std::fs::write(&out_path, &json).unwrap_or_else(|e| panic!("failed to write {out_path}: {e}"));
    eprintln!("wrote {out_path}");
}