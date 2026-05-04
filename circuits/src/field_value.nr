// Value encoding helpers and protocol constants for Dexio.
//
// This module is where we are building up the low-level, deterministic pieces
// needed by the circuit: protocol constants, byte packing rules, and tests
// against the published test vectors.
//
// We are intentionally implementing this in small steps so we can verify each
// piece of the spec independently before combining them into leaf hashing,
// Merkle verification, and proof-specific circuits.

pub global MAX_VALUE_BYTES: u32 = 256;
pub global CHUNK_BYTES: u32 = 31;
pub global VALUE_CHUNKS: u32 = 9;

// Domain separation constants pinned from the published test vectors.
//
// The spec requires these to be pinned as concrete Field values in code.
// Later, once Poseidon is working cleanly in Noir for this toolchain, we can
// add verification tests that recompute them from the versioned labels.
pub global DOMAIN_LEAF: Field =
    0x153b8a3467843421644905cfe5e191b78a92e8c8f1b0d4d7a15f45385fac7b5b;
pub global DOMAIN_NODE: Field =
    0x0f85b01ffd066d5b2bf7dd93e0b48e510507f45a0f41a535a94be8a4de39bc5d;
pub global DOMAIN_VALUE: Field =
    0x09414397eee804b030f997b616d64df0bdbe4ea9023894d429dbf089c8a437b6;
pub global ZERO_LEAF: Field =
    0x26890b4736acb92a52695dcb94e177c790a82b53a5876250cc8e473171d65768;

// First value-encoding rule from the spec: values longer than MAX_VALUE_BYTES
// are invalid and must be rejected before packing/hashing.
pub fn is_valid_value_length(length: u32) -> bool {
    length <= MAX_VALUE_BYTES
}

// Pack one 31-byte chunk into a Field using the canonical bytes_to_fes rule.
//
// The spec's rule is:
//
// - take 31 bytes
// - place them in the low-order 31 bytes of a 32-byte big-endian buffer
// - keep the high byte as 0x00
// - interpret the result as a big-endian integer
//
// In practice, iterating with acc = acc * 256 + byte produces exactly that
// integer value.
//
// This helper is the shared primitive for:
// - field-name packing
// - value chunk packing
// - later, any other bytes_to_fes-based conversions
pub fn pack_chunk(bytes: [u8; 31]) -> Field {
    let mut acc = 0 as Field;

    for i in 0..31 {
        acc = acc * 256 + bytes[i] as Field;
    }

    acc
}

// Field names use the exact same one-chunk packing rule as any other
// <=31-byte input. This wrapper exists mostly to make the call sites read
// like the protocol and to give us a stable place for future field-name-
// specific validation if we want it.
pub fn pack_field_name(bytes: [u8; 31]) -> Field {
    pack_chunk(bytes)
}

// Pack a value that has already been padded to MAX_VALUE_BYTES into the
// VALUE_CHUNKS field elements required by the spec.
//
// The spec says value encoding is:
//
// 1. canonicalize bytes
// 2. reject if length > MAX_VALUE_BYTES
// 3. right-pad to MAX_VALUE_BYTES
// 4. convert padded bytes via bytes_to_fes
//
// Because bytes_to_fes operates on 31-byte chunks, the final chunk count is 9.
// The last chunk may be only partially filled with real bytes and is then
// zero-padded to 31 bytes.
pub fn pack_padded_value(bytes: [u8; 256]) -> [Field; 9] {
    let mut chunks = [0 as Field; 9];

    for chunk_index in 0..9 {
        let mut chunk_bytes = [0; 31];

        for byte_index in 0..31 {
            let source_index = chunk_index * 31 + byte_index;

            chunk_bytes[byte_index] = if source_index < 256 {
                bytes[source_index]
            } else {
                0
            };
        }

        chunks[chunk_index] = pack_chunk(chunk_bytes);
    }

    chunks
}

#[test]
fn test_field_value_constants() {
    assert(MAX_VALUE_BYTES == 256);
    assert(CHUNK_BYTES == 31);
    assert(VALUE_CHUNKS == 9);
}

// These assertions make sure the pinned constants in code still match the
// published vectors. If one changes unexpectedly, we want a loud failure.
#[test]
fn test_domain_constants_are_pinned() {
    assert(
        DOMAIN_LEAF
            == 0x153b8a3467843421644905cfe5e191b78a92e8c8f1b0d4d7a15f45385fac7b5b
    );
    assert(
        DOMAIN_NODE
            == 0x0f85b01ffd066d5b2bf7dd93e0b48e510507f45a0f41a535a94be8a4de39bc5d
    );
    assert(
        DOMAIN_VALUE
            == 0x09414397eee804b030f997b616d64df0bdbe4ea9023894d429dbf089c8a437b6
    );
    assert(
        ZERO_LEAF
            == 0x26890b4736acb92a52695dcb94e177c790a82b53a5876250cc8e473171d65768
    );
}

#[test]
fn test_is_valid_value_length_accepts_max() {
    assert(is_valid_value_length(256));
}

#[test]
fn test_is_valid_value_length_accepts_under_max() {
    assert(is_valid_value_length(0));
    assert(is_valid_value_length(255));
}

#[test]
fn test_is_valid_value_length_rejects_over_max() {
    assert(!is_valid_value_length(257));
}

// All-zero input is a useful sanity check for the packing rule because the
// expected Field value is unambiguous.
#[test]
fn test_pack_chunk_all_zeroes() {
    let bytes = [0; 31];
    let packed = pack_chunk(bytes);

    assert(packed == 0);
}

// This checks the exact byte placement rule for a short input. The byte 0x61
// must appear immediately after the leading 0x00 byte in the 32-byte big-endian
// field representation.
#[test]
fn test_pack_chunk_single_byte_in_first_position() {
    let mut bytes = [0; 31];
    bytes[0] = 0x61;

    let packed = pack_chunk(bytes);

    assert(
        packed
            == 0x0061000000000000000000000000000000000000000000000000000000000000
    );
}

// This mirrors the "email" field-name vector and demonstrates that short
// ASCII inputs are left-positioned within the 31-byte chunk and zero-padded
// on the right.
#[test]
fn test_pack_chunk_short_email_prefix_shape() {
    let mut bytes = [0; 31];
    bytes[0] = 0x65;
    bytes[1] = 0x6d;
    bytes[2] = 0x61;
    bytes[3] = 0x69;
    bytes[4] = 0x6c;

    let packed = pack_chunk(bytes);

    assert(
        packed
            == 0x00656d61696c0000000000000000000000000000000000000000000000000000
    );
}

#[test]
fn test_pack_padded_value_all_zeroes() {
    let bytes = [0; 256];
    let chunks = pack_padded_value(bytes);

    assert(chunks[0] == 0);
    assert(chunks[1] == 0);
    assert(chunks[2] == 0);
    assert(chunks[3] == 0);
    assert(chunks[4] == 0);
    assert(chunks[5] == 0);
    assert(chunks[6] == 0);
    assert(chunks[7] == 0);
    assert(chunks[8] == 0);
}

// This mirrors the single-byte value vector. It proves that value packing uses
// the same underlying chunk rule as field-name packing.
#[test]
fn test_pack_padded_value_single_byte_vector_shape() {
    let mut bytes = [0; 256];
    bytes[0] = 0x61;

    let chunks = pack_padded_value(bytes);

    assert(
        chunks[0]
            == 0x0061000000000000000000000000000000000000000000000000000000000000
    );
    assert(chunks[1] == 0);
    assert(chunks[2] == 0);
    assert(chunks[3] == 0);
    assert(chunks[4] == 0);
    assert(chunks[5] == 0);
    assert(chunks[6] == 0);
    assert(chunks[7] == 0);
    assert(chunks[8] == 0);
}

// This mirrors the "hello" value vector. Right now we are only testing the
// packing stage, not the Poseidon commitment stage.
#[test]
fn test_pack_padded_value_hello_first_chunk_vector() {
    let mut bytes = [0; 256];
    bytes[0] = 0x68;
    bytes[1] = 0x65;
    bytes[2] = 0x6c;
    bytes[3] = 0x6c;
    bytes[4] = 0x6f;

    let chunks = pack_padded_value(bytes);

    assert(
        chunks[0]
            == 0x0068656c6c6f0000000000000000000000000000000000000000000000000000
    );
    assert(chunks[1] == 0);
    assert(chunks[2] == 0);
    assert(chunks[3] == 0);
    assert(chunks[4] == 0);
    assert(chunks[5] == 0);
    assert(chunks[6] == 0);
    assert(chunks[7] == 0);
    assert(chunks[8] == 0);
}