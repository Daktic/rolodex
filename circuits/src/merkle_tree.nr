use std::hash::poseidon2::Poseidon2;

// DOMAIN_NODE = poseidon2_hash(bytes_to_fes(utf8("dexio.v1.node"))) per sec. 3
global DOMAIN_NODE: Field = 0x0f85b01ffd066d5b2bf7dd93e0b48e510507f45a0f41a535a94be8a4de39bc5d;

// ZERO_LEAF = poseidon2_hash(bytes_to_fes(utf8("dexio.v1.zero_leaf"))) per sec. 3 and sec. 6.2
global ZERO_LEAF: Field = 0x26890b4736acb92a52695dcb94e177c790a82b53a5876250cc8e473171d65768;

// Empty subtree constants per sec. 8.4 - ZERO_LEVEL_k = node hash of two ZERO_LEVEL_(k-1)
global ZERO_LEVEL_0: Field = 0x26890b4736acb92a52695dcb94e177c790a82b53a5876250cc8e473171d65768;
global ZERO_LEVEL_1: Field = 0x2fe4644bca561199adc160421415709c0a0df36939ede2a755527ba8b7b5622e;
global ZERO_LEVEL_2: Field = 0x1c6016c4c68d180f15d8e1d26016831a792401b16e4e649d1597f52f629d1612;
global ZERO_LEVEL_3: Field = 0x1957532edf4aa59d45beced98b4529b2385294623df3651beb9c73e0a2cfff24;
global ZERO_LEVEL_4: Field = 0x1434e9ca77d3d13d4674812463c172032ef1e356a59dec5d5c3c1b980e350cf4;
global ZERO_LEVEL_5: Field = 0x302c6dc268a4a56892c0049bbbab775c37f952ef9ca5fa6e8f2bbc5c20f538d9;
global ZERO_LEVEL_6: Field = 0x21b2549645e2ab363e27d89914699466ebac8f1d66b4c17d4a7b68418dde0868;
global ZERO_LEVEL_7: Field = 0x0da7a9659c989bf880546201c6a02c29a5b2ae33fb2e2966dc3382cd3f0386e4;

// Recompute the Merkle root from a leaf and its authentication path per sec. 9.1.
// siblings[i] = sibling hash at level i (0 = leaf level, 7 = just below root)
// directions[i] = false -> proved leaf is left child at level i
//               = true  -> proved leaf is right child at level i (per sec. 8.5)
// node = poseidon2([DOMAIN_NODE, left, right]) per sec. 8.3
pub fn compute_root_from_path(
    leaf: Field,
    siblings: [Field; 8],
    directions: [bool; 8],
) -> Field {
    let mut current = leaf;
    for i in 0..8 {
        let (left, right) = if directions[i] {
            (siblings[i], current)
        } else {
            (current, siblings[i])
        };
        current = Poseidon2::hash([DOMAIN_NODE, left, right], 3);
    }
    current
}

// Assert that the leaf is included in expected_root via the given path.
pub fn verify_merkle_path(
    leaf: Field,
    siblings: [Field; 8],
    directions: [bool; 8],
    expected_root: Field,
) {
    let computed = compute_root_from_path(leaf, siblings, directions);
    assert(computed == expected_root);
}

// --- Tests ---

// merkle_tree vector: "single_leaf" - email at slot 0, all siblings are empty-subtree constants
#[test]
fn test_single_leaf_path() {
    let leaf: Field = 0x10e7d3eb95070da75c64fd894176e479e18f665eddbbaafda0490ce17fca023e;
    let siblings: [Field; 8] = [
        ZERO_LEVEL_0,
        ZERO_LEVEL_1,
        ZERO_LEVEL_2,
        ZERO_LEVEL_3,
        ZERO_LEVEL_4,
        ZERO_LEVEL_5,
        ZERO_LEVEL_6,
        ZERO_LEVEL_7,
    ];
    let directions: [bool; 8] = [false; 8];
    let root = compute_root_from_path(leaf, siblings, directions);
    assert_eq(root, 0x2ff2b7641b87ba343f255ae5ed7502b162317165b2b34a4c664160295832c9af);
}

// merkle_tree vector: "three_fields" - email at slot 1, direction[0]=true (right child)
#[test]
fn test_three_field_path() {
    // email is slot 1 (right child of pair with company at slot 0)
    let leaf: Field = 0x10e7d3eb95070da75c64fd894176e479e18f665eddbbaafda0490ce17fca023e;
    let siblings: [Field; 8] = [
        0x25700bd66be928a8f5ef3d90f61e3f2d1cf889ca6d4a2eeef41d33a24f579e80, // company leaf (level 0)
        0x0d2e63bbab2db64a30bc60003c2e3f2ec45b9187c857b3aef036408895aee3ca, // level 1
        ZERO_LEVEL_2,
        ZERO_LEVEL_3,
        ZERO_LEVEL_4,
        ZERO_LEVEL_5,
        ZERO_LEVEL_6,
        ZERO_LEVEL_7,
    ];
    let directions: [bool; 8] = [true, false, false, false, false, false, false, false];
    let root = compute_root_from_path(leaf, siblings, directions);
    assert_eq(root, 0x29e346796a503443c51ac4639010f8255a51c9cebc5488b83bd9ed37634fbba8);
}

// Negative: wrong sibling produces a different root
#[test]
fn test_wrong_sibling_fails() {
    let leaf: Field = 0x10e7d3eb95070da75c64fd894176e479e18f665eddbbaafda0490ce17fca023e;
    let correct_siblings: [Field; 8] = [
        ZERO_LEVEL_0, ZERO_LEVEL_1, ZERO_LEVEL_2, ZERO_LEVEL_3,
        ZERO_LEVEL_4, ZERO_LEVEL_5, ZERO_LEVEL_6, ZERO_LEVEL_7,
    ];
    let mut wrong_siblings = correct_siblings;
    wrong_siblings[0] = 1; // corrupt first sibling
    let correct_root = compute_root_from_path(leaf, correct_siblings, [false; 8]);
    let wrong_root = compute_root_from_path(leaf, wrong_siblings, [false; 8]);
    assert(correct_root != wrong_root);
}

// Negative: wrong direction produces a different root
#[test]
fn test_wrong_direction_fails() {
    let leaf: Field = 0x10e7d3eb95070da75c64fd894176e479e18f665eddbbaafda0490ce17fca023e;
    let siblings: [Field; 8] = [
        ZERO_LEVEL_0, ZERO_LEVEL_1, ZERO_LEVEL_2, ZERO_LEVEL_3,
        ZERO_LEVEL_4, ZERO_LEVEL_5, ZERO_LEVEL_6, ZERO_LEVEL_7,
    ];
    let correct_directions: [bool; 8] = [false; 8];
    let wrong_directions: [bool; 8] = [true, false, false, false, false, false, false, false];
    let correct_root = compute_root_from_path(leaf, siblings, correct_directions);
    let wrong_root = compute_root_from_path(leaf, siblings, wrong_directions);
    assert(correct_root != wrong_root);
}

// Negative: wrong leaf produces a different root
#[test]
fn test_wrong_leaf_fails() {
    let correct_leaf: Field = 0x10e7d3eb95070da75c64fd894176e479e18f665eddbbaafda0490ce17fca023e;
    let wrong_leaf: Field = 0x25700bd66be928a8f5ef3d90f61e3f2d1cf889ca6d4a2eeef41d33a24f579e80;
    let siblings: [Field; 8] = [
        ZERO_LEVEL_0, ZERO_LEVEL_1, ZERO_LEVEL_2, ZERO_LEVEL_3,
        ZERO_LEVEL_4, ZERO_LEVEL_5, ZERO_LEVEL_6, ZERO_LEVEL_7,
    ];
    let correct_root = compute_root_from_path(correct_leaf, siblings, [false; 8]);
    let wrong_root = compute_root_from_path(wrong_leaf, siblings, [false; 8]);
    assert(correct_root != wrong_root);
}

// Negative: verify_merkle_path rejects wrong root
#[test(should_fail)]
fn test_wrong_root_fails() {
    let leaf: Field = 0x10e7d3eb95070da75c64fd894176e479e18f665eddbbaafda0490ce17fca023e;
    let siblings: [Field; 8] = [
        ZERO_LEVEL_0, ZERO_LEVEL_1, ZERO_LEVEL_2, ZERO_LEVEL_3,
        ZERO_LEVEL_4, ZERO_LEVEL_5, ZERO_LEVEL_6, ZERO_LEVEL_7,
    ];
    // Pass correct path but wrong expected root - should trigger the assert in verify_merkle_path
    verify_merkle_path(leaf, siblings, [false; 8], 0xdeadbeef);
}
