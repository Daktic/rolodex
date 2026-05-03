# Dexio ZK Circuits

> **WIP** — toolchain setup and basic workflow only. Proof generation and verification steps are not yet documented.

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

### 3. Shell completions (optional)

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
