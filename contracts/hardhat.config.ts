import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { initKeystore } from "./utils/init.keystore";
import { extendEnvironment } from "hardhat/config";
import { createProvider } from "hardhat/internal/core/providers/construction";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";

export const wallet = initKeystore(null);

const RPC_URL = process.env.RPC_URL;
const CHAIN_ID = process.env.CHAIN_ID;
const API_URL = process.env.API_URL;
const BROWSER_URL = process.env.BROWSER_URL;
const API_SCAN_VERIFIER_KEY = process.env.API_SCAN_VERIFIER_KEY;

if (!RPC_URL) {
  throw new Error("RPC_URL is not set");
}

if (!CHAIN_ID) {
  throw new Error("CHAIN_ID is not set");
}

if (!API_URL) {
  throw new Error("API_URL is not set");
}

if (!BROWSER_URL) {
  throw new Error("BROWSER_URL is not set");
}

if (!API_SCAN_VERIFIER_KEY) {
  throw new Error(
    "API_SCAN_VERIFIER_KEY is not set, used to verify contracts on explorer"
  );
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    coston2: {
      url: process.env.RPC_URL,
      accounts: [wallet.privateKey],
      chainId: +CHAIN_ID!,
      ignition: {
        explorerUrl: process.env.CHAIN_BLOCKEXPLORER_URL,
      },
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.28",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  etherscan: {
    apiKey: {
      coston2: API_SCAN_VERIFIER_KEY,
    },
    customChains: [
      {
        network: "coston2",
        chainId: +CHAIN_ID!,
        urls: {
          apiURL: API_URL,
          browserURL: BROWSER_URL,
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
