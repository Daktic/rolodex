mod field_value;
mod leaf_hash;
mod merkle_tree;
#[cfg(test)]
mod test_helpers;

use crate::leaf_hash::compute_leaf;

// Leaf opening proof (milestone: sec. 6.1 leaf layer)
//
// Public inputs:
//   field_name_fe    - bytes_to_fes(utf8(field_name))[0] per sec. 4.3
//   expected_leaf    - the committed leaf value from the Merkle tree
//
// Private inputs:
//   value_len        - byte length of the canonicalized UTF-8 value (0..=256)
//   value_chunks     - 9 field elements from bytes_to_fes(zero_pad_to_256(value)) per sec. 5.2
//   salt             - one Field element per sec. 7
//
// Proves: "I know value_len, value_chunks, salt such that
//          poseidon2([DOMAIN_LEAF, field_name_fe, poseidon2([DOMAIN_VALUE, value_len, chunks...]), salt])
//          == expected_leaf"
fn main(
    field_name_fe: pub Field,
    expected_leaf: pub Field,
    value_len: Field,
    value_chunks: [Field; 9],
    salt: Field,
) {
    let leaf = compute_leaf(field_name_fe, value_len, value_chunks, salt);
    assert(leaf == expected_leaf);
}

// --- Tests ---

#[cfg(test)]
mod tests {
    use super::main;
    use crate::test_helpers::{pack_field_name, pack_value};

// Valid: leaf opening for email / "alice@example.com" (vector: leaf_hash "simple")
#[test]
fn test_main_email_simple() {
    let field_name_fe = pack_field_name([0x65u8, 0x6du8, 0x61u8, 0x69u8, 0x6cu8]); // "email"
    let expected_leaf: Field = 0x10e7d3eb95070da75c64fd894176e479e18f665eddbbaafda0490ce17fca023e;
    let (value_len, value_chunks) = pack_value([
        0x61u8, 0x6cu8, 0x69u8, 0x63u8, 0x65u8, 0x40u8,
        0x65u8, 0x78u8, 0x61u8, 0x6du8, 0x70u8, 0x6cu8, 0x65u8,
        0x2eu8, 0x63u8, 0x6fu8, 0x6du8,
    ]); // "alice@example.com"
    let salt: Field = 0x001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd;
    main(field_name_fe, expected_leaf, value_len, value_chunks, salt);
}

// Valid: leaf opening for name / "cafe" (NFC, vector: leaf_hash "unicode_value")
#[test]
fn test_main_unicode_value() {
    let field_name_fe = pack_field_name([0x6eu8, 0x61u8, 0x6du8, 0x65u8]); // "name"
    let expected_leaf: Field = 0x1df955579034dbfdd197760500916193492ef7f05442892d7674e970a5aba5a4;
    let (value_len, value_chunks) = pack_value([0x63u8, 0x61u8, 0x66u8, 0xc3u8, 0xa9u8]); // "cafe" NFC
    let salt: Field = 0x001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd;
    main(field_name_fe, expected_leaf, value_len, value_chunks, salt);
}

// Valid: leaf opening for middle_name / "" (vector: leaf_hash "empty_value")
#[test]
fn test_main_empty_value() {
    let field_name_fe = pack_field_name([
        0x6du8, 0x69u8, 0x64u8, 0x64u8, 0x6cu8, 0x65u8, 0x5fu8,
        0x6eu8, 0x61u8, 0x6du8, 0x65u8,
    ]); // "middle_name"
    let expected_leaf: Field = 0x1fee4a2d357d8ebc84c7b0798912d6f330b16e81458dc0d3351c5a5258caf0c3;
    let value_chunks: [Field; 9] = [0; 9];
    let salt: Field = 0x001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd;
    main(field_name_fe, expected_leaf, 0, value_chunks, salt);
}

// Invalid: wrong salt - assert(leaf == expected_leaf) must fail
#[test(should_fail)]
fn test_main_wrong_salt_fails() {
    let field_name_fe = pack_field_name([0x65u8, 0x6du8, 0x61u8, 0x69u8, 0x6cu8]); // "email"
    let expected_leaf: Field = 0x10e7d3eb95070da75c64fd894176e479e18f665eddbbaafda0490ce17fca023e;
    let (value_len, value_chunks) = pack_value([
        0x61u8, 0x6cu8, 0x69u8, 0x63u8, 0x65u8, 0x40u8,
        0x65u8, 0x78u8, 0x61u8, 0x6du8, 0x70u8, 0x6cu8, 0x65u8,
        0x2eu8, 0x63u8, 0x6fu8, 0x6du8,
    ]); // "alice@example.com"
    let wrong_salt: Field = 0x0099887766554433221100ffeeddccbbaa998877665544332211ffeeddccbbaa;
    main(field_name_fe, expected_leaf, value_len, value_chunks, wrong_salt);
}

// Invalid: wrong field_name_fe - assert(leaf == expected_leaf) must fail
#[test(should_fail)]
fn test_main_wrong_field_name_fails() {
    let wrong_field_name_fe = pack_field_name([0x6eu8, 0x61u8, 0x6du8, 0x65u8]); // "name" (not "email")
    let expected_leaf: Field = 0x10e7d3eb95070da75c64fd894176e479e18f665eddbbaafda0490ce17fca023e; // email leaf
    let (value_len, value_chunks) = pack_value([
        0x61u8, 0x6cu8, 0x69u8, 0x63u8, 0x65u8, 0x40u8,
        0x65u8, 0x78u8, 0x61u8, 0x6du8, 0x70u8, 0x6cu8, 0x65u8,
        0x2eu8, 0x63u8, 0x6fu8, 0x6du8,
    ]); // "alice@example.com"
    let salt: Field = 0x001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd;
    main(wrong_field_name_fe, expected_leaf, value_len, value_chunks, salt);
}

// Invalid: wrong value chunk - assert(leaf == expected_leaf) must fail
#[test(should_fail)]
fn test_main_wrong_chunk_fails() {
    let field_name_fe = pack_field_name([0x65u8, 0x6du8, 0x61u8, 0x69u8, 0x6cu8]); // "email"
    let expected_leaf: Field = 0x10e7d3eb95070da75c64fd894176e479e18f665eddbbaafda0490ce17fca023e;
    let wrong_chunks: [Field; 9] = [1, 0, 0, 0, 0, 0, 0, 0, 0]; // deliberately wrong
    let salt: Field = 0x001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd;
    main(field_name_fe, expected_leaf, 17, wrong_chunks, salt);
}

// Invalid: wrong value_len - assert(leaf == expected_leaf) must fail
#[test(should_fail)]
fn test_main_wrong_value_len_fails() {
    let field_name_fe = pack_field_name([0x65u8, 0x6du8, 0x61u8, 0x69u8, 0x6cu8]); // "email"
    let expected_leaf: Field = 0x10e7d3eb95070da75c64fd894176e479e18f665eddbbaafda0490ce17fca023e;
    let (_, value_chunks) = pack_value([
        0x61u8, 0x6cu8, 0x69u8, 0x63u8, 0x65u8, 0x40u8,
        0x65u8, 0x78u8, 0x61u8, 0x6du8, 0x70u8, 0x6cu8, 0x65u8,
        0x2eu8, 0x63u8, 0x6fu8, 0x6du8,
    ]); // "alice@example.com"
    let salt: Field = 0x001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd;
    main(field_name_fe, expected_leaf, 16, value_chunks, salt); // wrong length (17 -> 16)
}

// Invalid: wrong expected_leaf - assert(leaf == expected_leaf) must fail
#[test(should_fail)]
fn test_main_wrong_expected_leaf_fails() {
    let field_name_fe = pack_field_name([0x65u8, 0x6du8, 0x61u8, 0x69u8, 0x6cu8]); // "email"
    let wrong_expected_leaf: Field = 0x1fee4a2d357d8ebc84c7b0798912d6f330b16e81458dc0d3351c5a5258caf0c3; // empty_value leaf
    let (value_len, value_chunks) = pack_value([
        0x61u8, 0x6cu8, 0x69u8, 0x63u8, 0x65u8, 0x40u8,
        0x65u8, 0x78u8, 0x61u8, 0x6du8, 0x70u8, 0x6cu8, 0x65u8,
        0x2eu8, 0x63u8, 0x6fu8, 0x6du8,
    ]); // "alice@example.com"
    let salt: Field = 0x001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd;
    main(field_name_fe, wrong_expected_leaf, value_len, value_chunks, salt);
}

}
