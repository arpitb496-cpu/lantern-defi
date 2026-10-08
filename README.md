# SolKavach (सोल कवच) 🛡️

**Devnet-Exclusive Solana Pre-Sign Wallet Security & Scam Prevention Platform**

> Designed for crypto users in India and worldwide to detect honeypots, malicious permissions, and phishing attempts **BEFORE** signing any transaction. Features a bilingual interface (English / हिंदी) and a modern **Liquid Chrome** minimalist aesthetic.

---

## 🌟 Key Features

1. **Token Risk Scanner (`/scanner`)**
   - Deep inspection of SPL and Token-2022 mint accounts on Solana Devnet.
   - Evaluates:
     - Active Mint Authority (inflation / dumping risk)
     - Active Freeze Authority (funds can be locked)
     - Token-2022 Permanent Delegate (backdoor transfer capability)
     - Transfer Fees and Transfer Hook extensions
     - Holder concentration
     - On-chain metadata validity
   - Returns a composite 0–100 risk score with clear **Safe**, **Be Careful**, or **Do Not Touch** verdicts and plain-language explanations in English & Hindi.

2. **Approvals & Delegations Manager (`/approvals`)**
   - Discovers all token accounts in the connected wallet with active delegate spending approvals.
   - 1-Click Revoke action using native SPL `createRevokeInstruction` signed securely directly in the user's wallet.

3. **Pre-Sign Transaction Simulation (`/preview`)**
   - Simulates unconfirmed base64 or serialized transactions before signing.
   - Flags hazardous instructions:
     - `SetAuthority` (ownership transfer)
     - `Approve` (delegation of funds)
     - `CloseAccount` (draining balance)
   - Displays estimated SOL balance diffs and human-readable warnings.

4. **Scam Lab Sandbox (`/scam-lab`)**
   - An interactive educational playground on Solana Devnet.
   - Mint a live **Honeypot / Rigged Token** (with active freeze and permanent delegate backdoors) or a **Safe Token** (renounced authorities).
   - Test both tokens against the scanner to learn how security heuristics catch scams.

5. **Phishing & Lookalike Link Checker (`/domain-check`)**
   - Detects typo-squatting, homoglyphs, and lookalike attacks against popular Solana dApps (`phantom.app`, `jup.ag`, `raydium.io`, `solflare.com`, etc.) using Levenshtein distance algorithms.
   - Blocks known phishing patterns and dangerous TLDs.

---

## 🔒 Security Principles

- **Zero Key Handling:** Private keys or seed phrases are **never** requested, stored, or transmitted.
- **Client-Side Signing:** All transactions and revocations are signed exclusively inside the user's wallet (Phantom, Solflare, etc.).
- **Devnet Exclusive:** SolKavach is hardcoded to Solana Devnet (`https://api.devnet.solana.com`). An active guard warns and blocks interaction if a wallet attempts to connect to mainnet.
- **Educational Tool:** Built purely for educational and preventative purposes on test networks. Not financial advice.

---

## 🎨 Design System: Liquid Chrome

- **Aesthetic:** Minimalist, high-contrast dark mode with metallic "Liquid Chrome" accents.
- **Typography:**
  - Headings: `Instrument Serif` (Google Fonts) with italic emphasis
  - Body / UI: `Inter`
  - Code / Signatures / Addresses: `JetBrains Mono`
  - Hindi Headings & Body: `Noto Serif Devanagari` & `Noto Sans Devanagari`
- **Colors:**
  - Background: `#07080a` (Near-black)
  - Surface: `#0d0f12`, Surface 2: `#12151a`
  - Border: `rgba(255, 255, 255, 0.08)`
  - Desaturated Risk Accents: Safe `#34d399`, Warning `#fbbf24`, Danger `#f87171`

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Vanilla CSS Variables
- **Blockchain:**
  - `@solana/web3.js`
  - `@solana/spl-token` (SPL & Token-2022 extensions)
  - `@solana/wallet-adapter-react` & `@solana/wallet-adapter-react-ui`
- **Icons:** `lucide-react`
- **Testing:** `vitest`

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- A Solana wallet extension (e.g. [Phantom](https://phantom.app/) or [Solflare](https://solflare.com/)) set to **Devnet** mode.

### Installation

```bash
# Clone repository
git clone https://github.com/arpitb496-cpu/Solkawach.git
cd Solkawach

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🧪 Testing

Run automated unit tests for the risk scoring engine and domain checker:

```bash
npm run test
```

---

## 📄 License

MIT License. Educational and open-source for the Solana ecosystem.
