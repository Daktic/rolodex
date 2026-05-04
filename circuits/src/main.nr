mod field_value;

// This is still the placeholder entry circuit.
//
// We are keeping it intentionally simple while we build and verify the shared
// protocol helpers in small pieces. The real Dexio circuit logic will replace
// this once the packing, constants, hashing, and Merkle helpers are in place.
fn main(x : Field, y : pub Field) {
    assert(x != y);
}

#[test]
fn test_main() {
    main(1, 2);
}

// This test is just a crate-wiring sanity check. It tells us the helper module
// is compiled, imported correctly, and its globals are visible from the entry
// file.
#[test]
fn test_field_value_module_is_wired() {
    assert(field_value::MAX_VALUE_BYTES == 256);
    assert(field_value::CHUNK_BYTES == 31);
    assert(field_value::VALUE_CHUNKS == 9);
}

// We pin domain constants in the helper module because the spec requires them
// to be fixed protocol values. This test makes sure they are visible from the
// crate entrypoint too, not only inside the helper module.
#[test]
fn test_domain_value_constant_is_visible() {
    assert(
        field_value::DOMAIN_VALUE
            == 0x09414397eee804b030f997b616d64df0bdbe4ea9023894d429dbf089c8a437b6
    );
}

// Mirrors the published "email" field-name vector. This proves the field-name
// wrapper is using the same canonical one-chunk packing rule as the spec.
#[test]
fn test_pack_field_name_email_vector() {
    let mut bytes = [0; 31];
    bytes[0] = 0x65;
    bytes[1] = 0x6d;
    bytes[2] = 0x61;
    bytes[3] = 0x69;
    bytes[4] = 0x6c;

    let field_name = field_value::pack_field_name(bytes);

    assert(
        field_name
            == 0x00656d61696c0000000000000000000000000000000000000000000000000000
    );
}

// Mirrors the published 31-byte boundary field-name vector. This is important
// because it exercises the exact-full-chunk case, where no extra internal
// padding is introduced before packing.
#[test]
fn test_pack_field_name_boundary_31_vector() {
    let mut bytes = [0; 31];
    bytes[0] = 0x61;
    bytes[1] = 0x5f;
    bytes[2] = 0x33;
    bytes[3] = 0x31;
    bytes[4] = 0x5f;
    bytes[5] = 0x62;
    bytes[6] = 0x79;
    bytes[7] = 0x74;
    bytes[8] = 0x65;
    bytes[9] = 0x5f;
    bytes[10] = 0x66;
    bytes[11] = 0x69;
    bytes[12] = 0x65;
    bytes[13] = 0x6c;
    bytes[14] = 0x64;
    bytes[15] = 0x5f;
    bytes[16] = 0x6e;
    bytes[17] = 0x61;
    bytes[18] = 0x6d;
    bytes[19] = 0x65;
    bytes[20] = 0x5f;
    bytes[21] = 0x65;
    bytes[22] = 0x78;
    bytes[23] = 0x61;
    bytes[24] = 0x63;
    bytes[25] = 0x74;
    bytes[26] = 0x6c;
    bytes[27] = 0x79;
    bytes[28] = 0x5f;
    bytes[29] = 0x78;
    bytes[30] = 0x78;

    let field_name = field_value::pack_field_name(bytes);

    assert(
        field_name
            == 0x00615f33315f627974655f6669656c645f6e616d655f65786163746c795f7878
    );
}