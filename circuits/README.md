# Dexio ZK Circuits

> **WIP** — toolchain setup, basic workflow, and prover installation are documented. Proof generation and verification commands are still to be added.

Noir circuits implementing the Dexio ZK proof protocol as defined in [SPEC.md](./SPEC.md).

## Toolchain Setup

### 1. Install noirup

```bash
curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash
```

Restart your terminal after installation.

### 2. Install nargo

```bash
noirup
```

This installs the latest version of `nargo`, the Noir package manager and toolchain.

### 3. Install bbup (Barretenberg prover)

```bash
curl -L https://raw.githubusercontent.com/AztecProtocol/aztec-packages/refs/heads/next/barretenberg/bbup/install | bash
```

Restart your terminal after installation, then run:

```bash
bbup
```

This installs `bb`, the Barretenberg backend used to generate and verify proofs.

### 4. Shell completions (optional)

See the [Noir shell completions docs](https://noir-lang.org/docs/tooling/shell_completions) for setup instructions.

## Basic Workflow

### Check

```bash
nargo check
```

Validates the circuit and generates `Prover.toml` if it does not already exist. `Prover.toml` defines the private inputs required by the circuit.

### Test

```bash
nargo test
```

Runs the unit tests defined in `src/main.nr`.

### Execute

```bash
nargo execute
```

Executes the circuit against the inputs in `Prover.toml` and generates the witness file in `target/`. The witness is required for proof generation.

### Generate a proof

After running `nargo execute` to produce the witness:

```bash
bb prove -b ./target/dexio.json -w ./target/dexio.gz --write_vk -o target
```

This generates the proof and verification key, writing both to `target/`.

### Verify a proof

```bash
bb verify -p ./target/proof -k ./target/vk
```

Verifies the proof against the verification key. The witness is not required for verification.

## Project Structure

```
circuits/
├── src/
│   └── main.nr       # Circuit source
├── Nargo.toml        # Package manifest
├── Prover.toml       # Private inputs (gitignored)
├── target/           # Compiled artifacts and witness (gitignored)
└── SPEC.md           # Cryptographic protocol specification
```
