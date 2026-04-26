use acir_field::FieldElement;
use bn254_blackbox_solver::poseidon2_permutation;
use serde::Serialize;
use unicode_normalization::UnicodeNormalization;

const MAX_VALUE_BYTES: usize = 256;
const CHUNK_BYTES: usize = 31;
const VALUE_CHUNKS: usize = (MAX_VALUE_BYTES + CHUNK_BYTES - 1) / CHUNK_BYTES;

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
    println!("{}", json);
}