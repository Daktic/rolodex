# Rolodex

**A private, verifiable way to exchange contact information in person.**

---

## What is Rolodex?

Rolodex is a private contact exchange protocol. Meet someone, tap phones, and both keep a cryptographically verified record of what was shared. No typing. No business cards. No uploading your contacts to someone else's server.

Instead of trusting a platform to manage your professional network, Rolodex stores everything locally on your device. After connecting, it becomes a personal CRM—you can add notes, relationships, and context about the people you meet. Your network stays private unless you explicitly choose to prove a connection.

### Why this exists

Ever been to a conference, swapped Telegrams, and taken a photo together with a caption like "Ben from the corpo mixer"? How helpful is that the next day? What about a week later? A month?

Rolodex solves this. Create custom profiles to share different subsets of your identity with a tap. Met someone at a hackathon? Share your GitHub and Telegram. Networking at a industry event? Share your LinkedIn and email. Later, annotate those contacts—"Works at Acme Corp", "Met at ETH Denver", "Introduced by Sarah"—and build a CRM layer for your personal contact book.

All connections and data stay private on your device. You can choose to prove a connection later if needed, but by default, your network is yours alone.

---

## Principles

### Private by default
Your connections are stored only on your device and the devices of people you've connected with. Neither party can forge or tamper with what was shared, only prove the exchange happened.

### Local-first
Your network lives on your device. No central server. No database you don't control. You own your connections.

### Verifiable
Every connection is cryptographically signed. You can prove you received someone's information, when you received it, and that it hasn't been tampered with—without revealing the underlying data.

### Open source
The app and the protocol are fully public. You can audit the code, contribute improvements, or build compatible tools.

---

## How it works

### Identity
Each user has a cryptographic identity — a keypair that proves you are you across all connections. This identity doesn't contain personal information. It's just a way to verify that the contact information you received actually came from the person you met.

### The connection payload
When two people connect, they exchange a signed payload containing the contact information they choose to share. You might share your email and Telegram with one person, just your LinkedIn with another.

**Fields are dynamic.** You choose what to share at connection time—Telegram, email, phone, LinkedIn, or any custom field. Each exchange is cryptographically signed, binding together what was shared, who shared it, who received it, and when. This makes the connection verifiable and prevents someone from replaying or tampering with your information.

### Local CRM graph
After connecting, you can privately annotate:
- **Nodes**: People, companies, events
- **Edges**: "works at", "met at", "introduced by", "knows"
- **Notes**: Freeform text

### Zero-knowledge proofs (future)
You can prove a connection occurred—who, what, and when—by sharing the signed payload. Future research will explore selective disclosure: proving you know someone's email or that two identities connected without revealing the full exchange.

---

## Technical architecture

### Stack
- **React Native (TypeScript)** – iOS and Android mobile app
- **SQLite** (expo-sqlite or op-sqlite) – Local graph storage
- **NFC + QR codes** – Connection exchange transport
- **Cryptographic signing** – EVM-compatible keypairs (via viem/ethers.js)
- **W3C Verifiable Credentials** – Credential formatting standard

### Data model
```
Profile {
  id: string
  displayName: string
  createdAt: number
  fields: ProfileField[]
}

ProfileField {
  id: string
  label: string
  value: string
  shareByDefault: boolean
}

Connection {
  id: string
  connectedAt: number
  sharedCard: ReceivedCard
  annotations: Annotation[]
}

ReceivedCard {
  displayName: string
  fields: { [key: string]: string }
  issuer: string
}

Annotation {
  id: string
  type: 'person' | 'company' | 'event' | 'relationship' | 'note'
  label: string
  value: string
  createdAt: number
}
```

### Protocol compatibility
- **W3C Verifiable Credentials** – Payload envelope follows VC standards

---

## Development roadmap

### Phase 1: Core exchange (v1.0)
Building the foundational mobile app and connection exchange flow.

**Screens**
- [ ] Onboarding / Profile Setup
- [ ] My Card (your shareable profile)
- [ ] Connections List
- [ ] Connection Detail (received card + CRM annotations)
- [ ] Add Annotation (modal)

**Features**
- [ ] Local profile creation with dynamic shareable fields
- [ ] Wallet-based identity (generated locally)
- [ ] Signed payload generation and verification
- [ ] NFC + QR connection exchange
- [ ] Local SQLite graph storage
- [ ] Basic CRM annotation UI

**Milestone**: Two users can exchange contact information in person and view/annotate connections locally.

---

## Contributing

Rolodex is open source. We're building in public to provide transparency and demonstrate our technical approach.

We welcome community input. Feel free to:
- Open issues for bugs or feature suggestions
- Submit pull requests for fixes or improvements
- Build compatible tools using the protocol spec (coming soon)

All contributions are subject to review and must align with the project's principles and roadmap.
