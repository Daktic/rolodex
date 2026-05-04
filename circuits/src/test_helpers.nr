global CHUNK_BYTES: u32 = 31;
global MAX_VALUE_BYTES: u32 = 256;
global VALUE_CHUNKS: u32 = 9;

pub fn bytes31_to_field(chunk: [u8; 31]) -> Field {
    let mut acc = 0 as Field;
    for i in 0..31 {
        acc = acc * 256 + chunk[i] as Field;
    }
    acc
}

pub fn pack_field_name<const N: u32>(bytes: [u8; N]) -> Field {
    assert(N <= 31);

    let mut chunk = [0u8; 31];
    for i in 0..N {
        chunk[i] = bytes[i];
    }

    bytes31_to_field(chunk)
}

pub fn pack_value<const N: u32>(bytes: [u8; N]) -> (Field, [Field; 9]) {
    assert(N <= 256);

    let mut padded = [0u8; 279];
    for i in 0..N {
        padded[i] = bytes[i];
    }

    let mut chunks = [0 as Field; 9];
    for c in 0..9 {
        let mut chunk = [0u8; 31];
        for j in 0..31 {
            chunk[j] = padded[c * 31 + j];
        }
        chunks[c] = bytes31_to_field(chunk);
    }

    (N as Field, chunks)
}
