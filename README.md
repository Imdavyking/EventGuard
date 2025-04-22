# ✈️ EventGuard – Autonomous Flight Delay Refunds Powered by Flight Status Data

> _"Travel protection that just works — automated, trustless, and on-chain."_

---

## 🧩 What is EventGuard?

**EventGuard** is a decentralized application (dApp) built on the **Flare Network** that enables **on-chain refunds** for **flight delays or cancellations** — no paperwork, no waiting, and no airline customer support needed.

By leveraging real-time **Flight API data**, EventGuard allows users to **initiate smart contract-based claims** when a flight is officially reported as **delayed** or **cancelled**.

---

## 🌍 The Problem We Solve

Flight disruptions are a major pain point for travelers. Traditional compensation processes are:

- 🐌 **Slow** — Manual claims, long response times
- 🎲 **Inconsistent** — Varies between airlines and jurisdictions
- ❌ **Opaque** — Poor communication and limited transparency

---

## ✅ Our Solution

**EventGuard** offers a **frictionless, automated verification layer for flight protection**:

- ✈️ Flight status fetched in real-time via trusted APIs
- 🤖 Smart contracts verify disruption conditions on-chain
- 🔐 Trustless and tamper-proof logic
- 💸 Cryptocurrency refunds, processed on-demand

---

## 🔧 How It Works

1. **🎫 Buy Coverage**  
   Purchase a Flight Protection Ticket that is stored on-chain and linked to your wallet.

2. **📡 Monitor Status**  
   Our backend checks real-time flight data using a reliable **Flight Status API**.

3. **⚠️ Detect Trigger**  
   If your flight is marked `'Cancelled'` or `'Delayed'`, the system allows you to **initiate a claim**.

4. **💰 On-Demand Payout**  
   You trigger the refund via the smart contract UI, which checks the flight status again and sends stablecoin compensation (e.g., USDT) to your wallet if eligible.

---

## 🛠️ Tech Stack

| Layer           | Tools & Technologies                             |
| --------------- | ------------------------------------------------ |
| **Blockchain**  | Flare Network (EVM-compatible)                   |
| **Data Feeds**  | Flight Status API via Flare Data Connector (FDC) |
| **Smart Logic** | Solidity smart contracts                         |
| **Frontend**    | React, Web3, WalletConnect                       |
| **Pricing**     | Flare Time Series Oracle (FTSO)                  |
| **Randomness**  | RandomNumberV2Interface (random flight IDs)      |
| **Extras**      | Flare RNG for gamified airdrops                  |

---

## 🌟 Features

- **✈️ Verified Flight-Based Refunds**  
  Smart contracts check real-time flight status for eligibility.

- **🎟️ Protection Passes**  
  Travelers mint a unique coverage NFT linked to their flight.

- **🔐 On-Chain Logic**  
  Transparent and secure — no trust needed in airlines or insurers.

- **💵 Stablecoin Refunds**  
  On-demand compensation using live pricing from FTSO.

- **🌐 Multi-Crypto Support**  
  Pay for protection using various tokens, thanks to FTSO oracles.

- **🎲 Random Flight IDs**  
  Uses `RandomNumberV2Interface` to generate unique flight IDs.

- **📡 Real-Time Validation**  
  FDC (Flare Data Connector) ensures refund claims are based on official flight status.

- **🎁 Gamified Airdrops**  
  Surprise rewards via Flare RNG for participating users.

---

## 🧪 Demo Walkthrough

1. 🔗 Connect wallet
2. 🛫 Enter flight details & mint a Protection NFT
3. 🛰️ System monitors flight via FDC
4. ⚠️ If status = delayed or cancelled → UI prompts "claim refund"
5. 👆 User clicks "Claim" → Smart contract validates & sends refund

---

## 🔭 Roadmap & Future Scope

- 🌍 Expand support to international and connecting flights
- 🚄 Add protection for other travel types: trains, ferries, buses
- 🤝 Partner with travel booking platforms and aggregators
- 🧾 Offer user-friendly dashboards with travel claim history

---

## 📜 License

MIT License — open-source and community-friendly.

---

## 💬 Feedback

> _“Real-time data and smart contracts enabled us to create a seamless, self-service protection tool — no call centers or paperwork, just peace of mind.”_

---

## 👨‍💻 Built By

With 💙 and obsession for frictionless UX.

- **DavyKing** — Blockchain Developer & Smart Contract Engineer
