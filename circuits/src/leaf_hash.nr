use std::hash::poseidon2::Poseidon2;
use crate::field_value::compute_value_commitment;

// DOMAIN_LEAF = poseidon2_hash(bytes_to_fes(utf8("dexio.v1.leaf"))) per sec. 3
global DOMAIN_LEAF: Field = 0x153b8a3467843421644905cfe5e191b78a92e8c8f1b0d4d7a15f45385fac7b5b;

// leaf = poseidon2([DOMAIN_LEAF, field_name_fe, value_commitment, salt]) per sec. 6.1
pub fn compute_leaf(
    field_name_fe: Field,
    value_len: Field,
    value_chunks: [Field; 9],
    salt: Field,
) -> Field {
    let value_commitment = compute_value_commitment(value_len, value_chunks);
    Poseidon2::hash([DOMAIN_LEAF, field_name_fe, value_commitment, salt], 4)
}

// Convenience variant when value_commitment is already known
pub fn compute_leaf_from_commitment(
    field_name_fe: Field,
    value_commitment: Field,
    salt: Field,
) -> Field {
    Poseidon2::hash([DOMAIN_LEAF, field_name_fe, value_commitment, salt], 4)
}

// --- Tests ---

#[cfg(test)]
mod tests {
    use crate::leaf_hash::compute_leaf;
    use crate::test_helpers::{pack_field_name, pack_value};

// leaf_hash vector: "simple" - email / "alice@example.com"
// field_name: "email" -> field_name_fe = bytes_to_fes("email")[0]
// value: "alice@example.com" = 17 bytes
// salt: TEST_SALT
#[test]
fn test_leaf_simple_email() {
    let field_name_fe = pack_field_name([0x65u8, 0x6du8, 0x61u8, 0x69u8, 0x6cu8]); // "email"
    let (value_len, value_chunks) = pack_value([
        0x61u8, 0x6cu8, 0x69u8, 0x63u8, 0x65u8, 0x40u8, // alice@
        0x65u8, 0x78u8, 0x61u8, 0x6du8, 0x70u8, 0x6cu8, 0x65u8, // example
        0x2eu8, 0x63u8, 0x6fu8, 0x6du8, // .com
    ]); // "alice@example.com"
    let salt: Field = 0x001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd;
    let leaf = compute_leaf(field_name_fe, value_len, value_chunks, salt);
    assert_eq(leaf, 0x10e7d3eb95070da75c64fd894176e479e18f665eddbbaafda0490ce17fca023e);
}

// leaf_hash vector: "unicode_value" - name / "cafe" (NFC, 5 bytes: 63 61 66 c3 a9)
#[test]
fn test_leaf_unicode_value() {
    let field_name_fe = pack_field_name([0x6eu8, 0x61u8, 0x6du8, 0x65u8]); // "name"
    let (value_len, value_chunks) = pack_value([0x63u8, 0x61u8, 0x66u8, 0xc3u8, 0xa9u8]); // "cafe" NFC
    let salt: Field = 0x001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd;
    let leaf = compute_leaf(field_name_fe, value_len, value_chunks, salt);
    assert_eq(leaf, 0x1df955579034dbfdd197760500916193492ef7f05442892d7674e970a5aba5a4);
}

// leaf_hash vector: "empty_value" - middle_name / ""
#[test]
fn test_leaf_empty_value() {
    let field_name_fe = pack_field_name([
        0x6du8, 0x69u8, 0x64u8, 0x64u8, 0x6cu8, 0x65u8, 0x5fu8, // middle_
        0x6eu8, 0x61u8, 0x6du8, 0x65u8, // name
    ]); // "middle_name"
    let value_chunks: [Field; 9] = [0; 9];
    let salt: Field = 0x001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd;
    let leaf = compute_leaf(field_name_fe, 0, value_chunks, salt);
    assert_eq(leaf, 0x1fee4a2d357d8ebc84c7b0798912d6f330b16e81458dc0d3351c5a5258caf0c3);
}

// Negative: wrong salt changes the leaf
#[test]
fn test_wrong_salt_changes_leaf() {
    let field_name_fe = pack_field_name([0x65u8, 0x6du8, 0x61u8, 0x69u8, 0x6cu8]); // "email"
    let (value_len, value_chunks) = pack_value([
        0x61u8, 0x6cu8, 0x69u8, 0x63u8, 0x65u8, 0x40u8,
        0x65u8, 0x78u8, 0x61u8, 0x6du8, 0x70u8, 0x6cu8, 0x65u8,
        0x2eu8, 0x63u8, 0x6fu8, 0x6du8,
    ]); // "alice@example.com"
    let correct_salt: Field = 0x001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd;
    let wrong_salt: Field = 0x0099887766554433221100ffeeddccbbaa998877665544332211ffeeddccbbaa;
    let correct = compute_leaf(field_name_fe, value_len, value_chunks, correct_salt);
    let wrong = compute_leaf(field_name_fe, value_len, value_chunks, wrong_salt);
    assert(correct != wrong);
}

// Negative: wrong field_name_fe changes the leaf
#[test]
fn test_wrong_field_name_changes_leaf() {
    let correct_fe = pack_field_name([0x65u8, 0x6du8, 0x61u8, 0x69u8, 0x6cu8]); // "email"
    let wrong_fe = pack_field_name([0x6eu8, 0x61u8, 0x6du8, 0x65u8]); // "name"
    let (value_len, value_chunks) = pack_value([
        0x61u8, 0x6cu8, 0x69u8, 0x63u8, 0x65u8, 0x40u8,
        0x65u8, 0x78u8, 0x61u8, 0x6du8, 0x70u8, 0x6cu8, 0x65u8,
        0x2eu8, 0x63u8, 0x6fu8, 0x6du8,
    ]); // "alice@example.com"
    let salt: Field = 0x001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd;
    let correct = compute_leaf(correct_fe, value_len, value_chunks, salt);
    let wrong = compute_leaf(wrong_fe, value_len, value_chunks, salt);
    assert(correct != wrong);
}

// Negative: wrong value witness changes the leaf
#[test]
fn test_wrong_value_witness_changes_leaf() {
    let field_name_fe = pack_field_name([0x65u8, 0x6du8, 0x61u8, 0x69u8, 0x6cu8]); // "email"
    let (value_len, correct_chunks) = pack_value([
        0x61u8, 0x6cu8, 0x69u8, 0x63u8, 0x65u8, 0x40u8,
        0x65u8, 0x78u8, 0x61u8, 0x6du8, 0x70u8, 0x6cu8, 0x65u8,
        0x2eu8, 0x63u8, 0x6fu8, 0x6du8,
    ]); // "alice@example.com"
    let wrong_chunks: [Field; 9] = [1, 0, 0, 0, 0, 0, 0, 0, 0]; // deliberately wrong
    let salt: Field = 0x001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd;
    let correct = compute_leaf(field_name_fe, value_len, correct_chunks, salt);
    let wrong = compute_leaf(field_name_fe, value_len, wrong_chunks, salt);
    assert(correct != wrong);
}

}
