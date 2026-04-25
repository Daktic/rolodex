use acir_field::FieldElement;
use bn254_blackbox_solver::poseidon2_permutation;
use serde::Serialize;

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

fn domain_hash(label: &str) -> HexField {
    // One field element per UTF-8 byte — simplest workable encoding for now.
    let inputs: Vec<FieldElement> = label
        .bytes()
        .map(|b| FieldElement::try_from(b as u128).unwrap())
        .collect();
    let hash = poseidon2_hash(&inputs);
    HexField(hash.to_be_bytes().try_into().expect("field element must be 32 bytes"))
}

fn compute_domain_constants() -> DomainConstants {
    let domain_leaf  = domain_hash("dexio.v1.leaf");
    let domain_node  = domain_hash("dexio.v1.node");
    let domain_value = domain_hash("dexio.v1.value");

    // ZERO_LEAF is the hash of a single zero field element — the canonical empty leaf.
    let zero_leaf = HexField(
        poseidon2_hash(&[FieldElement::zero()]).to_be_bytes().try_into().expect("field element must be 32 bytes"),
    );

    DomainConstants { domain_leaf, domain_node, domain_value, zero_leaf }
}

fn main() {


    let vectors = TestVectors {
        version: "dexio.v1".to_string(),
        generated_at: chrono::Utc::now().to_rfc3339(),
        generator_commit: String::from("7df89c581e495c52c11f9acd7210b2be86e6ab51"),
        vectors: Vectors {
            domain_constants: compute_domain_constants(),
        },
    };

    let json = serde_json::to_string_pretty(&vectors).unwrap();
    println!("{}", json);
}