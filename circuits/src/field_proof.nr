use crate::field_value;

// Leaf opening proof helper.
//
// This function recomputes the private value commitment and leaf hash from the
// provided witness data, then checks that the reconstructed leaf matches the
// expected public commitment.
//
// Public/private visibility is declared only at the program entrypoint in
// main.nr. This helper operates only on plain arguments so it can be reused
// from tests and from the entry circuit.
pub fn prove_field_opening(
    value_len: u32,
    value_chunks: [Field; 9],
    salt: Field,
    field_name_fe: Field,
    expected_leaf: Field,
) {
    let value_commitment = field_value::compute_value_commitment(value_len, value_chunks);
    let leaf = field_value::compute_leaf(field_name_fe, value_commitment, salt);

    assert(leaf == expected_leaf);
}

#[test]
fn test_prove_field_opening_valid_simple_vector() {
    let value_chunks = [
        0x00616c696365406578616d706c652e636f6d0000000000000000000000000000,
        0x0000000000000000000000000000000000000000000000000000000000000000,
        0x0000000000000000000000000000000000000000000000000000000000000000,
        0x0000000000000000000000000000000000000000000000000000000000000000,
        0x0000000000000000000000000000000000000000000000000000000000000000,
        0x0000000000000000000000000000000000000000000000000000000000000000,
        0x0000000000000000000000000000000000000000000000000000000000000000,
        0x0000000000000000000000000000000000000000000000000000000000000000,
        0x0000000000000000000000000000000000000000000000000000000000000000,
    ];

    let salt =
        0x001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd;
    let field_name_fe =
        0x00656d61696c0000000000000000000000000000000000000000000000000000;
    let expected_leaf =
        0x10e7d3eb95070da75c64fd894176e479e18f665eddbbaafda0490ce17fca023e;

    prove_field_opening(17, value_chunks, salt, field_name_fe, expected_leaf);
}