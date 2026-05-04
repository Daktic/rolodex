use std::hash::poseidon2::Poseidon2;

// DOMAIN_VALUE = poseidon2_hash(bytes_to_fes(utf8("dexio.v1.value"))) per sec. 3
global DOMAIN_VALUE: Field = 0x09414397eee804b030f997b616d64df0bdbe4ea9023894d429dbf089c8a437b6;

// value_commitment = poseidon2([DOMAIN_VALUE, value_len, chunks[0..8]]) per sec. 5.2
// value_len is the actual byte length of the canonicalized UTF-8 value (0..=256)
// value_chunks are the 9 field elements from bytes_to_fes(zero_padded_to_256(bytes))
pub fn compute_value_commitment(value_len: Field, value_chunks: [Field; 9]) -> Field {
    assert(value_len as u32 <= 256);

    let inputs: [Field; 11] = [
        DOMAIN_VALUE,
        value_len,
        value_chunks[0],
        value_chunks[1],
        value_chunks[2],
        value_chunks[3],
        value_chunks[4],
        value_chunks[5],
        value_chunks[6],
        value_chunks[7],
        value_chunks[8],
    ];
    Poseidon2::hash(inputs, 11)
}

// --- Tests ---
#[cfg(test)]
mod tests {

    use crate::field_value::compute_value_commitment;
    use crate::test_helpers::pack_value;

// value_encoding vector: short_ascii "hello" (5 bytes)
#[test]
fn test_value_commitment_hello() {
    let (value_len, chunks) = pack_value([0x68u8, 0x65u8, 0x6cu8, 0x6cu8, 0x6fu8]); // "hello"
    let commitment = compute_value_commitment(value_len, chunks);
    assert_eq(commitment, 0x145806a7910391eca546880e08095444acf659c687ee3b6662869c74d96dec88);
}

// value_encoding vector: single_byte "a" (1 byte)
#[test]
fn test_value_commitment_single_byte() {
    let (value_len, chunks) = pack_value([0x61u8]); // "a"
    let commitment = compute_value_commitment(value_len, chunks);
    assert_eq(commitment, 0x18a445aca032c1c96246b8c13046920955487eff1a830cbda10bd9d59f68b79f);
}

// value_encoding vector: empty value (0 bytes)
#[test]
fn test_value_commitment_empty() {
    let chunks: [Field; 9] = [0; 9];
    let commitment = compute_value_commitment(0, chunks);
    assert_eq(commitment, 0x07e0998d23adac9727874309e9a7f9e71990533f9f17d032e0c9c46ce9c5a7bb);
}

// value_encoding vector: unicode_nfc "cafe" NFC (5 bytes: 63 61 66 c3 a9)
#[test]
fn test_value_commitment_unicode_cafe() {
    let (value_len, chunks) = pack_value([0x63u8, 0x61u8, 0x66u8, 0xc3u8, 0xa9u8]); // "cafe" NFC
    let commitment = compute_value_commitment(value_len, chunks);
    assert_eq(commitment, 0x09b265ade3da7580e0fcef4e274dec01fe0d374a45de87cb1990736bc7a8e29b);
}

// value_encoding vector: max_length_ascii - 256 bytes of 'a' (0x61)
// 8 full chunks of 31 'a's + 1 partial chunk with 8 'a's
#[test]
fn test_value_commitment_max_length() {
    let (value_len, chunks) = pack_value([0x61u8; 256]); // 256x 'a'
    let commitment = compute_value_commitment(value_len, chunks);
    assert_eq(commitment, 0x1ae902e597d00dbe0f6aea5d49e9dcf8c11f1cbf09cb913666271eafdd31d3da);
}

// Negative: wrong value_len changes the commitment
#[test]
fn test_wrong_value_len_changes_commitment() {
    let (_, chunks) = pack_value([0x68u8, 0x65u8, 0x6cu8, 0x6cu8, 0x6fu8]); // "hello"
    let correct = compute_value_commitment(5, chunks);
    let wrong = compute_value_commitment(4, chunks);
    assert(correct != wrong);
}

// Negative: wrong chunk changes the commitment
#[test]
fn test_wrong_chunk_changes_commitment() {
    let (_, correct_chunks) = pack_value([0x68u8, 0x65u8, 0x6cu8, 0x6cu8, 0x6fu8]); // "hello"
    // Flip last byte: 'o' (0x6f) -> 'p' (0x70)
    let (_, wrong_chunks) = pack_value([0x68u8, 0x65u8, 0x6cu8, 0x6cu8, 0x70u8]); // "hellp"
    let correct = compute_value_commitment(5, correct_chunks);
    let wrong = compute_value_commitment(5, wrong_chunks);
    assert(correct != wrong);
}

// Negative: padding ambiguity is prevented because length is committed
// Two values with the same non-zero prefix but different lengths produce different commitments.
#[test]
fn test_padding_ambiguity_prevented() {
    let (_, chunks) = pack_value([0x68u8, 0x65u8, 0x6cu8, 0x6cu8, 0x6fu8]); // "hello"
    let c5 = compute_value_commitment(5, chunks);
    // Same chunks but value_len=6 - different commitment even though chunk data is identical
    let c6 = compute_value_commitment(6, chunks);
    assert(c5 != c6);
}

}
