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
    // Pack UTF-8 bytes big-endian, 31 bytes per field element (§4.1, §6.1).
    const CHUNK_BYTES: usize = 31;
    let inputs: Vec<FieldElement> = label
        .as_bytes()
        .chunks(CHUNK_BYTES)
        .map(|chunk| {
            // Right-align chunk in a 32-byte buffer so it reads as a big-endian integer.
            let mut buf = [0u8; 32];
            buf[32 - chunk.len()..].copy_from_slice(chunk);
            FieldElement::from_be_bytes_reduce(&buf)
        })
        .collect();
    let hash = poseidon2_hash(&inputs);
    HexField(hash.to_be_bytes().try_into().expect("field element must be 32 bytes"))
}

fn compute_domain_constants() -> DomainConstants {
    let domain_leaf  = domain_hash("dexio.v1.leaf");
    let domain_node  = domain_hash("dexio.v1.node");
    let domain_value = domain_hash("dexio.v1.value");
    let zero_leaf    = domain_hash("dexio.v1.zero_leaf");

    DomainConstants { domain_leaf, domain_node, domain_value, zero_leaf }
}

fn main() {
    // Get the current git commit hash at runtime
    let git_shaw = String::from_utf8(
        std::process::Command::new("git")
            .args(["rev-parse", "HEAD"])
            .output()
            .unwrap()
            .stdout
    ).unwrap().trim().to_string();


    let vectors = TestVectors {
        version: "dexio.v1".to_string(),
        generated_at: chrono::Utc::now().to_rfc3339(),
        generator_commit: git_shaw,
        vectors: Vectors {
            domain_constants: compute_domain_constants(),
        },
    };

    let json = serde_json::to_string_pretty(&vectors).unwrap();
    println!("{}", json);
}