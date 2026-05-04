mod field_proof;
mod field_value;

// ZK entry circuit.
//
// Proves knowledge of a private Dexio leaf opening without revealing the hidden
// value or salt.
//
// Private inputs:
// - value_len
// - value_chunks
// - salt
//
// Public inputs:
// - field_name_fe
// - expected_leaf
fn main(
    value_len: u32,
    value_chunks: [Field; 9],
    salt: Field,
    field_name_fe: pub Field,
    expected_leaf: pub Field,
) {
    field_proof::prove_field_opening(
        value_len,
        value_chunks,
        salt,
        field_name_fe,
        expected_leaf,
    );
}