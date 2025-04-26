# ✈️ EventGuard — Autonomous Flight Delay Refunds, Powered by Real-Time Data

> _"Travel protection that just works — automated, trustless, and fully on-chain."_

---

## 🧩 What is EventGuard?

**EventGuard** is a decentralized application (**dApp**) built on the **Flare Network** that enables **instant, on-chain refunds** for **flight delays and cancellations** — no paperwork, no call centers, no waiting.

By integrating **real-time flight data** via trusted APIs and **cross-chain payment capabilities**, EventGuard allows travelers to **buy protection**, **monitor flight status**, and **claim refunds automatically** — all governed by **tamper-proof smart contracts**.

---

## 🌍 The Problem We Solve

Flight disruptions cost travelers time, money, and peace of mind. Traditional compensation processes are:

- 🐌 **Slow** — Lengthy, manual claims and long waiting periods
- 🎲 **Inconsistent** — Varies between airlines, routes, and legal systems
- ❌ **Opaque** — Little transparency, confusing terms, endless support calls

---

## ✅ Our Solution

**EventGuard** delivers **frictionless, fully-automated flight protection**:

- ✈️ Real-time flight monitoring via trusted APIs
- 🔗 Blockchain-based logic with smart contracts
- 💸 Instant payouts in stablecoins — no intermediaries
- 🌉 Cross-chain support — **pay and claim across different blockchains**

---

## 🔧 How It Works

1. **🎫 Purchase Protection**  
   Buy a **Flight Protection Pass** using stablecoins like USDC (on Sepolia or Flare) — stored securely on-chain, linked to your wallet.

2. **📡 Real-Time Flight Monitoring**  
   EventGuard’s backend tracks your flight through a **Flight Status API** via the **Flare Data Connector (FDC)**.

3. **⚠️ Automated Disruption Detection**  
   If your flight is reported as **'Delayed'** or **'Cancelled'**, a claim becomes available immediately.

4. **💰 On-Demand, Verified Payouts**  
   With a simple click, EventGuard revalidates the flight status on-chain and triggers a **smart contract payout** directly to your wallet — in stablecoins like USDT, instantly.

---

## 🌐 Cross-Chain Magic

EventGuard isn't limited to one blockchain:

- **Multi-Chain Payments**: Buy protection using **USDC on Sepolia** (Ethereum testnet) or **FLR on Flare**.
- **Cross-Chain Claims**: Smart contracts check proofs from multiple chains using the **Flare Data Connector (FDC)**.
- **Oracles & Bridges**: Use decentralized oracles (**FTSO**) for price feeds and secure cross-chain data validation.

> _No matter where your tokens are — your protection works seamlessly._

---

## 🛠️ Tech Stack

| Layer               | Tools & Technologies                                        |
| ------------------- | ----------------------------------------------------------- |
| **Blockchain**      | Flare Network (EVM-compatible), Sepolia (ETH)               |
| **Cross-Chain**     | Flare Data Connector (FDC), Flare Time Series Oracle (FTSO) |
| **Data Feeds**      | Flight Status APIs (Real-Time Monitoring)                   |
| **Smart Contracts** | Solidity                                                    |
| **Frontend**        | React, Web3.js, WalletConnect                               |
| **Randomness**      | RandomNumberV2Interface (Random Flight IDs)                 |

---

## 🌟 Key Features

- **✈️ Verified Flight-Based Refunds**  
  Real-time disruption detection triggers instant payouts.

- **🎟️ Protection Pass NFTs**  
  Unique, on-chain passes linked to individual flights.

- **🔐 Trustless Smart Contract Logic**  
  Full transparency — no middlemen, no disputes.

- **💵 Stablecoin Payouts**  
  Refunded in USDT or other supported tokens, pegged to real-world value.

- **🌉 Seamless Cross-Chain Integration**  
  Pay and claim across Flare and Sepolia using secure FDC bridges.

- **🎲 Randomized Flight ID Assignment**  
  Fair randomness to avoid ticket manipulation.

- **📡 Real-Time Status Validation**  
  Claims only trigger if validated by official flight data.

- **🎁 Gamified Airdrops**  
  Random bonus rewards for users, fueled by Flare RNG.

---

## 🚀 Quickstart: Launch the App

### 1️⃣ Local Development (with Docker)

- **Ensure Docker is installed and running.**
- **Generate environment secrets:**

  ```bash
  sh create-secrets.sh
  ```

📌 _Be sure your `.env` files are properly configured for backend and frontend._

- **Start backend, frontend, and MongoDB services:**

  ```bash
  docker compose up
  ```

- Access the dApp at **`localhost:5173`**!

---

## 🧪 Demo Walkthrough

1. 🔗 Connect your crypto wallet
2. 🛫 Enter your flight information and purchase a Protection Pass
3. 🛰️ Backend monitors your flight in real-time
4. ⚠️ Upon disruption, UI alerts you to **Claim Refund**
5. 👆 One-click claim → smart contract verifies → **Stablecoin payout lands in your wallet**

---

## 🔭 Roadmap & Future Scope

- 🌍 Expand to global flights, including multi-leg and connecting trips
- 🚄 Add protection for trains, ferries, buses, and more
- 🤝 Partner with travel aggregators and airlines for direct integration
- 📊 Build dashboards for travelers to track claims and rewards
- 🛫 Integrate decentralized travel insurance pools

---

## 📜 License

Released under the **MIT License** — open-source and built for the community.

---

## 💬 Feedback

> _"Real-time data, cross-chain support, and smart contracts — finally, a travel protection solution built for the future."_

---

## 👨‍💻 Built With Passion

- **DavyKing** — Blockchain Developer & Smart Contract Engineer 💙

---
